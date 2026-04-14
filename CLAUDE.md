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

This agent is connected to the Fae knowledge graph via Remindr MCP. The knowledge graph is a shared, persistent memory across all agents and sessions working on this project. All tools below are MCP tools provided by the Remindr server.

### Session Flow

Follow this flow in every session:

1. **Session start** → `briefing(sinceLastSession: true)` — Orient yourself. See what happened since your last session: recent decisions, new blockers, unread messages.
2. **Check messages** → `inbox()` — Check for messages from other agents or team members. Use `read_thread(threadId)` for full content.
3. **Before implementation** → `context(query)` — Semantic search for relevant knowledge. Check if similar decisions exist, known gotchas apply, or related work is in progress.
4. **After decisions** → `decide(decision, rationale)` — Document every architecture or design decision. Include `alternatives` considered and `supersedes` if replacing a previous decision. Remindr automatically detects contradictions with existing decisions.
5. **New insights** → `remember(type, title, content)` — Save facts, gotchas, preferences, and entity knowledge. Remindr auto-deduplicates and auto-links to related nodes.
6. **Blockers** → `block(description, urgency)` / `resolve(nodeId, resolution)` — Track blockers immediately with urgency level.
7. **Communication** → `send(to, subject, content)` — Communicate with other agents. Use `"*"` for broadcast.
8. **Session end** → `remember("state", title, content)` — Persist session state so the next session can pick up where you left off.

### Read Tools

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `briefing` | `project?`, `recentHours?` (default 24), `sinceLastSession?` (default false), `timezone?` | Project summary — active projects, open blockers, recent decisions, stale items |
| `context` | `query`, `project?` | Semantic search in the knowledge graph for relevant knowledge |
| `status` | `project?` | Current project state — active decisions, open blockers, recent changes |
| `why` | `query`, `project?` | Trace decision chains — follows led_to, supersedes, contradicts edges |
| `get` | `nodeId` | Fetch full untruncated node content (use when context() truncates) |
| `list` | `type?`, `status?`, `project?` | List nodes with filters. Types: `decision, fact, blocker, gotcha, preference, state, entity, plan`. Statuses: `active, resolved, superseded, stale` |
| `blockers` | `project?` | List all active blockers. Omit project to see across all projects |
| `inbox` | `includeRead?` (default false) | Check messages. Default shows only unread threads |
| `read_thread` | `threadId` | Read full thread content — all messages, untruncated. Auto-marks as read |
| `list_agents` | *(none)* | List all known agents in the system |

### Write Tools

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `decide` | `decision`, `rationale`, `project?`, `alternatives?` (string[]), `supersedes?` (nodeId), `relatedTo?` (nodeId[]) | Record a decision with rationale. Auto-detects contradictions with existing decisions and creates contradiction nodes. Use `supersedes` when replacing a previous decision. |
| `remember` | `type`, `title`, `content`, `project?`, `relatedTo?` (nodeId[]) | Store knowledge. Types: `fact, gotcha, preference, state, entity, plan`. Do NOT use for decisions (use `decide`) or blockers (use `block`). Auto-deduplicates via embedding similarity. |
| `block` | `description`, `project?`, `urgency?` (`low/medium/high/critical`), `relatedTo?` (nodeId[]) | Register a blocker. Urgency defaults to medium if omitted. |
| `resolve` | `nodeId`, `resolution` | Resolve a blocker. Automatically creates a linked fact node with the resolution. |
| `forget` | `nodeId`, `reason?` | Mark knowledge as stale. If forgetting a decision, also marks linked contradictions as stale. |
| `link` | `fromNodeId`, `toNodeId`, `type` | Create typed edge. Types: `led_to, contradicts, depends_on, supersedes, related_to` |
| `send` | `to`, `subject`, `content`, `relatedTo?` (nodeId) | Send message to another agent. Use `"*"` for broadcast. |
| `reply` | `threadId`, `content`, `relatedTo?` (nodeId) | Reply in a message thread |
| `mark_read` | `threadId` | Mark a thread as read without reading full content |
| `propose` | `content`, `project?`, `task?`, `repo?`, `branch?`, `relatedTo?` (nodeId) | Submit an observation without classifying it. Sage (the orchestrator agent) decides if and how to add it to the graph. Use this when you observe something noteworthy but aren't sure how to classify it, or when you only have Propose permission. |

### Project Management

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `project` | `name` | Create or get a project. If the project doesn't exist, creates it with base entity nodes. |
| `audit` | `project?`, `agent?`, `type?`, `status?`, `from?`, `to?`, `format?` (`table/csv`), `limit?`, `offset?` | Full audit log — who created/updated each node, when, type, status. For traceability and compliance. |

### Automatic Intelligence

Remindr does several things automatically — you don't need to trigger these:

- **Deduplication** — Before creating any node, Remindr checks embedding similarity. Duplicates are rejected with a message showing the existing node.
- **Contradiction detection** — When you use `decide()`, Remindr compares against existing decisions. If a conflict is detected (similarity 0.78-0.84), a `contradiction` node is created automatically with edges to both decisions.
- **Auto-linking** — New nodes are automatically linked to semantically related existing nodes via typed edges.
- **Confidence decay** — Old, unreferenced nodes gradually lose confidence over time.

### Rules

- **ALWAYS** use `decide()` for architecture and design decisions — never `remember("decision", ...)`. The `decide` tool has contradiction detection that `remember` does not.
- **ALWAYS** run `briefing(sinceLastSession: true)` at the start of every session before doing any work.
- **ALWAYS** save gotchas with `remember("gotcha", title, content)` when encountering surprises or non-obvious behavior.
- **ALWAYS** document blockers immediately with `block()` — include `urgency` level.
- **ALWAYS** check `inbox()` at session start and periodically during long sessions.
- **ALWAYS** include `rationale` and `alternatives` when using `decide()` — decisions without reasoning are useless for future sessions.
- **NEVER** make decisions that contradict existing decisions without explicitly recording a new `decide()` with `supersedes` pointing to the old decision's nodeId.
- **PREFER** `context(query)` over re-discovering knowledge that may already exist in the graph.
- **PREFER** `propose(content)` when you observe something but aren't sure how to classify it — let Sage decide.

---

## Reference

| Document | Purpose |
|----------|---------|
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
