# Agents and Commands

## Specialist Agents

Ten specialist agents enforce the engineering standard:

| Agent | Role | Command |
|-------|------|---------|
| **Planner** | Break down a large feature | `/plan` (and `/feature` when the change is large) |
| **Architect** | Shape a design, review structure | `/plan`, `/harden` |
| **TDD Test Writer** | Write failing tests first (RED) | `/tdd` (RED phase) |
| **TDD Implementer** | Make tests pass (GREEN→REFACTOR) | `/tdd` (GREEN→REFACTOR phase) |
| **Code Reviewer** | Find what is broken in a change | `/code-review` (and every `/feature`) |
| **Security Reviewer** | Find concrete exposures | `/security-review`, `/harden` |
| **Build Error Resolver** | Fix compilation issues | `/build-fix` |
| **E2E Runner** | Test user flows | `/e2e` |
| **Refactor Cleaner** | Improve code quality | `/refactor-clean` |
| **Doc Updater** | Maintain documentation | `/update-docs` |

## Additional Commands

| Command | Purpose |
|---------|---------|
| `/feature` | The feature flow, lean by default — worktree, acceptance criteria, a live `TodoWrite` task list tagged by work item, tests with the code, one bounded review round, draft PR. One agent spawn (the code review); the planner joins for large changes, the security reviewer for sensitive ones |
| `/harden` | Deliberate hardening of a module, diff or release — architect and security reviewer with their full checklists; findings become prioritized work items you approve, not an inline fix loop |
| `/prototype-scan` | Scan a customer prototype repo for changes since the last scan, screenshot the affected routes, draft Feature/User Story items in production language and create them only after your approval |
| `/commit` | Validate against P&P, generate docs, commit + push |
| `/retrospective` | Run session retrospective, save learnings to memory |
| `/report-worklog` | Summarize this session's work and log it to your worklog (time reporting) |
| `/update-template` | Check Fae for a newer published agent-template version and apply it |

## Reviews are bounded

Reviewers report what is broken — bugs, broken acceptance criteria, secrets, convention breaks
visible in the diff, and scope creep — and list everything else in one line for `/harden`
(`rules/simplicity.md`). One round, then one confirmation that the fixes landed. There is no
third round: what is still open is a bug you fix now or a work item.

## Token Optimization

Use Sonnet for orchestration, Opus only where needed. Run Claude Code with Sonnet as the default model (`claude --model sonnet`). Subagents use their specified models automatically.

| Model | Agents | Why |
|-------|--------|-----|
| **opus** | architect, security-reviewer, tdd-implementer | Critical decisions |
| **fable** | planner | Long-horizon breakdown of a whole feature |
| **sonnet** | code-reviewer, refactor-cleaner, tdd-test-writer | Judgment calls |
| **haiku** | build-error-resolver, doc-updater, e2e-runner | Structured tasks |

**A command backed by an agent must actually spawn it.** The commands above are briefs for
their agent, not checklists for the main session — working through one inline loses the
agent's separate context *and* silently runs the work on your session's model. For the review
agents this is enforced: the Workflow Gate (`rules/hooks.md`) refuses to end a turn in which
source code changed but no review agent ran.

Each agent's model lives in the `model:` field of its own file under `agents/`. The field
takes the same values as the `--model` flag — the short aliases `opus`, `sonnet`, `haiku`,
`fable`, or a full model id — plus `inherit` to use the main conversation's model. Change
the field to change the agent's model, and update the table above so the two agree. Only use
values from that list: an unrecognized value is not rejected, and a silent fallback would
leave an agent quietly running on the wrong model.

**NEVER override agent models.** Each agent has the optimal model in its frontmatter. Overriding wastes tokens.
