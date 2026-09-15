#!/usr/bin/env node

/**
 * Flow guard (PreToolUse on Write|Edit|MultiEdit|NotebookEdit, and on Bash).
 *
 * While a session is in `/feature` (see flow-mode.js), four things that cost
 * nothing to do and lose everything when skipped are hard blocks on source
 * writes. Exit 2 blocks the write and feeds the reason to the agent, which
 * does the missing step and retries.
 *
 *   worktree      — not in the main checkout on a default branch
 *   task list     — TodoWrite has been called
 *   a plan        — the planner agent has run (step 1 of the flow: acceptance
 *                   criteria and the task breakdown come from it, on its model)
 *   an agent      — the write comes from a subagent (the implementer), not
 *                   from the main session. A subagent's tool calls carry
 *                   `agent_type` in the hook event; the main session's do not.
 *                   The same rule covers Bash commands that edit source
 *                   (sed -i, a python heredoc rewriting files, `cat > file`).
 *
 * The flow is deliberately rigid about WHO does each step — planner, then
 * implementer, then reviewers — and this guard enforces the two of those that
 * are observable before a write happens. Which reviewers run is the Stop gate's
 * business (flow-gate.js).
 *
 * Outside the flow this script is inert (exit 0). Documentation is never
 * blocked. Fails open on any error — a broken guardrail must never stop the
 * agent working. Leaving the flow is explicit: the user types `/feature-off`.
 */

const path = require('path');
const S = require('./flow-state');

const PLANNER = 'planner';

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

  // Bash is only ever gated on the "an agent writes the source" rule, and only
  // when the command visibly edits a source file.
  if (event.tool_name === 'Bash') return guardBash(event, sessionId, input.command);

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

  if (!(Array.isArray(entry.agents) && entry.agents.includes(PLANNER))) {
    return block([
      `/feature: blocked writing ${rel} — the planner has not run yet.`,
      `Step 1 of the flow spawns the **planner** agent with the request, what the graph knows`,
      `(\`context()\`) and the stack rules, and gets back the acceptance criteria and the ordered`,
      `task list with how each task is verified. Expand TodoWrite from its output, then spawn`,
      `the **implementer** per task. A small change gets a short plan — the spawn is not skipped.`,
    ]);
  }

  if (!S.fromAgent(event)) return block(mainSessionLines(`writing ${rel}`));

  return 0;
}

function guardBash(event, sessionId, command) {
  const write = S.bashSourceWrite(command);
  if (!write) return 0;
  if (S.fromAgent(event)) return 0;

  const cwd = typeof event.cwd === 'string' ? event.cwd : process.cwd();
  const facts = S.gitFacts(cwd);
  if (!facts) return 0;

  const entry = S.readState(facts.commonDir)[sessionId];
  if (!entry || !entry.mode) return 0;

  return block(mainSessionLines(`this command — it is ${write}`));
}

function mainSessionLines(what) {
  return [
    `/feature: blocked ${what} from the MAIN session.`,
    `In this flow source is written by the **implementer** agent, not by you: spawn it with`,
    `the task, the acceptance criterion it serves, how it is verified, and the worktree path,`,
    `and mark the task done from its report. You keep the task list, the briefs, the commit`,
    `and the PR — not the code. Documentation you may edit yourself.`,
  ];
}

try {
  process.exit(main());
} catch {
  process.exit(0);
}
