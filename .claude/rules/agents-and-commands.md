# Agents and Commands

## Specialist Agents

Ten specialist agents enforce the engineering standard:

| Agent | Role | Command |
|-------|------|---------|
| **Planner** | Break down requirements | `/plan` |
| **Architect** | Validate design decisions | Direct invoke |
| **TDD Test Writer** | Write failing tests first (RED) | `/tdd` (RED phase) |
| **TDD Implementer** | Make tests pass (GREEN→REFACTOR) | `/tdd` (GREEN→REFACTOR phase) |
| **Code Reviewer** | Verify quality and patterns | `/code-review` |
| **Security Reviewer** | Find vulnerabilities | `/security-review` |
| **Build Error Resolver** | Fix compilation issues | `/build-fix` |
| **E2E Runner** | Test user flows | `/e2e` |
| **Refactor Cleaner** | Improve code quality | `/refactor-clean` |
| **Doc Updater** | Maintain documentation | `/update-docs` |

## Additional Commands

| Command | Purpose |
|---------|---------|
| `/feature` | End-to-end feature flow — isolated worktree, acceptance criteria first, a live `TodoWrite` task list tagged by work item, architect review before and after, TDD with per-task local verification, human blockers batched last; iterates until verifiably solved |
| `/feature-fast` | The lean lane of the same flow for small changes clear of every sensitive surface — same worktree, criteria, task list and local verification, but no planner or architect agents and one or two spawns instead of nine; escalates to `/feature` when a tripwire fires |
| `/prototype-scan` | Scan a customer prototype repo for changes since the last scan, screenshot the affected routes, draft Feature/User Story items in production language and create them only after your approval |
| `/commit` | Validate against P&P, generate docs, commit + push |
| `/retrospective` | Run session retrospective, save learnings to memory |
| `/report-worklog` | Summarize this session's work and log it to your worklog (time reporting) |
| `/update-template` | Check Fae for a newer published agent-template version and apply it |

## Parallel Execution

Run independent agents in parallel to maximize efficiency.

**Sequential** (must run in order):
```
/plan → architect → /tdd (RED → GREEN → REFACTOR)
```

**Parallel** (run simultaneously after implementation):
```
/code-review + /security-review + /e2e + /update-docs
```

## Token Optimization

Use Sonnet for orchestration, Opus only where needed. Run Claude Code with Sonnet as the default model (`claude --model sonnet`). Subagents use their specified models automatically.

| Model | Agents | Why |
|-------|--------|-----|
| **opus** | architect, security-reviewer, tdd-implementer | Critical decisions |
| **fable** | planner | Long-horizon breakdown of a whole feature |
| **sonnet** | code-reviewer, refactor-cleaner, tdd-test-writer | Judgment calls |
| **haiku** | build-error-resolver, doc-updater, e2e-runner | Structured tasks |

**A command backed by an agent must actually spawn it** — and for the review agents this is
now enforced, not requested: the Workflow Gate (`rules/hooks.md`) refuses to end a turn in
which source code changed but no review agent ran.

 The commands in the table above are
briefs for their agent, not checklists for the main session — if you work through one inline,
you lose the agent's separate context *and* silently run the work on your session's model
instead of the one chosen for that job. When a command names an agent, delegate to it.

Each agent's model lives in the `model:` field of its own file under `agents/`. The field
takes the same values as the `--model` flag — the short aliases `opus`, `sonnet`, `haiku`,
`fable`, or a full model id — plus `inherit` to use the main conversation's model. Change
the field to change the agent's model, and update the table above so the two agree.

**Careful with typos**: what Claude Code does with an *unrecognized* value in this field is
not documented, and a silent fallback would leave an agent quietly running on the wrong
model. Only use values from the list above.

**NEVER override agent models.** Each agent has the optimal model in its frontmatter. Overriding wastes tokens.
