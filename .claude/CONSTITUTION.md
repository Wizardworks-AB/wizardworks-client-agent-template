# Engineering Constitution

**Version**: 1.1
**Last Updated**: 2025-01-26
**Status**: Active

---

## Purpose

This constitution defines the core principles, standards, and practices for engineering work on this project. It is the foundation for an AI-first approach to software development.

**Important**: All contributors and AI agents working on this project must adhere to these standards rigorously.

---

## Core Principles

### 1. AI-First Development
This project embraces AI as a core development partner. We leverage Claude Code and AI agents to enhance productivity while maintaining human oversight and responsibility.

### 2. Quality Over Speed
We value sustainable, high-quality code over quick fixes. Quality enables long-term velocity.

### 3. Tested Code
Tests are not optional. Every change ships with the tests that prove it — integration tests at the real boundary, end-to-end tests for the critical flows. No coverage percentage.

### 4. Infrastructure as Code
All infrastructure is defined in code. Manual resource creation is prohibited.

### 5. Security First
Security is non-negotiable. We validate inputs, protect secrets, and follow security best practices always.

### 6. Continuous Learning
We document patterns, learn from experience, and continuously improve our practices.

---

## Technology Standards

This constitution is stack-neutral. It defines the principles every project follows regardless of language, framework, or cloud.

Concrete technology choices — the required language runtime and versions, ORM, test framework, UI libraries, cloud platform, IaC tooling, and CI/CD — plus the code examples that demonstrate them, live in the stack overlay you selected at download. See `rules/<stack>.md` and the accompanying stack skill.

**Existing projects**: Follow existing patterns. Consistency within a project matters more than adopting a "new project" default.

---

## Architectural Standards

The following are architectural principles. Their concrete expression in a given language or framework — including code examples — lives in the stack overlay (`rules/<stack>.md` and the stack skill).

### Layered Architecture (MANDATORY)

Backend applications must separate responsibilities into distinct layers, typically:

- **Interface layer** — transport/HTTP concerns, routing, request validation
- **Application/service layer** — business logic and orchestration
- **Data-access layer** — persistence and queries

**Rules**:
- Each layer has a single responsibility.
- No layer skipping (e.g. calling the data-access layer directly from the interface layer is wrong).

### Public ID Pattern (MANDATORY)

**Rule**: Never expose internal database IDs across an external boundary. Always expose a separate, opaque public identifier and keep the internal key private.

### DTO Pattern (MANDATORY)

**Rule**: All external inputs and outputs use dedicated data-transfer objects. Never expose persistence entities directly across an API boundary.

### Component Composition (Frontend)

**Rule**: Build UIs from small, focused components. Avoid large monolithic components.

---

## Development Standards

### Testing (MANDATORY)

Every change ships with tests that exercise the behavior and fail when it is broken
(`rules/testing.md`). Write test and code in whichever order is fastest; run the whole suite
after every task.

**Where to test**:
- Integration tests at the real boundary (endpoint, database, message handler) — the default
- End-to-end tests for the critical user flows
- Unit tests only where the logic is intricate

There is no coverage percentage. A test earns its place by catching a real regression.

### Coding Style

Language-specific naming conventions, file/method size limits, and formatting rules live in the stack overlay (`rules/coding-style.md` and `rules/<stack>.md`).

**Universal**:
- Clear, descriptive names
- Immutability patterns (avoid in-place mutation of shared state)
- Early returns to reduce nesting
- Extract reusable logic
- No commented-out code
- No debug/console logging in production

### Security (MANDATORY)

**Never**:
- Hardcode secrets (API keys, passwords, connection strings)
- Expose database IDs externally
- Build queries via string concatenation
- Render unsanitized user-supplied HTML
- Skip input validation
- Disable transport encryption (HTTPS/TLS)

**Always**:
- Store secrets in a managed secret store or environment variables
- Use parameterized queries
- Validate all user inputs
- Enable authentication/authorization
- Implement rate limiting
- Use HTTPS only
- Scan dependencies for vulnerabilities

### Git Workflow

**Commit Message Format**:
```
<type>: <description>

<optional body>
```

**Types**: feat, fix, refactor, docs, test, chore, perf, ci, build

**Branch Naming**:
```
feature/<short-description>
fix/<short-description>
refactor/<short-description>
```

**Pre-Commit Checklist**:
- [ ] Code builds successfully
- [ ] All tests pass
- [ ] Tests for the change pass
- [ ] No debug/console statements
- [ ] No hardcoded secrets
- [ ] Code follows the style guide
- [ ] Linter passes

### Infrastructure as Code

**MANDATORY**: All infrastructure is defined as code and version-controlled. No manual creation via a cloud portal. Deployment is automated through CI/CD.

The concrete IaC tooling, directory layout, and deployment pipeline are defined in the stack overlay (`rules/<stack>.md` and the infrastructure stack skill).

---

## AI Agent Standards

### Standards Apply to Agents

All AI agents (Claude Code agents, subagents) working on this project are held to the same standard as human contributors and must:

1. **Adhere to all standards** defined in this constitution
2. **Follow architectural patterns** (layered architecture, public IDs, DTOs)
3. **Ship tests with the code** (integration and e2e where it matters)
4. **Enforce security** (no secrets, validate inputs, parameterized queries)
5. **Use Infrastructure as Code** for all cloud resources
6. **Follow the coding style** (naming conventions, size limits, immutability)
7. **Respect the git workflow** (proper commits, branch naming, pre-commit checks)

### Agent Types

**Architect Agent**:
- Design system architecture
- Evaluate technical trade-offs
- Ensure alignment with the project's chosen stack
- Plan infrastructure deployments

**Code Reviewer Agent**:
- Review for quality and security
- Check adherence to these standards
- Verify layer separation
- Ensure public ID and DTO usage

**Implementer Agent**:
- Build one task per spawn: the least code the acceptance criterion needs and the test that proves it
- Run the whole suite and exercise the real path
- Report in a few lines; the main session never edits source in `/feature`

### Agent Usage

**When to Use**:
- Complex features requiring planning → Architect
- Every implementation task in `/feature` → Implementer
- After writing code → Code Reviewer

**How to Invoke**:
- Via commands: `/feature`, `/code-review`, `/plan`
- Directly in Claude Code
- As part of automated workflows

### Parallel Execution (RECOMMENDED)

**Run independent agents in parallel to maximize efficiency.**

**Sequential Dependencies** (must run in order):
```
planner → architect → implementer (code + tests, one spawn per task)
```

**Parallel Validation** (run simultaneously after implementation):
```
/code-review + /security-review + /e2e + /update-docs
```

These validation agents work on the same code independently. Running them in parallel saves significant time without compromising quality.

**Example workflow**:
1. `planner` (sequential)
2. `architect` (sequential)
3. `implementer` — code and tests together, one spawn per task (sequential)
4. `/code-review` + `/security-review` + `/e2e` + `/update-docs` (PARALLEL)

In `/feature` every one of these steps is a subagent. The main session orchestrates — task
list, briefs, reports, commit, PR — and does not read or write source itself; that keeps the
conversation small and runs each step on the model chosen for it.

### Self-Validation (MANDATORY)

**After ANY implementation, Claude MUST validate AND fix issues found.**

```
implementer
     ↓
/code-review + /security-review + /update-docs (PARALLEL)
     ↓
Issues found? → FIX → Re-run reviews
     ↓
All clean? → DONE
```

**Rules**:
- Never skip validation after implementation
- Don't just report issues — FIX THEM
- Re-run the review that found issues until clean
- Verify tests pass

**Wrong**: implement → `/code-review` reports issues → done (issues unfixed!)
**Right**: implementer → `/code-review` reports issues → implementer fixes → reviewer confirms the fixes → done

### Agent Model Selection (MANDATORY)

**NEVER override agent models when invoking them.** Each agent has an optimal model configured in its frontmatter.

| Model | Agents | Why |
|-------|--------|-----|
| **haiku** | doc-updater, e2e-runner, build-error-resolver | Structured tasks, no reasoning needed |
| **sonnet** | code-reviewer, refactor-cleaner | Judgment calls |
| **fable** | planner | Long-horizon breakdown of a whole feature |
| **opus** | architect, security-reviewer, implementer | Deep reasoning, critical decisions — and the code itself |

**Wrong**: Invoke doc-updater with `model: sonnet` (wastes 3-4x tokens)
**Right**: Invoke doc-updater without model parameter (uses configured haiku)

Only override with documented justification. Cost optimization is mandatory.

---

## Enforcement

### Code Quality Gates

**Pre-Commit** (Local):
- Build succeeds
- Tests pass
- Linter passes
- No secrets detected

**Pre-Merge** (CI/CD):
- All tests pass
- No security vulnerabilities
- Code review approved

**Protected Branches**:
- `main` requires:
  - Pull request
  - Passing CI/CD
  - Code review approval
  - All checks passing

### Consequences

**Non-Compliance**:
- PRs blocked until standards met
- Code cannot be merged
- CI/CD pipeline fails

**Exceptions**:
- Must be documented
- Require architect approval
- Technical debt tracked

---

## Continuous Improvement

### Pattern Documentation

When discovering new patterns or solving novel problems:
1. Document the solution
2. Add to the appropriate skill file
3. Share with the team
4. Update the constitution if needed

### Feedback Loop

- Regular retrospectives
- Pattern library updates
- Constitution amendments (versioned)
- Tool and process improvements

---

## Quick Reference

### Essential Files

| File | Purpose |
|------|---------|
| [DOC.md](DOC.md) | Complete guide to using this gallery |
| [CONSTITUTION.md](CONSTITUTION.md) | This file — core, stack-neutral standards |
| `rules/<stack>.md` | Stack-specific standards for the overlay you selected |
| [rules/testing.md](rules/testing.md) | Testing requirements and standards |
| [rules/security.md](rules/security.md) | Security guidelines |
| [rules/coding-style.md](rules/coding-style.md) | Code style standards |
| [rules/git-workflow.md](rules/git-workflow.md) | Git and version control |

### Essential Commands

| Command | Purpose |
|---------|---------|
| `/feature [description]` | Deliver a feature end to end — worktree, criteria and tasks from the planner, one implementer spawn per task, one review round, draft PR. Every step a subagent |
| `/code-review [file]` | Review code for quality and standards |
| `/plan [feature]` | Plan architecture for a complex feature |
| `/document [brief]` | A report, memo or proposal as a paginated A4 PDF in the organization's identity |
| `/deck [brief]` | A pitch or presentation as a landscape slide PDF in the same identity |
| `/diagram [brief]` | A system map, flow or architecture as a draw.io file in the same identity, drawn by the diagram-drawer agent |

### Essential Agents

| Agent | When to Use |
|-------|-------------|
| **architect** | Planning new features, making design decisions |
| **implementer** | Every implementation task in `/feature` — one task per spawn |
| **code-reviewer** | After writing code, before creating a PR |

---

## Getting Started

### New Project Setup

1. **Review this CONSTITUTION.md**
2. **Read [DOC.md](DOC.md) for detailed guidance**
3. **Read the stack overlay** (`rules/<stack>.md`) for concrete tooling and setup
4. **Set up your development environment** per the stack overlay
5. **Configure Claude Code** with the project's agents and rules
6. **Start with `/feature` for your first feature**

### For Existing Projects

1. **Audit against this constitution**
2. **Identify gaps**
3. **Create a migration plan**
4. **Incrementally adopt standards**
5. **Move infrastructure to code**
6. **Put integration and e2e tests around the critical flows**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.3 | 2026-09-14 | Every `/feature` step runs in a subagent; the implementer agent is added and the main session no longer edits source |
| 1.2 | 2026-09-13 | Tests ship with the code; the TDD agents and `/tdd` are retired |
| 1.1 | 2025-01-26 | Split TDD agent into test-writer and implementer |
| 1.0 | 2025-01-23 | Initial constitution |

---

## Maintenance

**Constitution Owner**: Engineering leadership
**Review Cadence**: Quarterly
**Amendment Process**: Proposal → Review → Approval → Version update

---

**Remember**: This constitution exists to enable rapid, high-quality software development. These standards are the foundation of an AI-first engineering culture. Follow them rigorously.
