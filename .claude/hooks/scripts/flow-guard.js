#!/usr/bin/env node

/**
 * Flow guard (PreToolUse on Write|Edit|MultiEdit|NotebookEdit).
 *
 * While a session is in `/feature` (see flow-mode.js), the two prerequisites
 * that cost nothing and lose everything when skipped are hard blocks on source
 * writes. Exit 2 blocks the write and feeds the reason to the agent, which
 * does the missing step and retries.
 *
 *   worktree   — not in the main checkout on a default branch
 *   task list  — TodoWrite has been called
 *
 * Nothing else is gated here on purpose: which agents run, and when, is the
 * flow's judgment call and forcing it made small changes expensive.
 *
 * Outside the flow this script is inert (exit 0). Documentation is never
 * blocked. Fails open on any error — a broken guardrail must never stop the
 * agent working. Leaving the flow is explicit: the user types `/feature-off`.
 */

const path = require('path');
const S = require('./flow-state');

function block(lines) {
  process.stderr.write(lines.join('\n') + '\n');
  return 2;
}

function main() {
  const event = S.readEvent();
  if (!event) return 0;
  const sessionId = typeof event.session_id === 'string' ? event.session_id : '';
  if (!sessionId) return 0;

  const input = event.tool_input && typeof event.tool_input === 'object' ? event.tool_input : {};
  const filePath = input.file_path ?? input.notebook_path;
  if (!S.isCode(filePath)) return 0;

  const abs = path.resolve(filePath);
  const facts = S.gitFacts(path.dirname(abs)) ?? S.gitFacts(process.cwd());
  if (!facts) return 0;

  const state = S.readState(facts.commonDir);
  const entry = state[sessionId];
  if (!entry || !entry.mode) return 0; // not in the flow — nothing to enforce

  const rel = path.relative(facts.topLevel, abs) || abs;

  if (!facts.isLinkedWorktree && S.DEFAULT_BRANCHES.has(facts.branch)) {
    return block([
      `/feature: blocked writing ${rel} — you are in the MAIN checkout on '${facts.branch}'.`,
      `Step 0 requires a dedicated worktree before any source is written:`,
      ``,
      `  git worktree add ../<repo>-<slug> -b feature/<slug> ${facts.branch}`,
      ``,
      `Commit any applied-but-untracked template files first (a worktree materializes`,
      `only tracked files), then continue there.`,
    ]);
  }

  if (!entry.todo) {
    return block([
      `/feature: blocked writing ${rel} — no task list exists yet.`,
      `Create it with the TodoWrite tool first: the work item(s) in scope, one entry per`,
      `task tagged \`#<id> · <task>\`, each with how it will be verified locally.`,
      `Not a list in your reply, not a file — the TodoWrite tool.`,
    ]);
  }

  return 0;
}

try {
  process.exit(main());
} catch {
  process.exit(0);
}
