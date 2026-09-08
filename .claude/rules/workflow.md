# Development Workflow

Every feature, every bug fix, every change follows this workflow:

> The `/command` names below are Claude Code slash commands. On runtimes without slash commands (Codex, generic), perform the same step manually following the corresponding rules file — the workflow itself is identical.

```
TASK RECEIVED
     ↓
  1. PLAN          /plan [feature]              — Break down requirements, identify risks
  2. DESIGN        architect agent              — Validate architecture, approve design
  3. IMPLEMENT     /tdd [feature]               — Write tests FIRST, then code (RED→GREEN→REFACTOR)
  4. REVIEW        /code-review                 — Verify quality, patterns, standards
  5. SECURE        /security-review             — Check for vulnerabilities
  6. VERIFY        /e2e run                     — Test critical user flows
  7. DOCUMENT      /update-docs                 — Keep documentation current
     ↓
READY TO MERGE
```

**NEVER SKIP STEPS.** Every step exists for a reason. "I'll do it later" = "I'll forget to do it."

Skipping a *step* is forbidden. Re-ordering *tasks* is not — see "Never stall on a human" below.

## Non-negotiables for any change

These four apply to every workflow on this page, whether you run it as `/feature`, as the
individual commands, or by hand:

1. **Work in an isolated worktree.** A dedicated `git worktree` on a feature branch, never the
   shared main checkout — concurrent agent sessions there destroy each other's uncommitted work.
   Commit applied-but-untracked template files *before* creating the worktree; a worktree
   materializes only tracked files.
2. **Define acceptance criteria first.** No implementation starts against a request or work item
   whose scope and acceptance criteria are unclear. If they are missing, writing them — verifiable,
   demonstrable, recorded on the work item and in the knowledge graph — is the first task.
3. **Keep a live task list.** Create it in your first response, not once you have a plan, and keep
   it updated as things happen. In Claude Code that means the `TodoWrite` tool, so the user can
   follow progress live; elsewhere, a `TASKS.md` in the worktree. Tag each task with the work item
   it serves (`#3021 · implement CSV writer`) so the list shows which items are in play and where
   each one stands. Track every unit of work, including everything discovered mid-flight — new work
   items you find you need are tasks too, and stay in the list until they are drafted.
4. **Verify each task locally.** Green unit tests are not proof the feature works. Run the real
   path on your machine — the UI in a real browser, the endpoint with a real request, the job with
   a real trigger — before marking a task done.

### Never stall on a human — in multi-task flows

**This applies to multi-task flows** (a `/feature` run, a large refactor). In short interactive
work, where the user is right there, ask and wait — never invent an assumption to dodge a question.

In a multi-task flow, when a task needs a decision, approval, or answer only a human can give:
mark it `blocked: needs human`, note what you need and what you are assuming meanwhile, and
**move to the next task**. Do every task that can be done autonomously first, then handle all
human blockers together in one batched pass at the end — one consolidated conversation, not a
dozen interruptions.

**Never assume your way past** a trust boundary (merge, deploy, delete, infrastructure, creating
work items), an auth or security decision, a destructive or irreversible data change, a
cost/contractual commitment, or a **credential**. Park those, always. Never work around a missing
credential, and never write a real one into code, a commit, or the knowledge graph.

Two exceptions end the flow instead of deferring: a blocker every remaining task depends on
(surface it immediately, saying what is already done), and the point where the autonomous surface
is exhausted and only human answers remain — then stop and report *paused, partially delivered*
rather than looping.

## The orchestrated form

`/feature [description]` runs this whole workflow as a single flow — worktree first, then steps
1–7 — with all four non-negotiables built in and the architect reviewing both the plan and the
implementation. Use it for medium-to-large features, and for anything touching authentication,
secrets, tenant isolation, a migration, a public API contract, infrastructure, a new dependency,
or more than one layer.

`/feature-fast [description]` is the lean lane for a small change clear of all of those: the same
four non-negotiables and the same task-list, blocker and knowledge-graph disciplines, but no
planner or architect agents — one or two subagent spawns instead of nine. It escalates to
`/feature` mid-run if the change turns out to be bigger or more sensitive than it looked, keeping
the worktree and task list it already has.

On Claude Code both lanes are **enforced by hooks** (`rules/hooks.md`): the prerequisites above
block source writes until met, and the review and verification block the end of the turn. On
other runtimes they are the rules on this page, followed by hand.

For a genuine one-liner, use the individual commands directly.

## Feature Development

```bash
# Sequential (each depends on previous)
/plan add user authentication      # Break down requirements
architect validate design          # Approve architecture — BEFORE writing tests
/tdd user login                    # Tests first (RED), then make them pass (GREEN→REFACTOR)

# Parallel (no dependencies — run ALL of these)
/code-review + /security-review + /e2e + /update-docs
```

## Quick Bug Fix

```bash
/tdd login timeout issue           # Test that reproduces the bug, then fix to make it pass
/code-review + /security-review + /e2e + /update-docs  # ALL validation (parallel)
```

## Self-Validation Loop

After ANY implementation, validate AND fix issues found:

```
/tdd
     ↓
/code-review + /security-review + /update-docs (PARALLEL)
     ↓
Issues found? → FIX → Re-run reviews
     ↓
All clean? → DONE
```

Fix issues immediately — don't just report them. Re-run reviews until clean.

## Continuous Improvement

Run `/retrospective` regularly to identify patterns and save learnings:

- **Daily**: End of day — run `/retrospective`, save insights
- **Per feature**: After shipping — reflect on what worked
- **Sprint**: Sprint retrospective — team-wide review
