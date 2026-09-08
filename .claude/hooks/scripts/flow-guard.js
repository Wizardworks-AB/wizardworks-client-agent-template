#!/usr/bin/env node

/**
 * Flow guard (PreToolUse on Write|Edit|MultiEdit|NotebookEdit).
 *
 * While a session is in `/feature` or `/feature-fast` (see flow-mode.js), the
 * workflow's prerequisites stop being suggestions: a source file cannot be
 * written until they are met. Exit 2 blocks the write and feeds the reason to
 * the agent, which then does the missing step and retries.
 *
 * Checked in flow order, first failure reported:
 *
 *   both lanes   worktree      — not in the main checkout on a default branch
 *   fast lane    surface       — the path is on the security-sensitive surface:
 *                                escalate to /feature (the rule the lane is built on)
 *   both lanes   task list     — TodoWrite has been called
 *   both lanes   criteria      — remember(type: plan) has recorded scope + acceptance criteria
 *   /feature     planner       — the planner agent was spawned
 *   /feature     architect     — the architect reviewed the plan
 *
 * Outside a flow this script is inert (exit 0). Documentation is never
 * blocked. Fails open on any error — a broken guardrail must never stop the
 * agent working.
 *
 * Leaving a flow is explicit: the user types `/feature-off`. Rigid is not the
 * same as inescapable, but the escape belongs to the human.
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
  if (!entry || !entry.mode) return 0; // not in a flow — nothing to enforce

  const lane = entry.mode === S.MODES.FAST ? '/feature-fast' : '/feature';
  const rel = path.relative(facts.topLevel, abs) || abs;

  // 0. Worktree
  if (!facts.isLinkedWorktree && S.DEFAULT_BRANCHES.has(facts.branch)) {
    return block([
      `${lane}: blocked writing ${rel} — you are in the MAIN checkout on '${facts.branch}'.`,
      `Step 0 requires a dedicated worktree before any source is written:`,
      ``,
      `  git worktree add ../<repo>-<slug> -b feature/<slug> ${facts.branch}`,
      ``,
      `Commit any applied-but-untracked template files first (a worktree materializes`,
      `only tracked files), then continue there. This is enforced, not advisory.`,
    ]);
  }

  // Fast lane: surface list = escalate
  if (entry.mode === S.MODES.FAST && S.onSurface(abs)) {
    return block([
      `/feature-fast: blocked writing ${rel} — this path is on the security-sensitive surface`,
      `(auth, secrets, migrations, infrastructure, dependencies or tenant isolation).`,
      `The fast lane is only for changes that touch none of it. Escalate: say that you are`,
      `switching lanes and why, keep the worktree and the task list, and continue with`,
      `\`/feature\` from its step 2. This is the tripwire, enforced.`,
    ]);
  }

  // 1/2. Task list
  if (!entry.todo) {
    return block([
      `${lane}: blocked writing ${rel} — no task list exists yet.`,
      `Create it with the TodoWrite tool first (§A): the work item(s) in scope, one entry`,
      `per task tagged \`#<id> · <task>\`, each with how it will be verified locally.`,
      `Not a list in your reply, not a file — the TodoWrite tool.`,
    ]);
  }

  // 1. Scope and acceptance criteria
  if (!entry.plan) {
    return block([
      `${lane}: blocked writing ${rel} — scope and acceptance criteria are not recorded.`,
      `Step 1 comes before any code: write what is in, what is out, and the verifiable`,
      `criteria, then record them with remember(type: "plan", ...) in the knowledge graph`,
      `(and as a comment on the work item, if there is one). Then continue.`,
    ]);
  }

  if (entry.mode === S.MODES.FEATURE) {
    const agents = Array.isArray(entry.agents) ? entry.agents : [];
    // 2. Planner
    if (!agents.includes('planner')) {
      return block([
        `/feature: blocked writing ${rel} — the planner agent has not run.`,
        `Step 2 spawns the **planner** agent (via /plan) to produce the roadmap. Planning`,
        `inline in this session is exactly what this guard exists to prevent: it skips the`,
        `planner's context and its model. Spawn it, then expand the task list from its output.`,
      ]);
    }
    // 3. Architect reviews the plan
    if (!agents.includes('architect')) {
      return block([
        `/feature: blocked writing ${rel} — the architect has not reviewed the plan.`,
        `Step 3 spawns the **architect** agent to review the plan before any code is written.`,
        `Spawn it, revise the plan on its input, then continue.`,
      ]);
    }
  }

  return 0;
}

try {
  process.exit(main());
} catch {
  process.exit(0);
}
