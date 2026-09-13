#!/usr/bin/env node

/**
 * Worktree guard.
 *
 * The /feature flow and rules/git-workflow.md require feature work to happen in
 * a dedicated git worktree on a feature branch — never in the shared main
 * checkout, where concurrent agent sessions overwrite each other's uncommitted
 * work.
 *
 * This check warns, once per session, when a source file is written in the MAIN
 * checkout while HEAD is a default branch. It never blocks: some writes on the
 * default branch are legitimate (docs, a hotfix the user asked for, and
 * /update-template committing the template itself), so the agent is told and
 * decides.
 *
 * Usage: node check-worktree.js <file-path> [session-id]
 *   exit 0 — nothing to say
 *   exit 1 + stderr — warning, fed back to the agent by dispatch.js
 *
 * dispatch.js passes the session id from the hook event when the host provides
 * one. Without it the guard falls back to a time window, so it still cannot nag
 * on every write.
 *
 * Fail-open: any error (no git, detached HEAD, unwritable state) exits 0. A
 * broken guardrail must never stop the agent working.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const DEFAULT_BRANCHES = new Set(['main', 'master', 'trunk', 'develop']);

// Fallback quiet window when the host gives us no session id.
const QUIET_MS = 4 * 60 * 60 * 1000;

// Paths that are legitimately edited on the default branch, so the guard stays
// out of the way. Separator class covers Windows paths too.
//   - VCS/dependency dirs: never feature work.
//   - The agent template itself: /update-template writes and COMMITS .claude/**
//     and fae-template.json in the main checkout by design (see
//     commands/update-template.md) — warning there is a guaranteed false hit.
//   - Docs: only real doc files, by extension, so a source file that happens to
//     be named License.cs or readme.ts is still guarded.
const EXEMPT = new RegExp(
  [
    '(^|[\\\\/])(\\.git|node_modules)[\\\\/]',
    '(^|[\\\\/])\\.claude[\\\\/]',
    '(^|[\\\\/])fae-template\\.json$',
    '(^|[\\\\/])(README|CHANGELOG|LICENCE|LICENSE|CONTRIBUTING)(\\.(md|txt|rst))?$',
    '\\.(md|mdx|txt|rst)$',
  ].join('|'),
  'i'
);

/**
 * One git call for everything we need.
 *
 * The target repo is passed as data (`-C`) and cwd is set OUTSIDE it: on
 * Windows a bare command name is searched in the current directory before
 * PATH, so running with cwd inside a repo the agent is editing would let a
 * committed git.exe run on every write. Inherited GIT_* discovery variables
 * are cleared so a session launched from inside a git hook cannot redirect
 * what we resolve.
 */
function gitFacts(dir) {
  const env = { ...process.env };
  for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY']) {
    delete env[key];
  }
  const r = spawnSync(
    'git',
    ['-C', dir, '--no-optional-locks', 'rev-parse', '--abbrev-ref', 'HEAD', '--show-toplevel', '--git-dir', '--git-common-dir'],
    { cwd: os.tmpdir(), env, encoding: 'utf8', timeout: 2000, windowsHide: true }
  );
  if (r.error || r.status !== 0) return null;
  // Exactly four lines, or the contract we are destructuring does not hold —
  // git prints paths raw, so a directory name containing a newline would
  // otherwise shift every field.
  const lines = r.stdout.trim().split('\n');
  if (lines.length !== 4 || lines.some((l) => !l)) return null;
  const [branch, topLevel, gitDir, commonDir] = lines;
  return { branch, topLevel, gitDir, commonDir };
}

function main() {
  const filePath = process.argv[2];
  const sessionId = process.argv[3] || '';
  if (!filePath || EXEMPT.test(filePath)) return 0;

  // dispatch.js only invokes checks for files that exist, so this normally
  // resolves to the file's own directory. The cwd fallback is defence in depth
  // for any future wiring that runs the check before the write lands.
  const dir = fs.existsSync(filePath) ? path.dirname(path.resolve(filePath)) : process.cwd();

  const facts = gitFacts(dir);
  if (!facts) return 0;
  const { branch, topLevel, gitDir, commonDir } = facts;
  if (branch === 'HEAD' || !DEFAULT_BRANCHES.has(branch)) return 0;

  // A linked worktree's git-dir is <main>/.git/worktrees/<name> while its
  // common-dir is <main>/.git; in the main checkout the two are the same.
  // git returns these relative to cwd on git >= 2.31 and relative to the
  // top level before that, so accept a match against either base.
  // Known limitation: a submodule checkout also has a distinct git-dir, so it
  // is treated as isolated and never warned.
  const gitDirAbs = path.resolve(dir, gitDir);
  const commonAbsFromDir = path.resolve(dir, commonDir);
  const commonAbsFromTop = path.resolve(topLevel, commonDir);
  if (gitDirAbs !== commonAbsFromDir && gitDirAbs !== commonAbsFromTop) return 0;

  // Marker lives in the repo's own .git — a location the repo owner already
  // controls. It must NOT go in os.tmpdir(): a predictable name in a shared,
  // world-writable directory lets anyone pre-place a symlink there and have
  // this hook truncate whatever it points at, and lets them silence the guard
  // by planting a fresh file.
  const marker = path.join(commonAbsFromDir, 'fae-worktree-guard.json');
  const stamp = sessionId || '-';
  let state = {};
  try {
    // Anything that is not a small plain object is treated as "not warned yet"
    // and replaced. Valid-but-wrong JSON (a number, a string, an array) would
    // otherwise silently refuse every update and make the guard warn on every
    // single write forever; an oversized file would be re-read and re-written
    // on each one.
    if (fs.statSync(marker).size <= 64 * 1024) {
      const parsed = JSON.parse(fs.readFileSync(marker, 'utf8'));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) state = parsed;
    }
  } catch {
    state = {}; // absent, unreadable or malformed — treat as "not warned yet"
  }
  const seen = state[branch];
  if (seen && typeof seen === 'object') {
    // With a session id, warn once per session. Without one, fall back to a
    // time window so the guard cannot nag on every write.
    if (sessionId && seen.session === sessionId) return 0;
    if (!sessionId && seen.session === '-' && Date.now() - Number(seen.ts) < QUIET_MS) return 0;
  }

  process.stderr.write(
    `Worktree guard: you are writing source in the MAIN checkout on '${branch}'.\n` +
      `Feature work belongs in its own git worktree on a feature branch — the shared\n` +
      `checkout is used by concurrent agent sessions and uncommitted work there is lost.\n` +
      `\n` +
      `  git worktree add ../<repo>-<feature-slug> -b feature/<feature-slug> ${branch}\n` +
      `\n` +
      `Commit any applied-but-untracked agent template files first: a worktree\n` +
      `materializes only TRACKED files, so an uncommitted template (rules, hooks,\n` +
      `commands, fae-template.json) silently disappears in the new worktree.\n` +
      `If this write is intentional on '${branch}', continue — this warning will not repeat.\n`
  );

  // Written only after the warning actually reached the agent, so a crash or a
  // dispatcher timeout re-warns rather than silently swallowing the guard.
  try {
    state[branch] = { session: stamp, ts: Date.now() };
    fs.writeFileSync(marker, JSON.stringify(state), { encoding: 'utf8', mode: 0o600 });
  } catch {
    // Unwritable .git — the warning was still delivered; it may simply repeat.
  }
  return 1;
}

try {
  process.exit(main());
} catch {
  process.exit(0); // fail open — a guardrail must never stop the agent working
}
