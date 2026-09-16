#!/usr/bin/env node

/**
 * Worktree local config (AB#3167).
 *
 * `git worktree add` materializes tracked files only. The gitignored local
 * configuration a developer relies on to RUN the app — .env.local,
 * appsettings.Development.json, local.settings.json, the agent's own
 * .claude/settings.local.json — stays behind in the main checkout, and the
 * agent in the new worktree either cannot verify its change or reconstructs the
 * config by hand. This script copies an explicit set of such files from the
 * source checkout into the worktree.
 *
 * Which files:
 *   - the universal set below (agent settings and dotenv files),
 *   - each selected stack's `localConfig` list in .claude/hooks/stacks/<stack>.json,
 *   - the project's own .claude/local-config.json: { "include": [...], "exclude": [...] }.
 * Patterns: '**' crosses directories, '*' stays within one segment; a pattern
 * without '/' matches a file name at any depth (like .gitignore).
 *
 * Only files git IGNORES in the source checkout are copied — a tracked or merely
 * untracked file is never touched, so nothing here can end up staged in the
 * worktree. Files already present in the worktree are left alone.
 *
 * Usage: node worktree-local-config.js <worktree-dir> [--from <source-checkout>] [--dry-run]
 *   Prints what it copied and what it skipped. Fail-open: any error is reported
 *   and the exit code stays 0 — a missing convenience must never stop the flow.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const UNIVERSAL = ['.claude/settings.local.json', '.env', '.env.local', '.env.*.local'];

// Directories never worth walking for local config.
const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'bin', 'obj', 'dist', 'build', 'out', 'coverage',
  '.next', '.turbo', '.venv', 'venv', 'target', '.idea', '.vs', 'TestResults',
]);

function parseArgs(argv) {
  const args = { worktree: null, from: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--from') args.from = argv[++i] ?? null;
    else if (a === '--dry-run') args.dryRun = true;
    else if (!args.worktree) args.worktree = a;
  }
  return args;
}

function git(args, cwd, input) {
  return spawnSync('git', args, { cwd, encoding: 'utf8', input });
}

/** The main checkout for the repo that contains `cwd` (works from a linked worktree too). */
function defaultSource(cwd) {
  const r = git(['rev-parse', '--path-format=absolute', '--git-common-dir'], cwd);
  if (r.status !== 0) return null;
  return path.dirname(r.stdout.trim());
}

/**
 * Same glob semantics as the template build: '**' crosses '/', '*' stays within a segment.
 * Order matters: '**' is rewritten first, and the single-star step only touches the escaped
 * '\*' the first step left behind — the '.*' it inserted carries no backslash.
 */
function globToRegex(pattern) {
  const esc = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = esc.replaceAll('\\*\\*/', '.*/?').replaceAll('\\*\\*', '.*').replaceAll('\\*', '[^/]*');
  return new RegExp(`^${body}$`);
}

function matches(pattern, relPath) {
  const target = pattern.includes('/') ? relPath : path.posix.basename(relPath);
  return globToRegex(pattern).test(target);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/** Universal set + every stack fragment's localConfig + the project override. */
function collectPatterns(source) {
  const include = [...UNIVERSAL];
  const stacksDir = path.join(source, '.claude', 'hooks', 'stacks');
  let fragments = [];
  try {
    fragments = fs.readdirSync(stacksDir).filter((f) => f.endsWith('.json'));
  } catch {
    // stack-neutral download
  }
  for (const f of fragments) {
    const fragment = readJson(path.join(stacksDir, f));
    for (const p of fragment?.localConfig ?? []) if (typeof p === 'string') include.push(p);
  }
  const override = readJson(path.join(source, '.claude', 'local-config.json'));
  for (const p of override?.include ?? []) if (typeof p === 'string') include.push(p);
  const exclude = (override?.exclude ?? []).filter((p) => typeof p === 'string');
  return { include: [...new Set(include)], exclude };
}

/** Every file under `root` (relative, forward slashes), skipping SKIP_DIRS. */
function walk(root, rel = '', out = []) {
  let entries;
  try {
    entries = fs.readdirSync(path.join(root, rel), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(root, relPath, out);
    } else if (entry.isFile()) {
      out.push(relPath);
    }
  }
  return out;
}

/** The subset of `candidates` that git ignores in `source` — tracked/untracked files are dropped. */
function onlyIgnored(source, candidates) {
  if (candidates.length === 0) return [];
  const r = git(['check-ignore', '--stdin', '-z'], source, candidates.join('\0') + '\0');
  // exit 1 = none ignored; anything else non-zero is an error → nothing is copied.
  if (r.status !== 0 && r.status !== 1) return [];
  return r.stdout.split('\0').filter(Boolean);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.worktree) {
    console.error('usage: worktree-local-config.js <worktree-dir> [--from <source-checkout>] [--dry-run]');
    return;
  }
  const worktree = path.resolve(args.worktree);
  const source = path.resolve(args.from ?? defaultSource(process.cwd()) ?? process.cwd());

  if (!fs.existsSync(worktree)) {
    console.error(`worktree-local-config: '${worktree}' does not exist — nothing copied.`);
    return;
  }
  if (path.resolve(source) === worktree) {
    console.error('worktree-local-config: source and worktree are the same directory — nothing copied.');
    return;
  }

  const { include, exclude } = collectPatterns(source);
  const candidates = walk(source).filter(
    (rel) => include.some((p) => matches(p, rel)) && !exclude.some((p) => matches(p, rel)),
  );
  const ignored = new Set(onlyIgnored(source, candidates));

  const copied = [];
  const skippedExisting = [];
  const skippedNotIgnored = candidates.filter((rel) => !ignored.has(rel));

  for (const rel of candidates) {
    if (!ignored.has(rel)) continue;
    const dest = path.join(worktree, rel);
    if (fs.existsSync(dest)) {
      skippedExisting.push(rel);
      continue;
    }
    if (!args.dryRun) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(source, rel), dest);
    }
    copied.push(rel);
  }

  const verb = args.dryRun ? 'would copy' : 'copied';
  console.log(`worktree-local-config: ${verb} ${copied.length} local config file(s) into ${worktree}`);
  for (const rel of copied) console.log(`  + ${rel}`);
  for (const rel of skippedExisting) console.log(`  = ${rel} (already in the worktree)`);
  for (const rel of skippedNotIgnored) console.log(`  - ${rel} (not gitignored — left alone)`);
  if (copied.length === 0 && skippedExisting.length === 0 && skippedNotIgnored.length === 0) {
    console.log('  (no matching local config in the source checkout)');
  }
}

try {
  main();
} catch (err) {
  console.error(`worktree-local-config: ${err?.message ?? err}`);
}
process.exitCode = 0;
