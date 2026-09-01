#!/usr/bin/env node

/**
 * Hook Dispatcher (#2004)
 *
 * Claude Code invokes this from .claude/settings.json — the ONLY hook wiring
 * Claude Code reads. hooks.json documents the universal ruleset; this script
 * executes it using the native hook contract (event JSON on stdin, exit code
 * 2 = feedback/block, https://docs.anthropic.com/claude-code hooks).
 *
 * Usage: node dispatch.js pre|post   (stdin: the hook event JSON)
 *
 *   pre  (PreToolUse, Write|Edit):  scans the PENDING content for hardcoded
 *        secrets and BLOCKS the write (exit 2) on a critical hit — the file
 *        never lands on disk. Universal; runs on every stack.
 *   post (PostToolUse, Write|Edit): runs the universal checks plus any checks
 *        contributed by the stack overlay(s) selected at download; any warning
 *        output is fed back to the agent (exit 2) so it can fix the issue.
 *
 * Stack overlays: each selected stack ships a fragment at ../stacks/<stack>.json
 * declaring `{ checks: [{ script, match }] }`, where `script` lives next to this
 * file in scripts/ and `match` is a JS regex tested against the file path. Only
 * the stacks the user selected at download are present, so this dispatcher only
 * ever sees the checks for those stacks. No fragments (stack-neutral download) =
 * only the universal secret scan runs.
 *
 * Fail-open on dispatcher errors (exit 0) — a broken hook must never make the
 * agent unable to write files. The checks themselves stay authoritative.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SCRIPTS_DIR = __dirname;
const STACKS_DIR = path.join(__dirname, '..', 'stacks');

// Universal, stack-independent checks (mirrors ../hooks.json).
const UNIVERSAL_POST_CHECKS = [
  { script: 'check-secrets.js', match: null }, // null match = always runs
];

/** Load per-stack checks from ../stacks/*.json (only selected stacks exist). */
function loadStackChecks() {
  let entries;
  try {
    entries = fs.readdirSync(STACKS_DIR);
  } catch {
    return []; // no stacks dir (stack-neutral download) — universal checks only
  }
  const checks = [];
  for (const name of entries) {
    if (!name.endsWith('.json')) continue;
    try {
      const fragment = JSON.parse(fs.readFileSync(path.join(STACKS_DIR, name), 'utf8'));
      for (const c of fragment.checks ?? []) {
        if (c && typeof c.script === 'string') {
          checks.push({ script: c.script, match: c.match ?? null });
        }
      }
    } catch {
      // malformed fragment — skip it, never block
    }
  }
  return checks;
}

function pathMatches(match, filePath) {
  if (!match) return true;
  try {
    return new RegExp(match).test(filePath);
  } catch {
    return false;
  }
}

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function runCheck(script, filePath) {
  return spawnSync('node', [path.join(SCRIPTS_DIR, script), filePath], {
    encoding: 'utf8',
    timeout: 10_000,
  });
}

function main() {
  const mode = process.argv[2];
  let event;
  try {
    event = JSON.parse(readStdin());
  } catch {
    process.exit(0); // no/invalid event JSON — never block on dispatcher failure
  }

  const input = event?.tool_input ?? {};
  const filePath = input.file_path;
  if (!filePath) process.exit(0);

  if (mode === 'pre') {
    // The file isn't written yet — scan the pending text (Write.content or
    // Edit.new_string) via a temp file so check-secrets runs unmodified.
    const pending = input.content ?? input.new_string;
    if (!pending) process.exit(0);
    const tmp = path.join(os.tmpdir(), `fae-hook-${process.pid}${path.extname(filePath)}`);
    try {
      fs.writeFileSync(tmp, pending, 'utf8');
      const result = runCheck('check-secrets.js', tmp);
      if (result.status !== 0) {
        process.stderr.write(result.stderr || 'Blocked: hardcoded secret detected.\n');
        process.exit(2); // PreToolUse exit 2 = block the write
      }
    } finally {
      fs.rmSync(tmp, { force: true });
    }
    process.exit(0);
  }

  if (mode === 'post') {
    if (!fs.existsSync(filePath)) process.exit(0);
    const checks = [...UNIVERSAL_POST_CHECKS, ...loadStackChecks()];
    let feedback = '';
    for (const check of checks) {
      if (!pathMatches(check.match, filePath)) continue;
      const result = runCheck(check.script, filePath);
      if (result.error) continue; // missing node/script — fail open
      if ((result.stderr && result.stderr.trim()) || result.status !== 0) {
        feedback += result.stderr || `${check.script} failed.\n`;
      }
    }
    if (feedback) {
      process.stderr.write(feedback);
      process.exit(2); // PostToolUse exit 2 = feed the findings back to the agent
    }
    process.exit(0);
  }

  process.exit(0);
}

main();
