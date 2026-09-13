# Development Workflow

Every change follows the same shape: know what "done" means, build it in isolation with
tests, get it reviewed once, ship a draft PR. How *much* gets built is governed by
`rules/simplicity.md` — what the acceptance criteria require and nothing more.

> The `/command` names below are Claude Code slash commands. On runtimes without them (Codex,
> generic), do the same step by hand from the corresponding rules file.

## The four non-negotiables

1. **Work in an isolated worktree.** A dedicated `git worktree` on a feature branch, never the
   shared main checkout — concurrent agent sessions there destroy each other's uncommitted work.
   Commit applied-but-untracked template files *before* creating the worktree; a worktree
   materializes only tracked files.
2. **Define acceptance criteria first.** No implementation starts against a request or work item
   whose scope and acceptance criteria are unclear. If they are missing, writing them — verifiable,
   demonstrable, recorded on the work item and in the knowledge graph — is the first task.
3. **Keep a live task list.** Create it in your first response and keep it current. In Claude Code
   that is the `TodoWrite` tool, so the user can follow progress live; elsewhere, a `TASKS.md` in
   the worktree. Tag each task with the work item it serves (`#3021 · implement CSV writer`), and
   add newly discovered work the moment you find it.
4. **Verify each task locally.** Green unit tests are not proof the feature works. Run the real
   path on your machine — the UI in a real browser, the endpoint with a real request, the job with
   a real trigger — before marking a task done.

## Reviews are bounded

One review round: `/code-review` always; `/security-review` when the change touches
authentication or authorization, secrets, tenant isolation, a migration, a public API contract,
infrastructure, or a new dependency. Fix bugs and broken criteria, re-test, have the reviewer
confirm the fixes — and that confirmation is the last round. Findings outside the acceptance
criteria become work items for `/harden`, not another iteration. Reviewers report what is
broken, not what could be more elaborate.

## Never stall on a human — in multi-task flows

In short interactive work, where the user is right there, ask and wait. In a multi-task flow
(a `/feature` run, a large refactor), when a task needs a decision, approval, or answer only a
human can give: mark it `blocked: needs human`, note what you need and what you are assuming
meanwhile, and **move to the next task**. Handle all human blockers together in one batched pass
at the end — as a choice with options (`rules/asking-the-user.md`), not a dozen interruptions.

**Never assume your way past** a trust boundary (merge, deploy, delete, infrastructure, creating
work items), an auth or security decision, a destructive data change, a cost commitment, or a
missing **credential**. Park those, always. Never write a real secret into code, a commit, or the
knowledge graph.

When only human answers remain, stop and report *paused, partially delivered* — what shipped,
what is deferred and on what — rather than looping.

## The commands

| Command | What it is for |
|---------|----------------|
| `/feature [description \| #id]` | The whole flow in one go, lean by default: one agent spawn (the code review). The planner joins when the change is large, the security reviewer when it touches a sensitive surface. |
| `/harden [target]` | Deliberate hardening of a module, diff or release — architect and security reviewer with their full checklists; findings become prioritized work items you approve. |
| `/plan [description]` | The planner agent, for a feature with more than about five tasks or crossing layers. `/feature` calls it itself when needed. |
| `/tdd`, `/code-review`, `/security-review`, `/e2e`, `/update-docs`, `/refactor-clean`, `/build-fix` | The individual steps, when you want one on its own. |

On Claude Code, hooks enforce the cheap, observable parts (`rules/hooks.md`): inside `/feature`
no source write outside a worktree or before the task list exists, and in any session no ending
a turn with unreviewed code, or with a sensitive path changed and no security review.

## Quick bug fix

`/tdd` (a test that reproduces it, then the fix) → `/code-review` → draft PR.

## Continuous improvement

Run `/retrospective` at the end of a day or a feature and save the learnings.
