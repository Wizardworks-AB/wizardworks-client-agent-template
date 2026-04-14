# [CUSTOMER_NAME] — Client Agent

## Project

- **Customer:** [CUSTOMER_NAME]
- **Domain:** [DOMAIN_DESCRIPTION]
- **Code repository:** ~/code/[PROJECT_NAME]/
- **Tech stack:** [TECH_STACK or "See CONSTITUTION.md defaults"]
- **Fae URL:** [FAE_REMINDR_URL]

## Project-Specific Notes

Add any project-specific context here:
- Technology choices that differ from standard (e.g., "Uses Dapper, not EF Core")
- Legacy patterns to follow
- Domain-specific terminology
- Key contacts or resources

---

# Wizardworks Development Standard

This is how Wizardworks builds software.

---

## The Wizardworks Way

Every feature, every bug fix, every change follows this workflow:

```
TASK RECEIVED
     ↓
┌─────────────────────────────────────────────────────────────────┐
│  1. PLAN          /plan [feature]                               │
│                   Break down requirements, identify risks       │
├─────────────────────────────────────────────────────────────────┤
│  2. DESIGN        architect agent                               │
│                   Validate architecture, approve design         │
├─────────────────────────────────────────────────────────────────┤
│  3. IMPLEMENT     /tdd-test then /tdd-implement                  │
│                   Write tests FIRST, then code (RED→GREEN→BLUE) │
├─────────────────────────────────────────────────────────────────┤
│  4. REVIEW        /code-review                                  │
│                   Verify quality, patterns, standards           │
├─────────────────────────────────────────────────────────────────┤
│  5. SECURE        /security-review                              │
│                   Check for vulnerabilities                     │
├─────────────────────────────────────────────────────────────────┤
│  6. VERIFY        /e2e run                                      │
│                   Test critical user flows                      │
├─────────────────────────────────────────────────────────────────┤
│  7. DOCUMENT      /update-docs                                  │
│                   Keep documentation current                    │
└─────────────────────────────────────────────────────────────────┘
     ↓
READY TO MERGE
```

---

## Non-Negotiable Standards

### Test-Driven Development (AI Workflows)
When working with AI agents, every line of code starts with a failing test.
- **RED**: Write a failing test
- **GREEN**: Write minimal code to pass
- **BLUE**: Refactor and improve

**Success criteria:**
- **100% test pass rate** - ALL tests must pass, no exceptions
- **80%+ code coverage** - Percentage of code exercised by tests

These are different metrics. "62/77 tests passing" is NOT 80% coverage - it's 15 failing tests.

**Note**: TDD is mandatory for AI-assisted development. For human developers without AI assistance, TDD is encouraged but not required.

### Controller-Service-Repository
Strict layer separation:
- **Controllers**: HTTP concerns only
- **Services**: Business logic only
- **Repositories**: Data access only

### Public IDs
Never expose database IDs. Ever.
- Internal: `MagicId` (int, database)
- External: `PublicMagicId` (string, API)

### DTOs
All API boundaries use DTOs. Entities stay internal.

### Business Logic in Backend
When projects have backend/frontend separation, all business logic lives in the backend.
- **Security**: Rules can't be bypassed by manipulating frontend code
- **Consistency**: Single source of truth for business rules
- **Maintainability**: Logic in one place, not duplicated

The frontend handles presentation and user interaction. The backend makes decisions.

### Infrastructure as Code
All Azure resources defined in Bicep. No portal clicking.

### Security First
- No hardcoded secrets (use Key Vault)
- Validate all inputs
- Parameterized queries only

---

## The Agents

Ten specialists enforce the Wizardworks standard:

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

Additional workflow commands:

| Command | Purpose |
|---------|---------|
| `/commit` | Validate against P&P, generate docs, commit + push |
| `/retrospective` | Run session retrospective, save learnings to memory |

Each agent validates its domain. Together, they ensure Wizardworks quality.

---

## Continuous Improvement

Run `/insight` or `/retrospective` regularly to identify patterns and save learnings:

- **Daily**: End of day — run `/retrospective`, save insights to memory
- **Per feature**: After shipping — reflect on what worked
- **Sprint**: Sprint retrospective — team-wide review

Saved insights carry forward to future sessions, making Claude better over time.

---

## The Hooks

14 automated guards that run when you write code:

### Blocking (Will Stop You)
- **Check for Hardcoded Secrets** - No API keys, passwords, tokens in code

### Warning (Will Tell You)
- **Check Database ID Exposure** - Use Public IDs
- **Enforce DTO Usage** - Use DTOs in Controllers
- **Layer Separation Check** - Respect CSR pattern
- **Check console.log** - Remove debug statements
- **Async/Await Check** - Proper async patterns
- **Immutability Check** - No state mutations
- **TanStack Query Check** - Use TanStack for data fetching

### Reminders (Will Prompt You)
- **Check Test Coverage** - 100% passing, 80%+ coverage
- **Verify TDD Workflow** - Tests first
- **Infrastructure as Code** - Use Bicep
- **Security Review Reminder** - Check security
- **Docker Configuration** - Update containers
- **Code Review Reminder** - Run /code-review

---

## Workflow

**NEVER SKIP STEPS.** Every step exists for a reason. "I'll do it later" = "I'll forget to do it."

### Feature Development
```bash
# Sequential (each depends on previous) - DO NOT SKIP ANY
/plan add user authentication      # Break down requirements
architect validate design          # Approve architecture - BEFORE writing tests
/tdd-test user login               # Write failing tests (RED)
/tdd-implement user login          # Make tests pass (GREEN→REFACTOR)

# Parallel (no dependencies - run ALL of these)
/code-review + /security-review + /e2e + /update-docs
```

### Quick Bug Fix
```bash
/tdd-test login timeout issue      # Test that reproduces bug
/tdd-implement login timeout issue # Fix to make test pass
/code-review + /security-review + /e2e + /update-docs  # ALL validation (parallel)
```

Skipping steps ships bugs.

---

## Technology Stack

### Backend
- .NET 10+, ASP.NET Core
- Entity Framework Core (new projects) or Dapper (existing projects)
- xUnit, FluentAssertions, Moq
- Docker

### Frontend
- React 19+, TypeScript (strict mode)
- TanStack Query, Form, Table, Router
- Vitest, Playwright
- Tailwind CSS

### Infrastructure
- Azure (App Service, SQL, Key Vault)
- Bicep (Infrastructure as Code)
- GitHub Actions / Azure DevOps

### Existing Projects
**Follow existing patterns.** If a project uses Dapper instead of EF Core, keep using Dapper. Don't mix - consistency matters more than the "new project" standard.

### Template Variants
This is the **greenfield** template. For other project types, see `variants/`:
- `existing-codebase/` — Follow customer patterns, gradual improvement
- `maintenance/` — Bug-focused, fast cycles, minimal changes

---

## Superpowers Plugin (Optional)

If Superpowers is installed, it provides additional workflows (brainstorming, execute-plan, git worktrees). Our skills, hooks, and rules act as an overlay on top. See the [Wizardworks Agentic Patterns and Practices](https://github.com/Wizardworks-AB/wizardworks-agentic-patterns-and-practices) for details.

---

## Fae Knowledge Graph (Remindr MCP)

This agent is connected to the Fae knowledge graph via Remindr MCP. The knowledge graph is a shared, persistent memory across all agents and sessions working on this project.

### Session Flow

Follow this flow in every session:

1. **Session start** → `briefing()` — Orient yourself. Get a summary of project state, recent decisions, and active blockers.
2. **Before implementation** → `context(query)` — Search for relevant knowledge. Check if similar decisions have been made, known gotchas exist, or related work is in progress.
3. **After decisions** → `decide(decision, rationale)` — Document every architecture or design decision with clear rationale. This enables traceability and contradiction detection.
4. **New insights** → `remember(type, title, content)` — Save facts, gotchas, preferences, and entity knowledge as you discover them.
5. **Blockers** → `block(description)` / `resolve(nodeId, resolution)` — Track blockers immediately. Don't wait until session end.
6. **Communication** → `send(to, subject, content)` / `inbox()` — Communicate with other agents. Check inbox regularly.
7. **Session end** → `remember("state", ...)` — Persist session state so the next session can pick up where you left off.

### Read Tools

| Tool | Purpose | When to use |
|------|---------|-------------|
| `context(query)` | Semantic search in the knowledge graph | Before starting work on any topic — check what's known |
| `briefing()` | Project summary and orientation | Start of every session |
| `status()` | Current project state | When you need a quick overview of active work |
| `why(query)` | Trace decision chains | When you need to understand why something was decided |
| `get(nodeId)` | Fetch full node content | When you have a specific node ID from search results |
| `list(type?, status?)` | List nodes with filters | When browsing decisions, blockers, or facts |
| `blockers()` | List all active blockers | Before planning work — check what's blocked |
| `inbox()` | Check unread messages | Regularly during session, especially at start |

### Write Tools

| Tool | Purpose | When to use |
|------|---------|-------------|
| `decide(decision, rationale)` | Record a decision with reasoning | Every architecture/design decision — mandatory |
| `remember(type, title, content)` | Store knowledge (fact, gotcha, plan, preference, entity) | When discovering reusable insights |
| `block(description)` | Register a blocker | Immediately when encountering a blocker |
| `resolve(nodeId, resolution)` | Resolve a blocker | When a blocker is cleared |
| `forget(nodeId)` | Mark knowledge as stale | When information is no longer accurate |
| `link(from, to, type)` | Create typed edges between nodes | When connecting related knowledge |
| `send(to, subject, content)` | Send message to another agent | When coordination is needed |
| `reply(threadId, content)` | Reply in a message thread | When responding to incoming messages |

### Rules

- **ALWAYS** use `decide()` when making architecture or design decisions. No exceptions.
- **ALWAYS** run `briefing()` at the start of every session before doing any work.
- **ALWAYS** save gotchas with `remember("gotcha", ...)` when encountering surprises or non-obvious behavior.
- **ALWAYS** document blockers immediately with `block()` — don't wait.
- **ALWAYS** check `inbox()` at session start and periodically during long sessions.
- **NEVER** make decisions that contradict existing decisions without explicitly recording a new `decide()` that supersedes the old one.
- **PREFER** `context(query)` over re-discovering knowledge that may already exist in the graph.

---

## Reference

| Document | Purpose |
|----------|---------|
| [.claude/CHANGELOG.md](.claude/CHANGELOG.md) | What's changed (for humans) |
| [.claude/plans/](.claude/plans/) | Decision records (why changes were made) |
| [.claude/CONSTITUTION.md](.claude/CONSTITUTION.md) | Engineering principles |
| [.claude/DOC.md](.claude/DOC.md) | Complete usage guide |
| [.claude/hooks/README.md](.claude/hooks/README.md) | Hook system details |

### Skills (Pattern Libraries)
- `.claude/skills/backend-patterns-dotnet/` - .NET/C# patterns
- `.claude/skills/frontend-patterns-react/` - React/TypeScript patterns
- `.claude/skills/infrastructure-as-code/` - Bicep/Docker patterns

### Rules (Standards)
- `.claude/rules/testing.md` - TDD, coverage requirements
- `.claude/rules/coding-style.md` - Naming, formatting
- `.claude/rules/security.md` - Security requirements
- `.claude/rules/git-workflow.md` - Commits, branches, PRs

---

## Why This Works

Agents run in **separate context windows** - your main conversation stays clean:
- Without agents: ~63K tokens per feature
- With agents: ~9K tokens per feature
- **86% context savings**

You can work longer, think deeper, ship faster.

---

## Token Optimization

**Use Sonnet for orchestration, Opus only where needed.**

Run Claude Code with Sonnet as the default model:
```bash
claude --model sonnet
```

The orchestrating model (your main conversation) just routes tasks to agents. It doesn't need Opus-level reasoning. Subagents will still use their specified models:

| Model | Agents | Why |
|-------|--------|-----|
| **opus** | architect, security-reviewer, tdd-implementer | Critical decisions, can't afford mistakes |
| **sonnet** | planner, code-reviewer, refactor-cleaner, tdd-test-writer | Good reasoning, judgment calls |
| **haiku** | build-error-resolver, doc-updater, e2e-runner | Structured tasks, pattern matching |

**Result:** ~40% token savings on orchestration while maintaining quality where it matters.

### NEVER Override Agent Models

**DO NOT specify a model parameter when invoking agents.** Each agent has the optimal model in its frontmatter. Overriding wastes tokens.

```
WRONG: Task tool with model: "sonnet" for doc-updater (wastes 3-4x tokens)
RIGHT: Task tool WITHOUT model parameter (uses agent's configured haiku)
```

Only override with documented justification.

---

## The Standard

**Mandatory for AI workflows - no exceptions:**
- TDD (tests first)
- Code review (every change)
- Security review (auth, data, external APIs)
- 100% tests passing, 80%+ coverage

### Self-Validation Loop

After `/tdd-implement`, run ALL validation agents:

```
/tdd-implement → /code-review + /security-review + /e2e + /update-docs (parallel)
                        ↓
              Issues found? → FIX → Re-run reviews
                        ↓
                  All clean? → DONE
```

**Fix issues immediately** - don't just report them. Re-run reviews until clean.

---

*The Wizardworks Way - Quality by Design*
