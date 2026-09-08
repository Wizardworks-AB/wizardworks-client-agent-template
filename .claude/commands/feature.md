---
name: feature
description: End-to-end feature flow — isolated worktree, scope/acceptance-criteria first, living task list, architect review before and after, TDD with per-task local verification, human blockers deferred to the end, iterating until the task is verifiably solved
argument-hint: [feature description | work item id]
---

# Feature Flow Command

Runs a complete feature delivery cycle as a single orchestrated workflow.
The **architect appears twice**: first to review the plan before any code is written,
and again at the end to review the implementation.

Three disciplines run *continuously* through every step, not as steps of their own:
the **task list** (§A), the **human-blocker queue** (§B), and the **knowledge graph** (§C).
Read those three before starting — they govern how every step below behaves.

**On Claude Code this flow is enforced, not requested.** Typing `/feature` puts the session
into flow mode (`rules/hooks.md`): no source file can be written until you are in a worktree,
the task list exists, scope and acceptance criteria are recorded in the graph, the planner has
run and the architect has reviewed the plan — the hook blocks the write and says which step is
missing. The turn cannot end with source changed and no review run, or with source written
after the last test run. Leave flow mode with `/feature-off` if you must; the hooks will not
argue, but say why.

## Usage

```bash
/feature add board monitoring notifications
/feature implement knowledge repo auto-update after approval
/feature #1234
```

## When to Use

- Medium-to-large features where you want the full guardrail chain in one go
- Architectural changes that must be validated before AND after implementation

**When NOT to use**:

- A small change that touches no sensitive surface — no auth, secrets, tenant isolation,
  migration, public API contract, infrastructure, new dependency, and no more than one
  layer — belongs in **`/feature-fast`**: the same disciplines with one or two agent spawns
  instead of nine. That command's "surface list" is the test.
- A genuine one-liner or a typo needs no flow at all — use `/tdd` directly.

`/feature-fast` reuses §A, §B and §C below rather than restating them, so edits to those
three sections apply to both lanes. Keep them that way.

---

## Standing disciplines

### §A. The task list is the single source of truth

**Use the `TodoWrite` tool** — the live task list the user can watch in Claude Code. Not a
list in your reply, not a markdown file, not something you hold in your head. If the
runtime has no such tool, keep a `TASKS.md` in the worktree and say that you are doing so.

**Create it in your very first response to `/feature`, before anything else** — before
reading code, before step 1. Seed it immediately with what is already known:

- the work item(s) in scope, one entry each, so the user can see straight away what this
  run is about;
- `define scope and acceptance criteria` when the work item has none (step 1);
- the workflow's own remaining steps, as placeholders you will replace with real tasks
  once the plan exists in step 2.

Then keep it alive until the feature is done. **Every** unit of work this feature touches
lives in the list — nothing is tracked only in your head or only in the work item tracker.

**Entry format — every task carries the work item it serves:**

```
#3021 · write failing test for CSV writer
#3021 · implement CSV writer
#3021 · verify in browser: download opens
#3022 · pass filter state to exporter
#3044 · draft child work item for the paging bug
```

The `#<id> · ` prefix is what makes the list answer "which work items are we in, and where
are we in each?" at a glance. Use the real tracker id; for a discovery that has no id yet,
use `#new` until the work item is created, then update the entry. When the feature has no
work item at all, drop the prefix.

- One task per verifiable outcome. Each task records: what changes, **how it is verified
  locally** (step 4), and which acceptance criterion it serves.
- Mark tasks `in_progress` / `completed` as you go. Exactly one task in progress at a time.
  Update the list as things happen, not in a batch at the end — its whole value is that
  the user can follow the run without reading the transcript.
- **Newly discovered work goes in immediately** — a missing validation, an adjacent bug,
  a refactor that must happen, a dependency nobody scoped. Never let it evaporate, never
  "remember it for later".
- Scope each discovery as you add it:
  - **Blocks this feature** → it becomes a task in this run, ordered where it belongs.
  - **Follow-up work** → it stays in the list as a parked task *and* gets drafted as a
    new work item (see below). It is not done until it is drafted.
- **New work items you find you need to build are tasks too** — add `#new · draft work item
  for <thing>` to the list the moment you find it, and renumber the entry once the item is
  created. When this feature hangs off a backlog parent (epic, user story, or similar),
  draft each parked discovery as a child work item — title, description, acceptance
  criteria, parent link — and **present the drafts to the user for approval as a
  choice with options** (`rules/asking-the-user.md`), not as a paragraph ending in "let me
  know". Create them only after approval (trust boundary: no work item creation without
  human approval). Until they are approved, the drafts sit in
  the human-blocker queue (§B), and the flow keeps going.

### §B. Never stall on a human — defer and continue

Human input is the slowest resource in the loop. Do not let it idle the run.

This is a rule for **multi-task flows**. In short interactive work where the user is
right there, ask and wait — do not invent an assumption to avoid a question.

- When a task needs a decision, approval, access, or answer that only a human can give:
  **do not stop and wait**. Mark the task `blocked: needs human`, write down precisely
  what you need and what you will assume in the meantime, and **move to the next task**.
- Where a defensible assumption lets the work continue, take it, state it in the task,
  and build against it. Where it does not, park the task and move on.
- **Never assume your way past** any of these — park them, always:
  - anything crossing a trust boundary: merge, deploy, delete, infrastructure changes,
    creating work items;
  - authentication, authorization, or any other security decision;
  - destructive or irreversible changes to data or schemas;
  - commitments that cost money or bind the customer contractually;
  - **credentials and secrets**. Never work around a missing credential, and never put
    a real one in code, a commit, or the knowledge graph — record only that it is
    needed and where it will be stored.
- Record what each parked task **assumed**, which later tasks were built on that
  assumption, and which tasks depend on the parked one (they get parked with it).
- Keep going until every task that *can* be done autonomously is done. Maximize the
  autonomous surface before spending any human attention.
- All blocked tasks are then handled **together, last**, in step 6 — one batched pass
  with the user instead of a dozen interruptions.
- The only exception: a blocker so fundamental that every remaining task depends on it
  (e.g. the feature's core scope is genuinely undecidable). Then surface it at once —
  but say what you already completed and what remains.

### §C. Keep the knowledge graph current throughout

The graph must reflect this feature *while* it is being built, not in a write-up
afterwards. Follow `rules/fae.md`, and at minimum:

| When | Call |
|------|------|
| Start of the flow | `context(<feature topic>)` — what does the graph already know? Prior decisions, gotchas, related work. Do this **before** asking the user anything. |
| Acceptance criteria settled (step 1) | `remember("plan", "<feature> — scope and acceptance criteria", <full text>)` |
| Plan approved by the architect (step 3) | Update that same plan node with the implementation plan, or supersede it. Do **not** write a second `remember("plan", …)` for the same feature — near-duplicates are rejected on similarity, and the write will fail mid-flow. |
| Any design choice made or changed | `decide(decision, rationale, alternatives)` |
| A surprise, trap, or non-obvious constraint | `remember("gotcha", title, content)` |
| A task lands in the human-blocker queue (§B) | `block(description, urgency)` |
| That blocker is cleared (step 6) | `resolve(nodeId, resolution)` |
| Each commit | `remember("fact", "<commit summary>", <branch, files, what and why>)` |
| An open question with no answer yet | `ask_question(question, context)` |
| Feature delivered | `remember("fact", "<feature> delivered", <what shipped, how verified>)` |

Store **full content** in the node — never "see the plan in X.md".

**Never write secrets into the graph.** No credentials, tokens, connection strings, or
personal data — the graph is a shared, hosted service, and everything written to it is
persisted and searchable by future sessions. When a blocker was cleared by a credential,
record that it was supplied and where it lives (a secret-manager reference), never the
value.

---

## Workflow

Run the steps in order; each one's checks must pass before moving on. Steps are never
skipped — individual *tasks* may be re-ordered under §B, but the workflow's steps are not.
The one checkpoint the flow deliberately does not stop at is human confirmation of the
acceptance criteria (step 1) — see §B.

### 0. Set up an isolated worktree

All work for this feature happens in a dedicated git worktree, never in the shared
main checkout — concurrent agent sessions share that checkout and will destroy each
other's uncommitted work.

```bash
git worktree add ../<repo>-<feature-slug> -b feature/<feature-slug> main
```

- **Before creating it, commit or stash any uncommitted template files** in the main
  checkout. A worktree materializes only *tracked* files — an "applied but uncommitted"
  agent template (rules, hooks, commands, `fae-template.json`) silently disappears in
  the worktree, and the session there loses its guardrails.
- After creating the worktree, confirm the guardrails came along: the template files
  and `fae-template.json` are present. If they are not, go back and commit them.
- **Gitignored files do not materialize either.** `.claude/settings.local.json` carries
  the session's permission rules, and `.env`-style files carry local config — neither is
  tracked, so the new worktree starts without them. Re-approve the permission scope there
  rather than assuming the main checkout's approvals carry over.
- Do all work for this feature inside the worktree.
- **Make the task list survive.** This flow spans hours and will compact at least once,
  and task lists are session-local by default. Set `CLAUDE_CODE_TASK_LIST_ID` for the
  feature (see `rules/git-workflow.md`) or keep a task file inside the worktree, so §A's
  list and §B's queue are not lost with the context.
- When the feature is merged or abandoned, remove it with `git worktree remove`.

### 1. Scope and acceptance criteria

**A feature does not enter planning without a clear scope and verifiable acceptance
criteria.** If the request or work item already has them, confirm they are testable and
move on. If it does not, **defining them is the first task of this run** — before any
plan, before any code. It is already in the task list from §A; mark it `in_progress` now.

To define them:

1. `context(<topic>)` the knowledge graph and read the relevant code. The graph owns
   project context — check it before asking the user anything.
2. Draft, explicitly:
   - **Scope** — what is in, and what is deliberately out.
   - **Acceptance criteria** — a checklist of statements that are *verifiable*, each one
     something you could demonstrate. "Users can export a filtered list to CSV and the
     file opens in Excel with the visible columns" — not "export works well".
   - **Open questions** — anything you had to assume, and what you assumed.
3. Record it: `remember("plan", "<feature> — scope and acceptance criteria", …)`, and,
   when the feature is tied to a work item, post the criteria there **as a comment** —
   never overwrite the item's existing fields, which are human-authored content in a
   shared system of record.
4. Present the draft to the user for confirmation — as a choice with options, per
   `rules/asking-the-user.md` — then **apply §B**: do not wait for the answer. Park "confirm scope and acceptance criteria" in the human-blocker queue
   and proceed on your stated draft. The architect reviews these criteria for
   testability and coverage in step 3, so they get an independent read even while the
   human confirmation is still outstanding.

These criteria are the convergence target for step 7. A feature with no acceptance
criteria cannot be declared done.

### 2. Plan

Run `/plan [feature description]`.

- Spawn the **planner** agent — do not plan inline in this session. The planner has its own
  context and its own model, and planning inline quietly bypasses both. `/plan` says the same;
  if its body reads like work for you to do, that is the brief for the planner, not for you.
- Produce a concrete, ordered implementation roadmap that satisfies the criteria from step 1.
- **Expand the task list** (§A): replace the step placeholders you seeded at the start with
  the real, ordered tasks from the roadmap, each tagged with the work item it serves and
  each carrying its local verification method (step 4) — so "done" is defined before the
  work starts. From here every step works against this list.

### 3. Architect reviews the plan

Spawn the **architect** agent to review the plan from step 2.

- Validate the design against the project's architecture and conventions (`rules/`, stack
  overlays, existing codebase patterns).
- The architect returns concrete input: gaps, risks, simpler alternatives, ordering changes.
- **Revise the plan** to incorporate the architect's input. If the architect raises blocking
  concerns, loop back to step 2.
- Update the task list to match the revised plan, record the plan and any design decisions
  in the graph (§C), then present it and proceed.

### 4. Implement — task by task, each verified locally

Work the task list in order. For **each** task:

1. **TDD** via `/tdd [task]`:
   - **tdd-test-writer** writes failing tests (RED), verify by running the test suite.
   - **tdd-implementer** makes them pass (GREEN), verify by running the suite again.
   - Refactor while keeping tests green (BLUE). No code without tests.
2. **Verify the task locally — actually run it.** A green unit test is not proof the
   feature works; exercise the real path on your machine:
   - **Verify against local or disposable resources only.** Before running anything,
     confirm the app's configuration points at a local or throwaway environment. If it
     points at a shared, staging, or production database, queue, or third-party account,
     **do not run it** — park the verification in the human-blocker queue (§B). "Exercise
     the real path" never means mutating an environment you were not asked to touch.
   - **UI / web** — start the app locally and drive it in a real browser, if a
     browser-automation MCP is configured for this agent (Claude in Chrome, or an
     equivalent). Click the real flow, read the console and network panes for errors, and
     confirm the visible result. Capture a screenshot or short recording as evidence for
     anything a human will review. If no such MCP is available, say so in the task and
     verify through the running dev server instead — describing exactly what you observed.
   - **API / backend** — call the running local endpoint with real requests, and check the
     response *and* the resulting state (database rows, queue messages, emitted events).
   - **CLI / job / worker** — run the command or trigger the job locally and inspect its
     output and side effects.
   - **Not locally runnable** (needs a cloud resource, a third-party callback, a licence)
     — say so explicitly in the task, verify as far down as you can get, and park the
     remaining verification in the human-blocker queue (§B). Never silently downgrade to
     "tests pass, good enough".
3. **Mark the task done only when both hold**: its tests are green *and* it was verified
   locally by the method above. Record the **evidence** in the task — the command you ran
   and its observed output, or the screenshot path. A task with no evidence field is not
   done, and reviewers in step 5 should treat its absence as a finding.
4. If the task hit something only a human can unblock — apply §B: park it, move to the
   next task.

New work discovered while implementing goes straight into the task list (§A).

### 5. Full review (parallel)

After the implementable tasks are done, run all four validations. 5a, 5b and 5d are
independent — run them in parallel:

- **5a. Code quality** — `/code-review`: spawns the **code-reviewer** agent for coding
  standards and project patterns.
- **5b. Security** — `/security-review`: spawns the **security-reviewer** agent for secrets,
  injection, authentication/authorization, and data exposure.
- **5c. Architect review** — spawn the **architect** agent again to review the *implemented*
  code against the approved plan: did it follow the design, and is the result maintainable?
- **5d. Verify end to end** — `/e2e [the flows this feature touches]`: spawns the
  **e2e-runner** agent to test the critical user flows and check the implementation against
  the acceptance criteria from step 1.
- **5e. Documentation** — `/update-docs`: spawns the **doc-updater** agent to bring the docs
  in line with what changed.

5c is as independent as the rest; include it in the parallel set unless the architect
needs a review's output first.

Findings from all four go into the task list (§A) and are fixed immediately, not reported
and left.

### 6. Batch the human blockers

Everything autonomous is now done. Work through the human-blocker queue (§B) in **one**
consolidated pass:

- Present the full list at once: for each item — what you need, why it is needed, what you
  assumed in the meantime, and what changes if the answer differs from your assumption.
- **Ask each one as a choice with concrete options**, per `rules/asking-the-user.md` — a
  numbered set of things you will actually do, one of them always `Chat about this`, with
  anything irreversible (publish, deploy, merge, push, delete) called out in the option
  itself. Never hand the user a paragraph of prose to answer in freeform. This step is the
  single biggest source of questions in the flow, so it is where the rule matters most.
- Include the drafted child work items awaiting approval (§A) in the same pass.
- As each is answered: unblock the task, finish it, and re-run its local verification
  (step 4) and any review it affects (step 5).
- `resolve()` the corresponding graph blockers (§C).

If a blocked task turns out to be follow-up work rather than part of this feature, draft it
as a work item and take it out of this run — with the user's agreement.

### 7. Resolve and converge

Iterate until the task is **verifiably solved** — not just until reviewers are satisfied:

- After every fix, re-run the build and the full test suite (all green) and re-run the
  affected reviews.
- Loop steps 4–7 until ALL of the following hold:
  1. The build and the full test suite pass with zero failures.
  2. `/e2e` passes for the affected flows.
  3. Every task was verified locally by its own method (step 4) — not by unit tests alone.
  4. Every acceptance criterion from step 1 is demonstrably met.
  5. Code review, security review, and architect review all come back clean.
  6. The task list has no open tasks: nothing in progress, nothing blocked, and parked
     follow-ups drafted as child work items per §A.
- Done only when all six hold in the same iteration.

Then close out: commit the work, open a **draft** PR describing what changed, why, and how
to test it, and record in the graph (§C) the delivery fact, any outcome of the plan, and any
gotcha this feature taught you. Never merge, deploy, or create work items without approval.

### The other way this ends: paused, partially delivered

§B guarantees blocked tasks exist while the human has not answered, so condition 6 above can
be unreachable through no fault of the work. When the autonomous surface is exhausted and
step 6 is still waiting on a person, **stop and report** — do not loop, and do not quietly
drop a criterion. The report states:

- what shipped and is verified, against which acceptance criteria;
- what is deferred, and what each deferred item is waiting on;
- which assumptions are still unconfirmed, and what changes if any of them is wrong;
- where things stand: draft PR open, graph blockers open, worktree retained;
- and what you need from them, asked as options (`rules/asking-the-user.md`) — a report is
  not a place to slip questions into prose either.

That is a legitimate end state. Resume the flow at step 6 when the answers arrive.

## Notes

- This command is the automated form of the workflow in `rules/workflow.md`.
- The `/command` names here are Claude Code slash commands. On runtimes without them,
  perform the same step manually against the corresponding rules file — the flow is
  identical.
- Never override agent models — each agent carries its optimal model in frontmatter.
- Respect the trust boundaries: write code on branches and open draft PRs, but never merge,
  deploy, or create work items without human approval.
