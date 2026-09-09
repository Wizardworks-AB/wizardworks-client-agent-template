---
name: feature
description: Feature flow — worktree, acceptance criteria, live task list, tests with the code, one bounded review round, draft PR. Lean by default; the planner and the security reviewer join only when the change calls for them
argument-hint: [feature description | work item id]
---

# Feature Flow

Deliver a feature end to end, spending the effort on the functionality rather than on
ceremony. Default cost: **one agent spawn** — the code review. The planner joins only when
the change is large, the security reviewer only when it touches something sensitive.
Robustness work beyond what the acceptance criteria need is a separate, deliberate step:
`/harden`.

`rules/simplicity.md` governs how much gets built: **what the criteria require and nothing
more.** Less code is better code.

On Claude Code two things are enforced by hooks (`rules/hooks.md`): no source write outside
a worktree or before the task list exists, and no ending a turn with code that is unreviewed
or untested since it was last changed. `/feature-off` leaves the flow.

## Usage

```bash
/feature add board monitoring notifications
/feature #1234
```

For a genuine one-liner, use `/tdd` directly.

## Three habits that run through every step

**Task list.** Use the `TodoWrite` tool, in your very first response, seeded with the work
items in scope — one entry each, `#3021 · implement CSV writer`, `#new · draft work item for
<thing>`. One task per verifiable outcome; exactly one in progress; newly discovered work
added the moment it is found. Follow-ups that are not this feature stay parked in the list
until drafted as work items (created only with approval). Without a tracker id, drop the prefix.

**Never stall on a human.** When a task needs a decision, approval or credential only a
person can give: mark it `blocked: needs human`, state the assumption you continue on, move
to the next task, and bring every blocker to the user together at the end (step 5) as a
choice with options (`rules/asking-the-user.md`). Never assume your way past a trust boundary
(merge, deploy, delete, infrastructure, creating work items), a security decision, a
destructive data change, a cost commitment, or a missing credential — park those, always.
Never put a real secret anywhere: not in code, not in a commit, not in the graph.

**Knowledge graph** (`rules/fae.md`): `context(<topic>)` before anything else; one
`remember("plan", …)` with the scope and criteria; `decide()` for design choices;
`remember("gotcha", …)` for surprises; `block()`/`resolve()` for parked tasks; a
`remember("fact", …)` per commit and one when the feature ships. Full content in the node.

## Steps

### 0. Worktree

```bash
git worktree add ../<repo>-<slug> -b feature/<slug> main
```

Commit any applied-but-untracked template files first — a worktree materializes only tracked
files. Set `CLAUDE_CODE_TASK_LIST_ID` (see `rules/git-workflow.md`) or keep a task file in the
worktree so the list survives compaction.

### 1. Scope and acceptance criteria

If the request or work item already has verifiable criteria, confirm them and move on. If
not, writing them is the first task: three to five bullets — what is in, what is out, and
what you will demonstrate to call it done ("the filtered list exports to CSV and opens in
Excel with the visible columns", not "export works"). Record them with `remember("plan", …)`
and, where there is a work item, as a **comment** on it — never by editing its fields. Present
them to the user as options, then proceed on your draft without waiting for the answer.

### 2. Tasks — and the planner, only when needed

Turn the criteria into tasks in `TodoWrite`, each tagged with the work item it serves and
how it will be verified. **If that comes to more than about five tasks, or the change crosses
more than one architectural layer, run `/plan`** — it spawns the **planner** agent to produce
the roadmap, and you expand the list from its output. Otherwise plan inline: a plan that fits
in five lines does not need an agent.

### 3. Implement, task by task

For each task: write the failing test, write the least code that passes it, run the suite.
Then exercise the real path once — the UI in a browser if a browser-automation MCP is
configured, the endpoint with a real request, the job actually triggered — against local or
disposable resources only, and note what you saw on the task. A task is done when its test is
green and you saw it work. No code without a test; no code the criteria did not ask for.

### 4. One review round

- **`/code-review`** — always. Spawns the **code-reviewer** agent, which reads the diff
  against the acceptance criteria and the conventions around it and reports bugs, broken
  criteria, secrets, and convention breaks visible in the diff. Anything else it lists in one
  line each under "for `/harden`".
- **`/security-review`** — only if the diff touches authentication or authorization, secrets,
  tenant isolation, a migration, a public API contract, infrastructure, or a new dependency.
  Spawns the **security-reviewer** agent, scoped to the diff.

Fix the bugs and broken criteria, re-run the tests, and have the reviewer confirm the fixes
landed. **That confirmation is the second and last round.** Anything still open after it is
either a bug you fix now or a suggestion you draft as a work item for `/harden` — never a
third round.

### 5. Human blockers, then close out

Bring every parked task to the user in **one** pass — what you need, what you assumed, what
changes if the answer differs — each as a choice with options, including the drafted work
items awaiting approval. Unblock, finish, re-test.

Then commit, open a **draft** PR (what changed, why, how to test), and record the delivery
fact and any gotcha in the graph. Never merge, deploy, or create work items without approval.

**Done when**: the build and tests are green, every acceptance criterion has been
demonstrated, the review round is closed, and the task list is empty (parked follow-ups
drafted as work items). If human answers are still outstanding, stop and report — what
shipped and against which criteria, what is deferred and on what, which assumptions are
unconfirmed — and resume at step 5 when they arrive. Do not loop.

## Notes

- The architect, e2e-runner and doc-updater agents are not part of this flow. Update the
  docs you touched yourself; the real-path check in step 3 is the end-to-end test; the
  architect works in `/plan` and `/harden`.
- Never override agent models — each agent carries its model in frontmatter
  (`rules/agents-and-commands.md`).
- The `/command` names are Claude Code slash commands; on runtimes without them, do the same
  step by hand from the matching rules file.
