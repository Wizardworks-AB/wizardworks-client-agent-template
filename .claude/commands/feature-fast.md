---
name: feature-fast
description: The lean lane of the feature flow — same disciplines, far fewer agents. For small changes clear of every sensitive surface; escalates to /feature the moment it stops being small
argument-hint: [feature description | work item id]
---

# Feature Flow — Fast Lane

Same spine as `/feature`, with the heavy machinery removed: no planner agent, no
architect passes, no separate e2e or docs agents, and the tests written directly
rather than by the TDD pair. One or two subagent spawns instead of nine.

What is **not** removed: the worktree, the acceptance criteria, the task list, and
per-task local verification. Those are what make a change trustworthy, and they cost
almost nothing. This lane is cheaper because it spawns fewer agents — not because it
checks less.

**On Claude Code this lane is enforced** (`rules/hooks.md`): typing `/feature-fast` puts the
session into fast-lane mode. No source file can be written outside a worktree, before the
task list exists, or before scope and acceptance criteria are recorded — and a write to a
path on the surface list below is blocked outright with an instruction to escalate. The turn
cannot end without the code review, or with source written after the last test run.
`/feature-off` leaves the flow.

## The surface list

This list decides both whether you may use this lane at all, and whether the security
review runs. A change **touches the surface list** if it involves any of:

- authentication or authorization;
- secrets, credentials, or token handling;
- tenant isolation or any other data-scoping boundary;
- a database migration or schema change;
- a public API contract (anything an external caller depends on);
- infrastructure or deployment configuration;
- a new third-party dependency;
- more than one architectural layer or component.

## When to Use

Use this lane when the change touches **nothing** on the surface list.

Everything else goes to `/feature`. If you are unsure whether something is on the list,
it is — take the full lane; being wrong in that direction costs a few agent spawns, being
wrong in the other direction ships a hole.

**Smaller still**: a genuine one-liner or a typo needs no flow at all — use `/tdd`.

## Standing disciplines

**§A (task list), §B (never stall on a human) and §C (knowledge graph) in
`commands/feature.md` apply here unchanged.** Read them there; they are deliberately not
restated in this file, so the two lanes cannot drift apart. In practice, for this lane:

- the task list is 2–5 entries, still created in your first response and still tagged with
  the work item each task serves;
- a blocked task is still parked with its assumption stated, and you still keep going;
- the graph still gets the acceptance criteria, any decision, any gotcha, and a fact per
  commit.

`rules/asking-the-user.md` applies too: anything you need from the user is a list of
options, never a question inside a paragraph.

## Workflow

### 0. Worktree

```bash
git worktree add ../<repo>-<slug> -b feature/<slug> main
```

Commit any applied-but-untracked template files first — a worktree materializes only
tracked files. Full detail in `/feature` step 0 and `rules/git-workflow.md`.

### 1. Scope and acceptance criteria

Inline, in a few bullets — no planning artifact and no planner agent. State what is in,
what is out, and the criteria that make it verifiably done. When the change has no
acceptance criteria, writing them is still the first thing you do.

Record them with `remember("plan", …)` and, where there is a work item, post them there as
a **comment**. Then proceed on your draft per §B rather than waiting for confirmation.

### 2. Task list

Turn the criteria into 2–5 tasks (§A), each with the work item it serves and how it will
be verified locally. If the list will not fit in five tasks, that is a tripwire — see below.

### 3. Implement

Per task: **write the failing test first**, then the code that passes it, then verify the
real path locally — the UI in a browser if a browser-automation MCP is available, the
endpoint with a real request, the job actually triggered. Against local or disposable
resources only; if the configuration points at anything shared or production, do not run
it — park the verification (§B).

No code without a test. Record the evidence on the task; a task with no evidence is not
done.

### 4. Review

- **`/code-review`** — always. It spawns the **code-reviewer** agent; spawn the agent, do
  not review your own diff inline. Reviewing inline loses both the separate context and the
  model chosen for the job, which is most of what this step is worth.
- **`/security-review`** — only if the change turned out to touch the surface list. It spawns
  the **security-reviewer** agent. If it triggered, that is also a tripwire: finish the
  review, then read the tripwire rule below.

Fix findings immediately, then re-run the affected review.

### 5. Converge and close out

Done when all of these hold together:

1. the build and the full test suite pass;
2. every acceptance criterion from step 1 is demonstrably met;
3. every task was verified locally, with its evidence recorded;
4. the review(s) come back clean;
5. no open tasks — parked follow-ups drafted as work items per §A.

Then commit, open a **draft** PR describing what changed and how to test it, and record the
delivery fact and any gotcha in the graph. Never merge, deploy, or create work items
without approval.

If human blockers are still outstanding, end in the *paused, partially delivered* state —
see the section of that name in `commands/feature.md`.

## Escalation — hand off to `/feature`

**Stop and switch to the full lane** the moment any of these becomes true:

- the change turns out to touch the **surface list** after all;
- the task list grows past five tasks, or a task keeps splitting;
- an architectural question appears — "should this live here?", "does this belong in that
  layer?", "is this the right abstraction?";
- the acceptance criteria from step 1 turn out to be wrong or incomplete;
- the review comes back with a CRITICAL or HIGH finding, or two rounds of fixes have not
  cleared it;
- you find yourself wanting a second opinion on the design.

Handing off costs nothing: both lanes share the same worktree and the same task list, so
**do not start over**. Say plainly that you are escalating and why, keep everything you
have, and pick up at `/feature` step 2 — the planner and architect then work against the
scope and criteria you already wrote.

Escalating is the expected outcome for a fair share of runs. It is not a failure; it is the
mechanism that lets this lane be lean without being reckless.

## Notes

- Agent budget: one spawn (`/code-review`), two if the security review triggers. Compare
  `/feature`, which spawns nine.
- Never override agent models — each carries its model in frontmatter
  (`rules/agents-and-commands.md`).
- The `/command` names are Claude Code slash commands; on runtimes without them, perform
  the same step manually against the matching rules file.
