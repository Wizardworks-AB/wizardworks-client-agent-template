/**
 * Shared state for the workflow hooks (flow-mode, flow-track, flow-guard, flow-gate).
 *
 * One JSON file per repository, keyed by session id, inside the repo's own
 * .git — a location the repo owner already controls. Never a shared temp
 * directory: a predictable name there is a symlink write-through waiting to
 * happen, and a planted file silences the guardrail.
 *
 * Every function here fails soft: a missing, unreadable or malformed state is
 * an empty state, and a failed write is ignored. The callers decide what that
 * means — the observer shrugs, the gates fail open.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const STATE_FILE = 'fae-flow-state.json';
const MAX_BYTES = 256 * 1024;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/** Flow modes a session can be in. */
const MODES = { FEATURE: 'feature' };

/** Documentation and metadata — never treated as source. */
const NOT_CODE =
  /(^|[\\/])(\.git|node_modules|dist|bin|obj)[\\/]|\.(md|mdx|txt|rst|json5|typ|drawio)$|(^|[\\/])(README|CHANGELOG|LICENCE|LICENSE|CONTRIBUTING)(\.[\w]+)?$/i;

/**
 * Paths on the security-sensitive surface — the list in rules/workflow.md that
 * decides whether the security review runs. Broad on purpose: a false positive
 * costs one extra review, a false negative skips it.
 */
const SURFACE = [
  /(^|[\\/])(auth|authn|authz|identity|login|oauth|permissions?|roles?)([\\/]|[._-])/i,
  /(secret|credential|token|apikey|api[-_]key|password|keyvault|vault)/i,
  /(^|[\\/])(migrations?|schema)([\\/]|[._-])/i,
  /\.(tf|tfvars|bicep)$/i,
  /(^|[\\/])(Dockerfile|docker-compose[^\\/]*|\.github[\\/]workflows|pipelines?)([\\/]|$)/i,
  /(^|[\\/])(package\.json|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|.*\.csproj|Directory\.Packages\.props|requirements\.txt|go\.mod|Cargo\.toml)$/i,
  /(tenant|multi[-_]?tenant|isolation)/i,
];

/** Commands that count as running the project's tests — the observable proxy
 *  for "verified locally". */
const TEST_RUNNERS =
  /\b(dotnet\s+test|npm\s+(run\s+)?test|npx\s+(vitest|jest|playwright|mocha)|yarn\s+test|pnpm\s+test|pytest|python\s+-m\s+pytest|go\s+test|cargo\s+test|node\s+--test|mvn\s+test|gradle\s+test|rspec|phpunit)\b/;

/** Default branches: writing source here in the main checkout is the thing the
 *  worktree rule exists to prevent. */
const DEFAULT_BRANCHES = new Set(['main', 'master', 'trunk', 'develop']);

const DEFAULT_BRANCH_LIST = [...DEFAULT_BRANCHES];

function isCode(filePath) {
  return typeof filePath === 'string' && !NOT_CODE.test(filePath);
}

function onSurface(filePath) {
  return SURFACE.some((re) => re.test(filePath));
}

function isTestRun(command) {
  return typeof command === 'string' && TEST_RUNNERS.test(command);
}

/**
 * A hook event raised by a tool call made inside a subagent carries
 * `agent_type` (and `agent_id`); the main conversation's calls carry neither.
 * The session id is the same for both, which is why this is the discriminator.
 */
function fromAgent(event) {
  return Boolean(event && typeof event.agent_type === 'string' && event.agent_type);
}

/** In-place editors and patch tools: the command writes whatever it names. */
const INPLACE_EDIT = /\b(sed|perl)\s+(?:-\S+\s+)*-[A-Za-z]*i\b|\bsed\s+(?:\S+\s+)*--in-place\b|\bgit\s+apply\b|(^|[\s;&|])patch\s+/;
/** Inline programs that write files (python heredocs, node -e, ...). */
const SCRIPTED_WRITE = /write_text\s*\(|write_bytes\s*\(|writeFileSync\s*\(|writeFile\s*\(|appendFileSync\s*\(|\bopen\s*\([^)]*,\s*['"][wa]/;
/** Redirects and tee: `> target`, `>> target`, `tee [-a] target`. */
const REDIRECT = /(?:^|[^<>&\d=-])>{1,2}\s*(["']?)([^\s"'|;&<>]+)\1|\btee\s+(?:-\S+\s+)*(["']?)([^\s"'|;&<>]+)\3/g;
/** Scratch locations and by-products — never source, whatever the name. */
const SCRATCH_TARGET = /^(\/tmp\/|\/private\/|\/var\/folders\/|\$\{?(TMPDIR|TMP|TEMP|SCRATCH))|\.(patch|diff|log|out)$/i;

/**
 * Does this shell command write a source file? Returns a short description of
 * the write it found, or null. Heuristic on purpose — it exists to catch the
 * obvious ways of editing source from a shell (sed -i, a python heredoc that
 * rewrites files, `cat > file`), not to sandbox the shell. Documentation and
 * non-file targets never count; `isCode` decides what is source.
 */
function bashSourceWrite(command) {
  if (typeof command !== 'string') return null;
  if (INPLACE_EDIT.test(command)) return 'an in-place edit (sed -i / perl -i / patch)';
  if (SCRIPTED_WRITE.test(command)) return 'an inline script that writes files';
  for (const m of command.matchAll(REDIRECT)) {
    const target = m[2] ?? m[4];
    if (!target || target.startsWith('&') || target.startsWith('/dev/') || SCRATCH_TARGET.test(target)) continue;
    if (isCode(target)) return `a redirect into ${target}`;
  }
  return null;
}

/**
 * Git facts for a directory, in ONE spawn. `-C` with cwd outside the repo: on
 * Windows a bare command name is searched in the current directory before
 * PATH, so running inside a repo the agent is editing would let a committed
 * git.exe run on every write. Inherited GIT_* discovery variables are cleared
 * so a session launched from a git hook cannot redirect what we resolve.
 *
 * Returns { branch, topLevel, gitDir, commonDir, isLinkedWorktree } or null.
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
  const lines = r.stdout.trim().split('\n');
  if (lines.length !== 4 || lines.some((l) => !l)) return null;
  const [branch, topLevel, gitDirRaw, commonDirRaw] = lines;

  // git prints --git-dir and --git-common-dir relative to the directory it ran
  // in (the -C target), NOT the top level. Resolve against the -C dir first
  // and the top level second, and accept only a path that exists.
  const resolveExisting = (p) => {
    for (const base of [dir, topLevel]) {
      const c = path.resolve(base, p);
      if (fs.existsSync(c)) return c;
    }
    return null;
  };
  const gitDir = resolveExisting(gitDirRaw);
  const commonDir = resolveExisting(commonDirRaw);
  if (!gitDir || !commonDir) return null;

  return { branch, topLevel, gitDir, commonDir, isLinkedWorktree: gitDir !== commonDir };
}

function statePath(commonDir) {
  return path.join(commonDir, STATE_FILE);
}

function readState(commonDir) {
  const file = statePath(commonDir);
  try {
    if (fs.statSync(file).size > MAX_BYTES) return {};
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return prune(parsed);
  } catch {
    /* absent or unusable */
  }
  return {};
}

function writeState(commonDir, state) {
  try {
    fs.writeFileSync(statePath(commonDir), JSON.stringify(state), { encoding: 'utf8', mode: 0o600 });
    return true;
  } catch {
    return false;
  }
}

function prune(state) {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [key, entry] of Object.entries(state)) {
    if (!entry || typeof entry !== 'object' || Number(entry.ts) < cutoff) delete state[key];
  }
  return state;
}

function freshEntry() {
  return {
    mode: null, // 'feature' | null
    code: [], // source files written this session (absolute)
    surface: false, // any of them on the security-sensitive surface
    agents: [], // subagent_types spawned
    todo: false, // TodoWrite seen
    lastCode: 0, // ts of the most recent source write
    lastVerify: 0, // ts of the most recent test run
    gateBlocks: 0, // times the Stop gate has blocked this session (loop guard)
    ts: Date.now(),
  };
}

/** Get (creating if needed) this session's entry; returns { state, entry }. */
function session(state, sessionId) {
  const entry = (state[sessionId] ??= freshEntry());
  // Older entries may predate a field — fill in without clobbering.
  for (const [k, v] of Object.entries(freshEntry())) if (!(k in entry)) entry[k] = v;
  entry.ts = Date.now();
  return entry;
}

function readEvent() {
  try {
    const raw = fs.readFileSync(0, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

module.exports = {
  STATE_FILE,
  MODES,
  DEFAULT_BRANCHES,
  DEFAULT_BRANCH_LIST,
  isCode,
  onSurface,
  isTestRun,
  fromAgent,
  bashSourceWrite,
  gitFacts,
  statePath,
  readState,
  writeState,
  session,
  readEvent,
};
