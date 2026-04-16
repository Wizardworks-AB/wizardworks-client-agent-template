# Agents and Commands

## Specialist Agents

Ten agents enforce the Wizardworks standard:

| Agent | Role | Command |
|-------|------|---------|
| **Planner** | Break down requirements | `/plan` |
| **Architect** | Validate design decisions | Direct invoke |
| **TDD Test Writer** | Write failing tests first (RED) | `/tdd-test` |
| **TDD Implementer** | Make tests pass (GREEN→REFACTOR) | `/tdd-implement` |
| **Code Reviewer** | Verify quality and patterns | `/code-review` |
| **Security Reviewer** | Find vulnerabilities | `/security-review` |
| **Build Error Resolver** | Fix compilation issues | `/build-fix` |
| **E2E Runner** | Test user flows | `/e2e` |
| **Refactor Cleaner** | Improve code quality | `/refactor-clean` |
| **Doc Updater** | Maintain documentation | `/update-docs` |

## Additional Commands

| Command | Purpose |
|---------|---------|
| `/commit` | Validate against P&P, generate docs, commit + push |
| `/retrospective` | Run session retrospective, save learnings to memory |

## Parallel Execution

Run independent agents in parallel to maximize efficiency.

**Sequential** (must run in order):
```
/plan → architect → /tdd-test → /tdd-implement
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
| **sonnet** | planner, code-reviewer, refactor-cleaner, tdd-test-writer | Judgment calls |
| **haiku** | build-error-resolver, doc-updater, e2e-runner | Structured tasks |

**NEVER override agent models.** Each agent has the optimal model in its frontmatter. Overriding wastes tokens.
