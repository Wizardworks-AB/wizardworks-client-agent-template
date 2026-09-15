# Agents and Commands

## Specialist Agents

Ten specialist agents enforce the engineering standard:

| Agent | Role | Command |
|-------|------|---------|
| **Planner** | Acceptance criteria and the task breakdown | `/plan`, and step 1 of every `/feature` |
| **Implementer** | Build one task: the code, its test, the real-path check | step 2 of every `/feature`, one spawn per task |
| **Architect** | Shape a design, review structure | `/plan`, `/harden` |
| **Code Reviewer** | Find what is broken in a change | `/code-review` (and every `/feature`) |
| **Security Reviewer** | Find concrete exposures | `/security-review`, `/harden` |
| **Build Error Resolver** | Fix compilation issues | `/build-fix` |
| **E2E Runner** | Test user flows | `/e2e` |
| **Refactor Cleaner** | Improve code quality | `/refactor-clean` |
| **Doc Updater** | Maintain documentation | `/update-docs` |
| **Diagram Drawer** | Lay out and write a draw.io diagram from an inventory | `/diagram` |

## Additional Commands

| Command | Purpose |
|---------|---------|
| `/feature` | The feature flow — worktree, a live `TodoWrite` task list tagged by work item, criteria and tasks from the planner, one implementer spawn per task, one bounded review round, draft PR. Every step is a subagent; the main session orchestrates and never touches source (the security reviewer joins for sensitive changes) |
| `/harden` | Deliberate hardening of a module, diff or release — architect and security reviewer with their full checklists; findings become prioritized work items you approve, not an inline fix loop |
| `/prototype-scan` | Scan a customer prototype repo for changes since the last scan, screenshot the affected routes, draft Feature/User Story items in production language and create them only after your approval |
| `/document` | A report, memo, proposal or estimate as a paginated A4 PDF in the organization's visual identity (Typst; the `document` skill) |
| `/deck` | A pitch, proposal presentation or status update as a landscape slide PDF in the same identity (the `deck` skill; identity configured once in the `brand` skill) |
| `/diagram` | A system map, integration flow or architecture as an editable draw.io file in the same identity — the main session writes the inventory, the diagram-drawer agent draws (the `diagram` skill) |
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
| **opus** | architect, security-reviewer, implementer | Critical decisions — and the code itself |
| **fable** | planner, diagram-drawer | Long-horizon breakdown of a whole feature; long, exact XML laid out in one pass |
| **sonnet** | code-reviewer, refactor-cleaner | Judgment calls |
| **haiku** | build-error-resolver, doc-updater, e2e-runner | Structured tasks |

**A command backed by an agent must actually spawn it.** The commands above are briefs for
their agent, not checklists for the main session — working through one inline loses the
agent's separate context *and* silently runs the work on your session's model. In `/feature`
that goes for every step, the implementation included: the main session orchestrates — task
list, briefs, reports, commit, PR — and the agents plan, build and review. Two hooks enforce
it (`rules/hooks.md`): inside `/feature` the flow guard refuses a source write that does not
come from a subagent, and in any session the Workflow Gate refuses to end a turn in which
source code changed but no review agent ran.

Each agent's model lives in the `model:` field of its own file under `agents/`. The field
takes the same values as the `--model` flag — the short aliases `opus`, `sonnet`, `haiku`,
`fable`, or a full model id — plus `inherit` to use the main conversation's model. Change
the field to change the agent's model, and update the table above so the two agree. Only use
values from that list: an unrecognized value is not rejected, and a silent fallback would
leave an agent quietly running on the wrong model.

**NEVER override agent models.** Each agent has the optimal model in its frontmatter. Overriding wastes tokens.
