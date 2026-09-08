#!/usr/bin/env node

/**
 * Flow mode switch (UserPromptSubmit).
 *
 * Puts the session into a flow when the user invokes `/feature` or
 * `/feature-fast`, and takes it out again on `/feature-off`. While a session is
 * in a flow, flow-guard.js turns the workflow's prerequisites into hard blocks
 * on tool calls, and flow-gate.js adds the verification requirement at Stop.
 *
 * Detection is deliberately belt-and-braces. Depending on the host version the
 * hook may see the raw prompt (`/feature add export`) or the expanded command
 * body, so both are matched: the slash prefix, and the H1 unique to each
 * command file.
 *
 * Always exits 0. It only records; it never blocks a prompt.
 */

const S = require('./flow-state');

const RAW = {
  feature: /^\s*\/feature(\s|$)/,
  fast: /^\s*\/feature-fast(\s|$)/,
  off: /^\s*\/feature-off(\s|$)/,
};
const EXPANDED = {
  feature: /^#\s+Feature Flow Command\s*$/m,
  fast: /^#\s+Feature Flow — Fast Lane\s*$/m,
};

function detect(prompt) {
  if (typeof prompt !== 'string') return undefined;
  if (RAW.off.test(prompt)) return null;
  // Order matters: "/feature-fast" also matches the "/feature" regex's prefix
  // only if written "/feature " — the (\s|$) guards it, but check fast first anyway.
  if (RAW.fast.test(prompt) || EXPANDED.fast.test(prompt)) return S.MODES.FAST;
  if (RAW.feature.test(prompt) || EXPANDED.feature.test(prompt)) return S.MODES.FEATURE;
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
