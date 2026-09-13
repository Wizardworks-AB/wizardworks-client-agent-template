#!/usr/bin/env node

/**
 * Hook: Worklog tracker (Epic #2135)
 *
 * PostToolUse on `record_worklog`, PreCompact, SessionEnd and SessionStart.
 *
 *   node worklog-track.js recorded   → the agent just called record_worklog:
 *                                      reset the nudge clock.
 *   node worklog-track.js compact    → compaction is about to fold the session
 *                                      details away: make the NEXT Stop nudge
 *                                      immediately so the summary is captured
 *                                      while the agent still remembers it.
 *   node worklog-track.js end        → the session is ending (/clear or exit).
 *                                      A hook can't write the worklog itself (no
 *                                      MCP token, and after exit there's no agent
 *                                      turn to act on a nudge), so if there is
 *                                      unsummarized work (a nudge went out that no
 *                                      record_worklog answered), flag a reminder
 *                                      for the next session start.
 *   node worklog-track.js remind     → session start: if a reminder is pending,
 *                                      surface it (suggest /report-worklog) and
 *                                      clear the flag.
 *
 * FAIL-QUIET BY DESIGN: any error → exit 0 silently.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

function quietExit() {
  process.exit(0);
}

try {
  const mode = process.argv[2];
  if (!['recorded', 'compact', 'end', 'remind'].includes(mode)) quietExit();

  const hash = crypto.createHash('sha256').update(process.cwd()).digest('hex').slice(0, 16);
  const stateDir = path.join(os.homedir(), '.claude', 'fae-worklog');
  fs.mkdirSync(stateDir, { recursive: true });
  const file = path.join(stateDir, `${hash}.json`);

  let state = {};
  try {
    state = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    // fresh state
  }

  const now = Date.now();
  if (!state.firstSeenAt) state.firstSeenAt = now;
  if (mode === 'recorded') {
    state.lastRecordedAt = now;
    state.forceNudge = false;
    state.remindPending = false; // just summarized — nothing to remind about
  } else if (mode === 'compact') {
    state.forceNudge = true;
  } else if (mode === 'end') {
    // Unsummarized work == a nudge (or a pending post-compact forceNudge) that no record_worklog
    // has answered. Only then flag a reminder — a clean, already-summarized session stays quiet.
    const unsummarized =
      state.forceNudge === true ||
      (state.lastNudgedAt && state.lastNudgedAt > (state.lastRecordedAt || 0));
    if (unsummarized) state.remindPending = true;
  } else if (mode === 'remind') {
    if (state.remindPending) {
      state.remindPending = false;
      fs.writeFileSync(file, JSON.stringify(state));
      process.stdout.write(
        'Worklog reminder: work from your last session may not have been summarized for time ' +
        'reporting. Run /report-worklog to capture it (or continue — the time itself was recorded).',
      );
      process.exit(0);
    }
    quietExit();
  }
  fs.writeFileSync(file, JSON.stringify(state));
  process.exit(0);
} catch {
  quietExit();
}
