---
name: feature
description: End-to-end feature flow — plan, architect-review the plan, implement with TDD, then full review (code quality + security + architect + e2e) iterating until the task is verifiably solved
usage: /feature [feature description]
---

# Feature Flow Command

Runs a complete feature delivery cycle as a single orchestrated workflow.
The **architect appears twice**: first to review the plan before any code is written,
and again at the end to review the implementation.

## Usage

```bash
/feature add board monitoring notifications
/feature implement knowledge repo auto-update after approval
/feature add export to CSV alongside PDF
```

## When to Use

- Medium-to-large features where you want the full guardrail chain in one go
- Architectural changes that must be validated before AND after implementation

**When NOT to use**: trivial bug fixes or one-line changes — use `/tdd` directly.

## Workflow

Run these steps in order. Do not skip a step. Each gate must pass before moving on.

### 0. Set up an isolated worktree
Create a dedicated git worktree so the feature is developed in isolation from the main checkout:

```bash
git worktree add ../<repo>-<feature-slug> -b feature/<feature-slug> main
```

- Do all work for this feature inside that worktree.
- When the feature is merged or abandoned, remove it with `git worktree remove`.

### 1. Plan
Run `/plan [feature description]`.

- Spawns the **planner agent** to break the work into tasks with dependencies and risks.
- Produce a concrete, ordered implementation roadmap.
- **Capture acceptance criteria**: the plan must state, verifiably, what "the task is solved" means. These criteria are the convergence target for step 5.
- **Create the task list**: turn the roadmap into a tracked task list (TodoWrite) so progress is visible task by task throughout the flow. Every subsequent step works against this list — mark tasks in-progress/done as you go.

### 2. Architect reviews the plan
Spawn the **architect agent** to review the plan from step 1.

- Validate the design against the project's architecture and conventions (`rules/`, stack overlays, existing codebase patterns).
- The architect returns concrete input: gaps, risks, simpler alternatives, ordering changes.
- **Revise the plan** to incorporate the architect's input. If the architect raises blocking concerns, loop back to step 1.
- Update the task list to match the revised plan, then present it and proceed.

### 3. Implement
Implement the revised plan using TDD via `/tdd [feature]`:

- **tdd-test-writer** writes failing tests (RED), verify by running the project's test suite.
- **tdd-implementer** makes tests pass (GREEN), verify by running the test suite again.
- Refactor while keeping tests green (BLUE). No code without tests.
- Work through the task list in order, marking each task done only when its tests pass.

### Discoveries along the way (applies to every step)
New work always surfaces mid-flight — a missing validation, a refactor that should happen, an adjacent bug. Never let it evaporate:

1. **Add it to the task list** immediately, scoped: does it block this feature (do it now) or is it follow-up work (park it)?
2. **If the feature is tied to a backlog parent** (an epic, user story, or similar in your work item tracker), draft each parked discovery as a child work item — title, description, and parent link — and **present the drafts to the user for approval**. Create the work items only after the user approves (trust boundary: no work item creation without human approval).

### 4. Full review (parallel)
After implementation, run all four validations. Steps 4a, 4b, and 4d are independent — run them in parallel:

- **4a. Code quality** — `/code-review`: spawns the **code-reviewer agent** for coding standards and project patterns.
- **4b. Security** — `/security-review`: spawns the **security-reviewer agent** for secrets, injection, authentication/authorization, and data exposure.
- **4c. Architect review** — spawn the **architect agent** again to review the *implemented* code against the approved plan: did it follow the design, and is the result maintainable?
- **4d. Verify** — `/e2e run`: test the critical user flows the feature touches, and check the implementation against the acceptance criteria from step 1.

### 5. Resolve and converge
Iterate until the task is **verifiably solved** — not just until reviewers are satisfied:

- Collect all findings from step 4 (CRITICAL / HIGH / MEDIUM) and add them to the task list.
- **Fix issues immediately** — don't just report them.
- After every fix, re-run the build and the full test suite (all green) and re-run the affected reviews.
- Loop steps 4–5 until ALL of the following hold:
  1. The build and the full test suite pass with zero failures.
  2. `/e2e` passes for the affected flows.
  3. Every acceptance criterion from step 1 is demonstrably met.
  4. Code review, security review, and architect review all come back clean.
  5. The task list has no open tasks (parked follow-ups are drafted as child work items per the Discoveries rule).
- Done only when all five hold in the same iteration.

## Notes

- This command is the automated form of the workflow in `rules/workflow.md`.
- Never override agent models — each agent carries its optimal model in frontmatter.
- Respect the trust boundaries: write code on branches and open draft PRs, but never merge, deploy, or create work items without human approval.
