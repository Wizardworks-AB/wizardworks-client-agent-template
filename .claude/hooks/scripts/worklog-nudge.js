#!/usr/bin/env node

/**
 * Hook: Worklog nudge (Epic #2135)
 *
 * Runs on Stop (end of each assistant turn) and decides whether to nudge the
 * agent to call the `record_worklog` MCP tool — the summary half of the user's
 * time-reporting evidence. The nudge is NON-BLOCKING: it injects a reminder via
 * hookSpecificOutput.additionalContext (exit 0), so it never hard-blocks the
 * turn, never loops, and never renders as a "Stop hook error". The platform
 * already tracks WHEN work happened (passive session windows from MCP traffic,
 * which survive crash, compaction and /clear); this nudge adds the WHAT, at a
 * humane cadence:
 *
 *   - first nudge after NUDGE_AFTER_MIN minutes of unsummarized work,
 *   - re-nudge at most every NUDGE_AFTER_MIN minutes after that,
 *   - immediate nudge once after a compaction (PreCompact sets forceNudge —
 *     compaction does NOT end the session, so Stop still runs afterwards),
 *   - never twice in the same turn (stop_hook_active guard).
 *
 * `worklog-track.js` (PostToolUse on record_worklog) resets the clock when the
 * agent actually records, so a compliant agent is never nagged.
 *
 * FAIL-QUIET BY DESIGN: only active in Fae workspaces (fae-template.json or a
 * Fae MCP config present); any error → exit 0 silently.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const NUDGE_AFTER_MIN = 45;

function quietExit() {
  process.exit(0);
}

function isFaeWorkspace(dir) {
  try {
    if (fs.existsSync(path.join(dir, 'fae-template.json'))) return true;
    const mcp = fs.readFileSync(path.join(dir, '.mcp.json'), 'utf8');
    return mcp.includes('faeplatform.ai') || mcp.includes('"fae');
  } catch {
    return false;
  }
}

function statePath(dir) {
  const hash = crypto.createHash('sha256').update(dir).digest('hex').slice(0, 16);
  const stateDir = path.join(os.homedir(), '.claude', 'fae-worklog');
  fs.mkdirSync(stateDir, { recursive: true });
  return path.join(stateDir, `${hash}.json`);
}

function readState(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

let input = '';
try {
  input = fs.readFileSync(0, 'utf8');
} catch {
  quietExit();
}

let payload = {};
try {
  payload = JSON.parse(input);
} catch {
  quietExit();
}

// Never block twice in a row — if a previous Stop hook already continued the
// conversation this turn, let it end.
if (payload.stop_hook_active) quietExit();

const cwd = process.cwd();
if (!isFaeWorkspace(cwd)) quietExit();

try {
  const file = statePath(cwd);
  const state = readState(file);
  const now = Date.now();

  // The unsummarized-work clock starts at the last record_worklog call, or the
  // first time this hook saw the workspace.
  if (!state.firstSeenAt) {
    state.firstSeenAt = now;
    fs.writeFileSync(file, JSON.stringify(state));
    quietExit();
  }

  const clockStart = Math.max(state.lastRecordedAt || 0, state.firstSeenAt);
  const sinceRecordMin = (now - clockStart) / 60000;
  const sinceNudgeMin = (now - (state.lastNudgedAt || 0)) / 60000;

  const due = state.forceNudge === true
    || (sinceRecordMin >= NUDGE_AFTER_MIN && sinceNudgeMin >= NUDGE_AFTER_MIN);
  if (!due) quietExit();

  state.forceNudge = false;
  state.lastNudgedAt = now;
  fs.writeFileSync(file, JSON.stringify(state));

  // Non-blocking reminder (NOT decision:'block'): injected as additional context, so it never
  // hard-blocks the turn, never loops, and never renders as a "Stop hook error". A blocking Stop
  // hook was wrong here — it also fired for autonomous/service sessions, which don't produce
  // worklog windows and can't call record_worklog. The summary is best-effort; passive session
  // windows already capture the TIME, and /report-worklog + the SessionEnd reminder are the
  // deterministic levers.
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'Stop',
      additionalContext:
        'Worklog reminder: this session\'s work hasn\'t been summarized for time reporting in a ' +
        'while. If it\'s worth logging, call the record_worklog MCP tool (or run /report-worklog) ' +
        'with 1-3 sentences on what this session worked on — the latest call replaces the previous ' +
        'summary. Ignore this if the fae MCP server is unavailable or this is an automated run.',
    },
  }));
  process.exit(0);
} catch {
  quietExit();
}
