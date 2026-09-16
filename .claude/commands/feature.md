---
name: feature
description: Feature flow — worktree, acceptance criteria and tasks from the planner, one implementer spawn per task, one bounded review round, draft PR. Every step runs in a subagent; the main session only orchestrates
argument-hint: [feature description | work item id]
---

# Feature Flow

Deliver a feature end to end, spending the effort on the functionality rather than on
ceremony — and spending it in **subagents**, not in this session.

**The main session orchestrates. It does not plan, implement, verify or review.** Every one
of those steps is a spawn of the agent built for it, which carries the model chosen for that
job in its frontmatter (`rules/agents-and-commands.md`) and does its reading in its own
context. What stays here is the task list, the briefs you hand out, the short reports that
come back, the commit, the PR and the graph writes. If you find yourself opening a source file
or writing code in this session, stop: that is an agent's job. On Claude Code the flow guard
enforces it (`rules/hooks.md`): inside `/feature`, a source write from the main session is
refused.

Lean still means what it meant: **one review round**, no open-ended loops, no hardening the
criteria did not ask for — that is `/harden`. `rules/simplicity.md` governs how much gets
built: what the criteria require and nothing more.

## The contract

The order is fixed and so is who does each step. Do not merge steps, reorder them, or take
one over yourself because it looks small.

| Step | Who | Spawns | The main session does |
|------|-----|--------|-----------------------|
| 0. Worktree | main session | — | `git worktree add`, seed `TodoWrite` |
| 1. Criteria and tasks | **planner** (`fable`) | one | `context()`, brief it, expand `TodoWrite`, `remember("plan")` |
| 2. Implement | **implementer** (`opus`) | one **per task** | brief it, read its report, mark the task done, park discoveries |
| 3. Review | **code-reviewer** (`sonnet`), **security-reviewer** (`opus`) when sensitive | one each, plus one confirmation | hand findings to the implementer, then to the reviewer to confirm |
| 4. Human blockers | main session | — | one batched pass of choices with options |
| 5. Close out | main session | — | commit, draft PR, graph facts |

Models are what the agents' frontmatter says today (`rules/agents-and-commands.md`); change
them there, never in the spawn.

## Usage

```bash
/feature add board monitoring notifications
/feature #1234
```

For a genuine one-liner, skip the flow: fix it, add the test, run `/code-review`, open the PR.

## Three habits that run through every step

**Task list.** Use the `TodoWrite` tool, in your very first response, seeded with the work
items in scope — one entry each, `#3021 · implement CSV writer`, `#new · draft work item for
<thing>`. One task per verifiable outcome; exactly one in progress; newly discovered work
added the moment an agent reports it. Follow-ups that are not this feature stay parked in the
list until drafted as work items (created only with approval). Without a tracker id, drop the
prefix.

**Never stall on a human.** When a task needs a decision, approval or credential only a
person can give: mark it `blocked: needs human`, state the assumption you continue on, move
to the next task, and bring every blocker to the user together at the end (step 4) as a
choice with options (`rules/asking-the-user.md`). Never assume your way past a trust boundary
(merge, deploy, delete, infrastructure, creating work items), a security decision, a
destructive data change, a cost commitment, or a missing credential — park those, always.
Never put a real secret anywhere: not in code, not in a commit, not in the graph.

**Knowledge graph** (`rules/fae.md`): `context(<topic>)` before anything else — its result
goes into the planner's brief; one `remember("plan", …)` with the scope and criteria;
`decide()` for design choices; `remember("gotcha", …)` for surprises the agents report;
`block()`/`resolve()` for parked tasks; a `remember("fact", …)` per commit and one when the
feature ships. Full content in the node.

## Steps

### 0. Worktree

```bash
git worktree add ../<repo>-<slug> -b feature/<slug> main
node .claude/hooks/scripts/worktree-local-config.js ../<repo>-<slug>
```

Commit any applied-but-untracked template files first — a worktree materializes only tracked
files. The second line brings the gitignored local configuration the app needs to run
(`.env.local`, `appsettings.Development.json`, `local.settings.json`, the agent's own
`settings.local.json`, …) into the new worktree — the set per stack and the project's
additions are described in `rules/git-workflow.md`; on a runtime without the script, copy those
files by hand. Set `CLAUDE_CODE_TASK_LIST_ID` (see `rules/git-workflow.md`) or keep a task file
in the worktree so the list survives compaction. Every agent you spawn from here on works in this
worktree — say so in each brief.

### 1. Scope, criteria and tasks — the planner

Spawn the **planner** agent. Give it the request or work item, what the graph already knows
about the area (`context()`), and the relevant stack rules. Ask it back for:

- **Acceptance criteria**, three to five bullets, verifiable — what is in, what is out, and
  what will be demonstrated to call it done ("the filtered list exports to CSV and opens in
  Excel with the visible columns", not "export works"). If the request already carries such
  criteria, the planner confirms them instead of writing new ones.
- **An ordered task list**: one task per verifiable outcome, each with the criterion it
  serves, the files it is likely to touch, and how it will be verified locally.
- Risks and the design choices that need a `decide()`.

A small change gets a short answer — the planner is not skipped because the change is small,
because the spawn is what keeps the codebase reading out of this session. Expand `TodoWrite`
from its output. Record the criteria with `remember("plan", …)` and, where there is a work
item, as a **comment** on it — never by editing its fields. Present them to the user as
options, then proceed on the draft without waiting for the answer.

### 2. Implement, task by task — the implementer

For each task, in order, spawn the **implementer** agent with a brief that contains:

- the task and the acceptance criterion it serves;
- how it will be verified — the test to add and the real path to exercise;
- the plan excerpt that concerns it, the worktree path, and the conventions files
  (`rules/<stack>.md`, the stack skill);
- anything the previous implementer reported that this task depends on.

One task per spawn. The implementer writes the least code the criterion needs and the test
that proves it, runs the whole suite, exercises the real path once against local or
disposable resources, and returns a report of under twenty lines. You mark the task done from
that report — you do not open the files to check. What it lists under **Discovered** goes into
`TodoWrite` at once, scoped: blocks this feature (a new task) or follow-up (parked). What it
marks **blocked: needs human** is parked with its assumption. Its gotchas go to the graph.

Independent tasks may run as parallel spawns, each in the same worktree, when their files do
not overlap.

### 3. One review round — the reviewers

- **`/code-review`** — always. Spawns the **code-reviewer** agent, which reads the diff
  against the acceptance criteria and the conventions around it and reports bugs, broken
  criteria, secrets, and convention breaks visible in the diff. Anything else it lists in one
  line each under "for `/harden`".
- **`/security-review`** — only if the diff touches authentication or authorization, secrets,
  tenant isolation, a migration, a public API contract, infrastructure, or a new dependency.
  Spawns the **security-reviewer** agent, scoped to the diff.

Hand the BUG and SECRET findings (and CONVENTION breaks) to the **implementer** in one spawn
to fix — not to yourself — then have the reviewer confirm the fixes landed. **That
confirmation is the second and last round.** Anything still open after it is either a bug the
implementer fixes now or a suggestion you draft as a work item for `/harden` — never a third
round.

### 4. Human blockers

Bring every parked task to the user in **one** pass — what you need, what you assumed, what
changes if the answer differs — each as a choice with options, including the drafted work
items awaiting approval. Unblock what you can (through the implementer), and re-run the tests
if anything changed.

A drafted work item has one shape: the title is the outcome in production language, under
eighty characters ("Billing tab shows an empty state when there are no invoices", not "feat:
billing empty state"); the description says why it matters now and what is in and out; the
acceptance criteria are three to five GIVEN / WHEN / THEN blocks. The same shape the
`prototype-scan` skill drafts in.

### 5. Close out

Commit, open a **draft** PR (what changed, why, how to test), and record the delivery fact
and any gotcha in the graph. Never merge, deploy, or create work items without approval.

**Done when**: the build and tests are green, every acceptance criterion has been
demonstrated in an implementer's report, the review round is closed, and the task list is
empty (parked follow-ups drafted as work items). If human answers are still outstanding, stop
and report (`rules/writing.md`) — what shipped and against which criteria, what is deferred and
on what, which assumptions are unconfirmed — and resume at step 4 when they arrive. Do not loop.

## What the main session may do

Worktree and git commands, `TodoWrite`, spawning agents and reading their reports, graph
writes, the PR, and the conversation with the user. Not: `Read` on a source file, `Write` or
`Edit` on one, or running the suite yourself to "have a look" — every one of those puts file
contents into this context and runs the work on this session's model, which is the two
things the flow exists to avoid. Documentation you touched yourself you may update yourself.

## Notes

- The architect, e2e-runner and doc-updater agents are not part of this flow. The
  implementer's real-path check is the end-to-end test; the architect works in `/plan` and
  `/harden`.
- Never override agent models — each agent carries its model in frontmatter
  (`rules/agents-and-commands.md`).
- The `/command` names are Claude Code slash commands; on runtimes without them, do the same
  step by hand from the matching rules file — still one agent per step where the runtime has
  subagents.
