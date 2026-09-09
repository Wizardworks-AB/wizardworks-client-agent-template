#!/usr/bin/env node

/**
 * Flow mode switch (UserPromptSubmit).
 *
 * Puts the session into the feature flow when the user invokes `/feature`, and
 * takes it out again on `/feature-off`. While a session is in the flow,
 * flow-guard.js turns the two cheap prerequisites (worktree, task list) into
 * hard blocks on source writes, and flow-gate.js adds the verification
 * requirement at Stop.
 *
 * Detection is deliberately belt-and-braces. Depending on the host version the
 * hook may see the raw prompt (`/feature add export`) or the expanded command
 * body, so both are matched: the slash prefix, and the H1 of the command file.
 *
 * Always exits 0. It only records; it never blocks a prompt.
 */

const S = require('./flow-state');

const RAW = {
  feature: /^\s*\/feature(\s|$)/,
  off: /^\s*\/feature-off(\s|$)/,
};
const EXPANDED = /^#\s+Feature Flow\s*$/m;

function detect(prompt) {
  if (typeof prompt !== 'string') return undefined;
  if (RAW.off.test(prompt)) return null;
  if (RAW.feature.test(prompt) || EXPANDED.test(prompt)) return S.MODES.FEATURE;
  return undefined; // not a flow command — leave the mode as it is
}

function main() {
  const event = S.readEvent();
  if (!event) return;
  const sessionId = typeof event.session_id === 'string' ? event.session_id : '';
  if (!sessionId) return;

  const mode = detect(event.prompt);
  if (mode === undefined) return;

  const facts = S.gitFacts(typeof event.cwd === 'string' ? event.cwd : process.cwd());
  if (!facts) return;

  const state = S.readState(facts.commonDir);
  const entry = S.session(state, sessionId);
  entry.mode = mode;
  S.writeState(facts.commonDir, state);
}

module.exports = { detect };

if (require.main === module) {
  try {
    main();
  } catch {
    /* never interfere with the prompt */
  }
  process.exit(0);
}
