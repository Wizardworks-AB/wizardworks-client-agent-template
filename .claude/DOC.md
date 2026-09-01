# AI Patterns and Practices Toolkit

## Quick Start

### TL;DR - What Is This?

This toolkit is an intelligent development kit for AI-assisted coding. It provides:

- 🎯 **AI Agents** - Specialists for planning, coding, testing, security, and deployment
- ⚡ **Commands** - Quick shortcuts for common workflows (`/tdd`, `/code-review`, etc.)
- 📋 **Rules** - Coding and security standards
- 🔄 **Contexts** - Execution environments for dev, review, and research
- 🛡️ **Hooks** - Automated guards preventing problematic code

Stack-specific patterns (backend, frontend, infrastructure) are delivered as an optional **stack overlay** you selected at download — the `core` toolkit is stack-neutral and makes no assumption about your language, framework, or cloud.

### Running Claude Code

**Use Sonnet for orchestration:**
```bash
claude --model sonnet
```

Subagents use their own models (Opus for critical tasks). This saves tokens while maintaining quality.

---

## Overview

This toolkit is a collection of reusable AI agents, commands, rules, and examples designed to accelerate development. It lets developers leverage pre-built AI-assisted workflows that enforce standards, best practices, and architectural patterns — independent of your technology stack.

### Purpose

Provide a curated set of AI patterns and practices so your team can:

- 💡 Rapidly implement features following proven architectural patterns
- ✅ Maintain consistent code quality and standards across projects
- 🎯 Enforce test-driven development (TDD) and code review best practices
- 🔒 Ensure security, scalability, and maintainability
- 🤖 Integrate Claude (via Claude Code) directly into development workflows
- 👥 Enable both individual developers and teams to work efficiently with consistent tooling

---

## Why Subagents Save Your Context

This is one of the most valuable aspects of the toolkit. Understanding how subagents work helps you run longer, more productive sessions without context bloat.

### The Core Concept: Separate Context Windows

Each agent runs in **its own isolated context window** - completely separate from your main conversation:

```
YOUR MAIN CONVERSATION (200K context budget)
├─ Your messages
├─ Your questions
├─ Your code changes
├─ Your reviews
└─ STAYS CLEAN AND FOCUSED

    ↓ When you invoke /tdd, /code-review, /security-review, etc.

AGENT RUNS IN SEPARATE CONTEXT (100K+ budget per agent)
├─ Agent reads 50 files? Uses agent's context, not yours
├─ Agent analyzes code? Uses agent's context, not yours
├─ Agent generates tests? Uses agent's context, not yours
└─ YOUR CONTEXT UNAFFECTED ✅
```

### Illustrative Token Usage Example

> **Note**: The following numbers are estimates to illustrate the concept. Actual token usage varies based on file sizes, complexity, and task scope. The key principle is that heavy exploration/analysis work happens in the agent's context, not yours.

**WITHOUT Subagents (Example Scenario):**
```
You need to implement a feature.
You read ~50 related files to understand architecture: ~40K tokens
You plan the feature: ~5K tokens
You implement: ~10K tokens
Code review analysis: ~8K tokens
Estimated total in main context: ~63K tokens (~31% of your budget)
Estimated context remaining: ~137K tokens
```

**WITH Subagents (Example Scenario):**
```
You invoke /plan
  └─ Planner Agent reads files: Uses AGENT'S CONTEXT ✅
  └─ Planner generates plan: Uses AGENT'S CONTEXT ✅
  └─ You receive plan summary: ~2K tokens in YOUR context
  └─ YOUR context cost: ~2K tokens

You invoke /tdd implement feature
  └─ TDD Agent reads codebase: Uses AGENT'S CONTEXT ✅
  └─ TDD Agent writes tests: Uses AGENT'S CONTEXT ✅
  └─ You receive guidance: ~3K tokens in YOUR context
  └─ YOUR context cost: ~3K tokens

You invoke /code-review
  └─ Reviewer reads all your code: Uses AGENT'S CONTEXT ✅
  └─ Reviewer analyzes patterns: Uses AGENT'S CONTEXT ✅
  └─ You receive feedback: ~4K tokens in YOUR context
  └─ YOUR context cost: ~4K tokens

ESTIMATED TOTAL IN YOUR CONTEXT: ~9K tokens (~4.5% of your budget)
Estimated context remaining: ~191K tokens ✅
```

### Why This Matters

The table below shows **estimated typical savings** for various workflows. Your actual results may vary:

| Scenario | Typical Without Subagents | Typical With Subagents | Estimated Savings |
|----------|---------------------------|------------------------|-------------------|
| Plan a feature (read many files) | ~40K tokens | ~2K tokens | Significant (~95%) ✅ |
| Review code (read all changes) | ~15K tokens | ~2K tokens | Significant (~87%) ✅ |
| Security audit (scan codebase) | ~25K tokens | ~3K tokens | Significant (~88%) ✅ |
| Build error diagnosis | ~12K tokens | ~2K tokens | Significant (~83%) ✅ |
| **Complete workflow** | **~63K tokens** | **~9K tokens** | **Significant (~86%) ✅** |

### When to Use Subagents vs Do Work Directly

#### ✅ Use Subagents When:
- You need to read/analyze multiple files
- Exploring codebase and documenting findings
- Running comprehensive checks (tests, security, architecture)
- You want to preserve context for other work
- You need parallel analysis (multiple agents at once)

#### ❌ Do Work Directly When:
- Simple single-file edits
- Quick questions about specific code
- You're already deep in a file and making changes
- Minimal context is needed
- You want immediate iterative feedback

### Parallel Execution Advantage

Multiple agents can run simultaneously, each with separate context:

```
START TASK
    ↓
YOU invoke /plan                     [Plan Agent: 100K context] ↓
YOU invoke /security-review         [Security Agent: 100K context] ↓
YOU invoke /tdd implement          [TDD Agent: 100K context] ↓
    ↓
All 3 run in parallel, each with independent context
All 3 complete without interfering
    ↓
YOU receive 3 results (~15K tokens total in YOUR context)
YOUR estimated remaining context: ~185K tokens for other work
```

### Best Practices for Maximum Efficiency

1. **Let agents do exploration work**: Use `/plan` to explore requirements
2. **Delegate heavy analysis**: Use `/code-review` for detailed feedback
3. **Use agents for verification**: Use `/e2e`, `/security-review` for validation
4. **Save your context for code work**: Keep your context for implementation
5. **Parallel operations**: Invoke multiple agents simultaneously
6. **Review agent outputs in main conversation**: Summarize findings, iterate

---

## Stack Skills (Overlay-Provided)

Skills are deep technical reference documentation for a specific technology area (backend, frontend, infrastructure).

**The `core` toolkit ships no stack skill.** Stack skills are provided by the **stack overlay** you selected when you downloaded this toolkit (for example `dotnet`, `react`, or `azure`). If you selected an overlay, its skills appear under `skills/` alongside this guide; if you selected none, the agents fall back to stack-neutral guidance.

Core does ship one stack-neutral skill: `meeting-capture` — recording a meeting (via the Fae Meeting Recorder bot or a local recording tool), transcribing it, and saving the notes to the knowledge graph.

To add or change stack skills later, re-download with the appropriate overlay selected, or drop your own `skills/<name>/SKILL.md` into the toolkit.

---

## Core Concepts

### The Standard (CLAUDE.md)

**CLAUDE.md** is the master configuration file that defines how the team builds software. It establishes:

- The 7-step workflow: PLAN → DESIGN → IMPLEMENT → REVIEW → SECURE → VERIFY → DOCUMENT
- Standards (TDD, coverage targets, code review, security review)
- How the agents and hooks work together

When you start Claude Code in your project, CLAUDE.md tells it exactly how to work.

### What Are Agents?

**Agents** are specialized AI roles that guide you through complex workflows. They act as team members and enforce your standards.

Each agent includes a **Hook Integration** section that shows which hooks automatically validate work in that agent's domain. This creates a self-validating workflow where agents and hooks complement each other.

### What Are Skills?

**Skills** are deep technical reference documentation defining patterns and standards for a specific technology area. Stack skills are provided by the stack overlay (see above); core ships the stack-neutral `meeting-capture` skill.

### What Are Commands?

**Commands** are quick-access shortcuts (using `/` syntax) that invoke agents with specific workflows.

### What Are Rules?

**Rules** are standards that ensure code quality, security, and consistency across projects.

### What Are Contexts?

**Contexts** define execution environments with specific rules and constraints for different development scenarios (dev, review, research).

### What Are Hooks?

**Hooks** are automated quality and security gates that run at critical workflow points, preventing problematic code from being committed or deployed.

### Self-Validating Workflows

**The system is self-validating.** Agents and hooks work together:

1. **Agents provide guidance** - They help you write code the right way
2. **Hooks provide enforcement** - They automatically catch mistakes when you Write/Edit files
3. **Each agent knows its hooks** - The Hook Integration section in each agent shows which hooks validate its domain

**Example: Code Reviewer + Hooks**
```
You invoke /code-review
        ↓
Code Reviewer analyzes your code
        ↓
Hooks run automatically when you edit files:
- Check for Hardcoded Secrets (universal)
- Stack-overlay checks, e.g. with the dotnet overlay:
  Database ID Exposure, DTO Usage, Layer Separation
        ↓
DOUBLE VALIDATION COMPLETE
```

This means fewer mistakes make it to production - agents catch issues during development, hooks catch anything that slips through.

---

## Folder Organization

```
.claude/                             # The toolkit (CLAUDE.md sits next to it at the project root)
├── CONSTITUTION.md                  # 📜 Core, stack-neutral engineering standards
├── DOC.md                           # This comprehensive guide
├── settings.json                    # Hook wiring (SessionStart, PreToolUse, PostToolUse)
├── agents/                          # AI agents for specific roles (each with Hook Integration)
│   ├── architect.md                 # 🏗️  Software architecture specialist
│   ├── build-error-resolver.md      # 🔧 Build failure diagnostics
│   ├── code-reviewer.md             # 👀 Code quality and standards enforcement
│   ├── doc-updater.md               # 📚 Documentation maintenance
│   ├── e2e-runner.md                # 🧪 End-to-end test execution
│   ├── planner.md                   # 📋 Feature planning and requirements
│   ├── refactor-cleaner.md          # 🧹 Code refactoring assistant
│   ├── security-reviewer.md         # 🔒 Security vulnerability analysis
│   ├── tdd-implementer.md           # 🟢 Make failing tests pass (GREEN→REFACTOR)
│   └── tdd-test-writer.md           # 🔴 Write failing tests first (RED)
│
├── commands/                        # Quick-access commands
│   ├── build-fix.md                 # /build-fix workflow
│   ├── code-review.md               # /code-review workflow
│   ├── commit.md                    # /commit workflow
│   ├── e2e.md                       # /e2e workflow
│   ├── plan.md                      # /plan workflow
│   ├── refactor-clean.md            # /refactor-clean workflow
│   ├── retrospective.md             # /retrospective workflow
│   ├── security-review.md           # /security-review workflow
│   ├── tdd.md                       # /tdd workflow
│   ├── update-docs.md               # /update-docs workflow
│   └── update-template.md           # /update-template workflow
│
├── rules/                           # Non-negotiable standards
│   ├── agents-and-commands.md       # Agent/command reference and parallel execution
│   ├── coding-style.md              # Code style standards
│   ├── fae.md                       # Fae knowledge graph (MCP) usage
│   ├── git-workflow.md              # Git workflow guidelines
│   ├── hooks.md                     # What the automated hooks do
│   ├── security.md                  # Security standards
│   ├── testing.md                   # Testing requirements
│   └── workflow.md                  # The 7-step development workflow
│
├── contexts/                        # Execution environments
│   ├── dev.md                       # Development environment
│   ├── review.md                    # Code review environment
│   └── research.md                  # Research/exploration environment
│
├── docs/                            # Deep-dive guides
│   └── tdd-playbook.md              # Full TDD methodology
│
├── hooks/                           # Automated quality gates (Claude Code hooks)
│   ├── hooks.json                   # Documents the universal ruleset
│   ├── README.md                    # How the hook system works
│   ├── scripts/
│   │   ├── check-secrets.js         # Universal secret scan (blocking)
│   │   ├── check-template-update.js # SessionStart template-update check
│   │   ├── dispatch.js              # Hook dispatcher (wired via settings.json)
│   │   └── (check-*.js)             # Stack-overlay checks, when a stack was selected
│   └── stacks/                      # <stack>.json check fragments (overlay-provided)
│
├── plans/                           # Feature plans and decision records
│
└── skills/                          # Stack skills — provided by the selected stack overlay
    └── (absent in core; populated by the dotnet/react/azure overlay)
```

---

## Components at a Glance

| Category | Count | Purpose |
|----------|-------|---------|
| **CLAUDE.md** | 1 | Master configuration - the development standard |
| **Agents** | 10 | Specialized AI roles (each with Hook Integration) |
| **Skills** | Overlay-provided | Deep technical reference (from the stack overlay; none in core) |
| **Commands** | 11 | Quick-access workflow shortcuts |
| **Rules** | 8 | Standards and requirements |
| **Contexts** | 3 | Execution environments with specific rules |
| **Hooks** | 1 universal + overlay checks + SessionStart update check | Automated quality and security gates |

---

## Component Details

### Agents (10 Total)

Agents are specialized AI roles that guide developers through complex workflows. Use them by simply describing your task.

#### 1. 🏗️ Architect Agent
**File**: `agents/architect.md`

**Role**: Senior software architect specializing in system design and scalability.

**When to Use**:
- Planning new features or major refactors
- Making architectural decisions
- Designing system integrations
- Planning infrastructure deployments

**Key Responsibilities**:
- Design system architecture
- Evaluate technical trade-offs
- Recommend patterns aligned with your standards
- Plan infrastructure
- Identify scalability bottlenecks

#### 2. 👀 Code Reviewer Agent
**File**: `agents/code-reviewer.md`

**Role**: Senior code reviewer ensuring quality, security, and standards adherence.

**When to Use**:
- After writing code (MUST be used for all changes)
- Before merging pull requests
- For code quality assurance
- For security validation

**Key Checks**:
- ✅ Architectural patterns (e.g. layered/Controller-Service-Repository)
- ✅ Public ID usage (never database IDs)
- ✅ DTO compliance
- ✅ Test coverage targets
- ✅ Security vulnerabilities
- ✅ Type safety
- ✅ Async/concurrency patterns

**Review Levels**:
- 🔴 **CRITICAL**: Security issues, architecture violations, data safety
- 🟠 **HIGH**: Code quality, performance, type safety
- 🟡 **MEDIUM**: Best practices, accessibility, documentation

#### 3. 🔴 TDD Test Writer Agent
**File**: `agents/tdd-test-writer.md`

**Role**: Test-Driven Development specialist writing failing tests FIRST (the RED phase). Invoked by `/tdd` before any implementation code exists.

**When to Use**:
- Starting new features (PROACTIVELY)
- Fixing bugs (reproduce with a failing test)
- **ANY** time before writing new code

**Key Responsibilities**:
- Define expected behavior through failing tests
- Cover edge cases and error paths before implementation
- Write comprehensive tests (unit, integration, E2E)
- Support your project's language and framework

#### 4. 🟢 TDD Implementer Agent
**File**: `agents/tdd-implementer.md`

**Role**: Test-Driven Development specialist making the failing tests pass (GREEN), then refactoring (REFACTOR). Invoked by `/tdd` after the tests exist.

**The TDD Cycle** (`/tdd` drives all of it):
1. 🔴 **RED** - Write failing test (tdd-test-writer)
2. 🟢 **GREEN** - Write minimal implementation (tdd-implementer)
3. 🔵 **REFACTOR** - Improve code quality (tdd-implementer)
4. ✅ **VERIFY** - Check coverage target

**Key Responsibilities**:
- Write minimal code to satisfy the tests — no more
- Refactor while keeping tests green
- Ensure coverage targets are met

#### 5. 📋 Planner Agent
**File**: `agents/planner.md`

**Role**: Feature planning specialist creating detailed requirements and roadmaps.

**When to Use**:
- Before starting new features
- When requirements are vague
- For large features requiring coordination
- When planning sprints or iterations

**Deliverables**:
- Feature breakdown into actionable tasks
- Detailed acceptance criteria
- Dependency identification and risk analysis
- Complexity and effort estimation
- Implementation timeline
- API contracts and data models

#### 6. 🔒 Security Reviewer Agent
**File**: `agents/security-reviewer.md`

**Role**: Security specialist identifying vulnerabilities and enforcing security standards.

**When to Use**:
- Before production deployments
- When handling sensitive data
- After major changes
- Security audit phases

**Checks**:
- Injection risks
- Hardcoded secrets
- Input validation
- HTTPS enforcement
- Authentication/authorization
- XSS vulnerabilities
- Security headers

#### 7. 🔧 Build Error Resolver Agent
**File**: `agents/build-error-resolver.md`

**Role**: Build diagnostics specialist fixing compilation and runtime errors.

**When to Use**:
- Build pipeline fails
- Local builds break
- Dependency conflicts occur
- Performance optimization needed

**Handles**:
- Build failure diagnosis
- Missing dependencies
- Compilation errors
- Runtime exceptions
- Build performance optimization
- Dependency updates

#### 8. 🧪 E2E Runner Agent
**File**: `agents/e2e-runner.md`

**Role**: End-to-end testing specialist executing and debugging workflows.

**When to Use**:
- Before releases
- When critical flows break
- Adding new user journeys
- Regression testing

**Capabilities**:
- Execute E2E test suites
- Debug test failures
- Verify critical user flows
- Generate test reports
- Create new E2E tests
- Manage test environments

#### 9. 🧹 Refactor Cleaner Agent
**File**: `agents/refactor-cleaner.md`

**Role**: Code refactoring specialist improving structure without changing behavior.

**When to Use**:
- Code is hard to understand
- Duplication needs elimination
- Methods are too long
- Classes have too many responsibilities

**Focuses On**:
- Identify code smell patterns
- Suggest refactoring approaches
- Extract duplicate code
- Simplify complex logic
- Improve readability
- Ensure behavior is maintained

#### 10. 📚 Doc Updater Agent
**File**: `agents/doc-updater.md`

**Role**: Documentation specialist keeping docs synchronized with code.

**When to Use**:
- After major features
- Before releases
- When APIs change
- Regular documentation reviews

**Updates**:
- README files
- API documentation
- API reference
- Changelog
- Architecture docs
- Deployment guides

---

### Skills (Overlay-Provided)

Skills define technical patterns and standards for a specific technology area — backend, frontend, or infrastructure. They are **not part of the core toolkit**; they are supplied by the stack overlay you selected at download (`dotnet`, `react`, `azure`, etc.).

- If you selected an overlay, its `SKILL.md` files live under `skills/` and the relevant agents will reference them automatically.
- If you selected no overlay, the agents apply stack-neutral guidance from the rules and contexts instead.
- You can add your own skill at any time by creating `skills/<name>/SKILL.md`.

---

### Commands (11 Total)

Commands provide quick-access workflows using slash command syntax.

| Command | Agent | Syntax | When to Use |
|---------|-------|--------|------------|
| **`/tdd`** | TDD Test Writer + TDD Implementer | `/tdd [implement\|fix\|refactor] [description]` | Starting any code work |
| **`/code-review`** | Code Reviewer | `/code-review` | Code complete, before merge |
| **`/plan`** | Planner | `/plan [feature description]` | Before implementation starts |
| **`/security-review`** | Security Reviewer | `/security-review` | Before production deployment |
| **`/build-fix`** | Build Error Resolver | `/build-fix` | When build fails |
| **`/e2e`** | E2E Runner | `/e2e [run\|debug] [test-name]` | Before releases, verify flows |
| **`/refactor-clean`** | Refactor Cleaner | `/refactor-clean [description]` | Code smells found |
| **`/update-docs`** | Doc Updater | `/update-docs` | After major changes |
| **`/commit`** | — | `/commit` | Validate, document, and commit + push |
| **`/retrospective`** | — | `/retrospective` | End of session/feature — save learnings |
| **`/update-template`** | — | `/update-template` | Pull a newer published agent-template version from Fae |

---

### Rules (8 Total)

Rules define standards that all developers and agents follow.

#### 1. 📝 Coding Style
**File**: `rules/coding-style.md`

**Universal Principles**:
- Readability First
- KISS (Keep It Simple)
- DRY (Don't Repeat Yourself)
- YAGNI (You Aren't Gonna Need It)

Language-specific naming, file-size, and formatting conventions are documented in the rule file and refined by your selected stack overlay.

#### 2. ✅ Testing
**File**: `rules/testing.md`

**Requirement**: Meet the team's coverage target (mandatory)

**Test Types**:
1. 🔹 **Unit Tests** - Individual functions/methods with mocked dependencies
2. 🔸 **Integration Tests** - API endpoints against a test database
3. 🔺 **E2E Tests** - Critical user flows

**Coverage is Measured**:
- ✅ Code execution paths
- ✅ Error scenarios
- ✅ Edge cases and boundaries
- ✅ Concurrent operations

#### 3. 🔒 Security
**File**: `rules/security.md`

**Non-Negotiable Requirements**:
- ❌ No hardcoded secrets (use a secret store)
- ✅ Input validation on all endpoints
- ✅ Injection prevention (parameterized queries)
- ✅ XSS prevention (sanitization)
- ✅ HTTPS everywhere
- ✅ Authentication on all endpoints
- ✅ Proper authorization (role-based)
- ❌ Secrets never in logs

#### 4. 🔀 Git Workflow
**File**: `rules/git-workflow.md`

**Branch Strategy**:
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/xyz` - Feature branches
- `fix/xyz` - Bug fix branches

**Commit Message Format**:
```
[type]: [short description]

[optional detailed explanation]

Closes #123
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**PR Requirements**:
- ✅ All tests passing
- ✅ Code review approval
- ✅ Coverage target maintained
- ✅ No merge conflicts

#### 5. 🔁 Workflow
**File**: `rules/workflow.md`

The mandatory 7-step development workflow: PLAN → DESIGN → IMPLEMENT → REVIEW → SECURE → VERIFY → DOCUMENT, plus the self-validation loop.

#### 6. 🤖 Agents and Commands
**File**: `rules/agents-and-commands.md`

Reference for the 10 specialist agents and 11 commands, parallel-execution guidance, and agent model selection.

#### 7. 🛡️ Hooks
**File**: `rules/hooks.md`

What the automated hooks actually do: the universal secret-scan (blocking), stack-overlay checks, and the SessionStart template-update check.

#### 8. 🧠 Fae Knowledge Graph
**File**: `rules/fae.md`

How to use the shared Fae knowledge graph (MCP): session briefing, auto-save triggers, read/write tools, and graph-first rules.

---

### Contexts (3 Total)

Contexts define execution environments with specific configurations for different scenarios.

#### 1. 💻 Development Context
**File**: `contexts/dev.md`

**Environment**: Local development machines

**Rules**: Loose security, full logging, debug symbols, hot reload support

#### 2. 👥 Review Context
**File**: `contexts/review.md`

**Environment**: Code review and testing phase

**Rules**: Production-like config, security checks enabled, comprehensive logging

#### 3. 🧪 Research Context
**File**: `contexts/research.md`

**Environment**: Exploration and experimentation

**Rules**: Optional tests, deferred architecture review, fast iteration

---

### Hooks

Hooks are automated quality and security gates. They are **Claude Code hooks** (not git hooks): the wiring ships in `.claude/settings.json` and fires on Claude Code events, executed by `hooks/scripts/dispatch.js`. See `rules/hooks.md` and `hooks/README.md` for details.

**Wired events:**

| Event | What runs |
|-------|-----------|
| `SessionStart` | Template Update Check — asks Fae whether a newer template version was published |
| `PreToolUse` (Write/Edit) | `dispatch.js pre` — scans the pending content for hardcoded secrets and 🛑 **blocks the write** on a critical hit |
| `PostToolUse` (Write/Edit) | `dispatch.js post` — runs the universal secret scan plus any stack-overlay checks; findings are fed back to the agent for immediate fixing |

**Universal check (every download):**

| Check | Type | Prevents |
|-------|------|----------|
| Check Hardcoded Secrets | 🛑 Blocking | API keys, passwords, tokens, connection strings |

**Stack-overlay checks** (present only when that stack was selected at download, declared in `hooks/stacks/<stack>.json`):

| Stack | Check | Prevents |
|-------|-------|----------|
| dotnet | Check DB ID Exposure | Direct database IDs in APIs |
| dotnet | Enforce DTO Usage | Direct entity returns from controllers |
| dotnet | Check Layer Separation | Layer pattern violations |
| dotnet | Check Async/Await | Blocking I/O patterns |
| react | Check Immutability | State mutations |
| react | Check TanStack Query | Ad-hoc/direct fetch calls |
| react | Check console.log | Debug logging in code |

Stack checks assume specific patterns (DTOs, layered architecture, a particular data-fetching library) — disable the ones that do not match your project by editing `hooks/stacks/<stack>.json`, but always keep secret detection active.

---

## Complete Workflows

### Workflow 1: New Feature from Planning to Deployment

```
START
  ↓
1️⃣  PLANNING PHASE
  /plan implement payment processing with a third-party provider
  ├─ Feature broken into 5 phases
  ├─ Tasks identified
  └─ Roadmap created
  ↓
2️⃣  ARCHITECTURE DESIGN
  Ask Architect Agent for system design
  ├─ Architecture recommended
  ├─ Integration patterns defined
  └─ Infrastructure planned
  ↓
3️⃣  IMPLEMENTATION (Days 2-5)
  /tdd implement each feature
  ├─ Write failing test (RED)
  ├─ Write minimal implementation (GREEN)
  ├─ Improve code quality (REFACTOR)
  └─ Verify coverage target (VERIFY)
  ↓
4️⃣  SECURITY AUDIT
  /security-review
  ├─ Secret storage verified ✓
  ├─ Webhook signatures validated ✓
  ├─ Input validation required (HIGH)
  └─ Rate limiting needed (MEDIUM)
  ↓
5️⃣  CODE REVIEW
  /code-review
  ├─ All tests passing ✓
  ├─ Coverage target maintained ✓
  ├─ DTO patterns followed ✓
  └─ APPROVE - Ready to merge
  ↓
6️⃣  DOCUMENTATION
  /update-docs
  ├─ API documentation updated
  ├─ API schema generated
  ├─ Integration guides created
  └─ Changelog updated
  ↓
7️⃣  VERIFICATION
  /e2e run critical-flows
  ├─ Payment processing: PASS ✓
  ├─ Webhook handling: PASS ✓
  ├─ Transaction history: PASS ✓
  └─ All flows: PASS ✓
  ↓
MERGE TO MAIN → PRODUCTION DEPLOYMENT
```

### Workflow 2: Bug Fix with Immediate Deployment

```
START: Users reporting login failure on mobile
  ↓
1️⃣  UNDERSTAND
  Code Reviewer analyzes recent changes
  └─ Root cause: strict same-site cookie on some browsers
  ↓
2️⃣  TEST FIRST
  /tdd fix authentication on mobile devices
  ├─ Write test for the failing authentication path
  └─ Test fails (reproduces bug)
  ↓
3️⃣  FIX
  Implement minimal fix
  ├─ Adjust SameSite policy
  ├─ Keep secure/HTTPS-only policy
  └─ Test now passes
  ↓
4️⃣  REVIEW & VERIFY
  /code-review
  └─ APPROVE - Minimal change, properly tested

  /e2e run critical-flows
  └─ Desktop & mobile login: PASS ✓
  ↓
5️⃣  DEPLOY
  git commit and push
  └─ Fast-track to production
```

### Workflow 3: Refactoring for Quality

```
START: UserService is 500 lines, hard to maintain
  ↓
1️⃣  ASSESS
  /plan refactor UserService into specialized services
  └─ Phase 1-4: Incremental extraction
  ↓
2️⃣  DESIGN
  Architect Agent creates refactoring strategy
  ├─ UserAuthenticationService (auth logic)
  ├─ UserProfileService (profile data)
  ├─ UserNotificationService (messaging)
  ├─ UserPermissionService (authorization)
  └─ Maintain backward compatibility
  ↓
3️⃣  REFACTOR WITH TESTS
  /tdd refactor X into specialized services
  ├─ Create new service
  ├─ Move responsibility
  ├─ Update tests
  ├─ Verify all passing
  └─ UserService now delegates
  ↓
4️⃣  REVIEW EACH PHASE
  /code-review
  ├─ Coverage maintained ✓
  ├─ No behavior changes ✓
  ├─ Code complexity reduced ✓
  └─ APPROVE
  ↓
5️⃣  COMPREHENSIVE VERIFICATION
  /e2e run all critical-flows
  └─ All user workflows: PASS ✓
  ↓
MERGE TO MAIN
```

---

## Getting Started

### Quick Reference: Which Tool Do I Use?

**Start Claude with Sonnet:**
```bash
claude --model sonnet
```

**Building a new feature?**
1. `/plan` describe your feature
2. Ask Architect for system design
3. `/tdd feature` (tests first, then implementation)
4. `/code-review` + `/security-review` (parallel)
5. `/update-docs`
6. Merge to main

**Fixing a bug?**
1. Ask Code Reviewer to analyze
2. `/tdd bug` (reproduce with a failing test, then fix)
3. `/e2e run critical-flows`
4. `/code-review`
5. Merge to main

**Refactoring?**
1. `/plan refactor for clarity`
2. `/refactor-clean describe issue`
3. `/code-review`
4. Merge to main

**Before ANY deployment:**
1. ✅ `/security-review`
2. ✅ Coverage target met
3. ✅ `/e2e run all`
4. ✅ `/code-review` approval
5. ✅ `/update-docs`

---

## Integration Guide

### Setting Up in Your Project

1. **Copy the toolkit** into your project (or download it via the portal with your chosen stack overlay).

2. **Configure agents** in your Claude Code settings.

3. **Hooks work out of the box** — they are Claude Code hooks wired via the shipped `.claude/settings.json` (not git hooks; nothing to copy into `.git/hooks/`). Requires Node 18+ on PATH.

4. **Configure CI/CD** to enforce rules.

### Using Commands

```bash
# TDD workflow
/tdd implement user registration

# Code review
/code-review

# Plan feature
/plan add multi-language support

# Security review
/security-review

# Fix build errors
/build-fix

# Run E2E tests
/e2e run critical-flows

# Refactor code
/refactor-clean extract duplicate logic

# Update documentation
/update-docs
```

---

## Key Reference Tables

### Agent Reference

| Agent | Primary Role | When to Use | Command |
|-------|--------------|------------|---------|
| **Architect** | System design | Planning, design decisions | Direct invocation |
| **Planner** | Feature breakdown | Before implementation | `/plan` |
| **TDD Test Writer** | Failing tests first (RED) | Starting any code | `/tdd` |
| **TDD Implementer** | Make tests pass (GREEN→REFACTOR) | After the failing tests exist | `/tdd` |
| **Code Reviewer** | Quality assurance | Code complete | `/code-review` |
| **Security Reviewer** | Vulnerability detection | Before production | `/security-review` |
| **Build Error Resolver** | Build diagnostics | Build fails | `/build-fix` |
| **E2E Runner** | Test verification | Before releases | `/e2e` |
| **Refactor Cleaner** | Code improvement | Code smells found | `/refactor-clean` |
| **Doc Updater** | Documentation | After major changes | `/update-docs` |

### Skill Reference

Stack skills are provided by the overlay you selected at download. The exact skills available depend on that overlay (for example a backend, frontend, or infrastructure skill). If no overlay was selected, no stack skills are present and the agents rely on stack-neutral rules and contexts.

### Rule Enforcement

| Rule | Standard | Measured By | When Checked |
|------|----------|-------------|-------------|
| Coding Style | Code conventions | Code Reviewer | Code Review |
| Testing | Coverage target | CI/CD, Code Reviewer | Before commit, CI/CD |
| Security | No hardcoded secrets | Hooks, Security Reviewer | On every write/edit (hook), Security Review |
| Git Workflow | Conventional commits | Code Reviewer, CI/CD | Before commit, CI/CD |

---

## FAQ

**Q: Why require a test coverage target?**
A: A coverage target ensures critical paths are tested, reducing production bugs.

**Q: Can I skip TDD and write tests later?**
A: No. TDD is mandatory. Tests must be written FIRST. No exceptions.

**Q: What if my build fails?**
A: Run `/build-fix` - the Build Error Resolver agent will diagnose and suggest fixes.

**Q: How do I handle database IDs?**
A: Never expose them. Use Public IDs instead (unique, obfuscated identifiers like "abc123xyz").

**Q: Where do stack-specific patterns come from?**
A: From the stack overlay you selected at download (e.g. `dotnet`, `react`, `azure`). The core toolkit is stack-neutral.

**Q: What if I disagree with a pattern?**
A: Discuss with your team and the Architect agent. Document your proposal. Changes require consensus.

---

## Troubleshooting

### "My commit is blocked by a hook"

**Hardcoded secrets?**
Move the value into your secret store or environment configuration and reference it at runtime instead of embedding it in source.

**Database ID exposure?**
Expose Public IDs (opaque identifiers) in your API surface rather than internal database IDs.

**console.log found?**
Replace ad-hoc debug output with your project's logging facility.

### "Code quality metrics seem low"

1. Run `/code-review` for detailed feedback
2. Address CRITICAL and HIGH priority items first
3. Use `/refactor-clean` to improve structure
4. Ensure your coverage target is met

### "Build pipeline is failing"

Run `/build-fix` and follow the diagnostics:
1. Identify root cause
2. Follow suggested fixes step-by-step
3. Verify with build command
4. Commit and push

---

## Next Steps

1. ✅ **Read this guide** - Understand the complete system
2. ✅ **Review your stack overlay's skills** (if you selected one)
3. ✅ **Start your first task** - Use `/plan` and `/tdd`
4. ✅ **Follow the workflows** - Let agents guide you
5. ✅ **Use commands daily** - Make them automatic
6. ✅ **Trust the hooks** - Automation protects quality
7. ✅ **Contribute feedback** - Help improve the toolkit

---

## Summary

This toolkit is a complete self-validating development kit:

| Component | Count | Benefit |
|-----------|-------|---------|
| **CLAUDE.md** | 1 | The development standard |
| **Agents** | 10 | Expert guidance (each with Hook Integration) |
| **Skills** | Overlay-provided | Deep technical reference (from the stack overlay) |
| **Commands** | 11 | Quick workflow shortcuts |
| **Rules** | 8 | Standards |
| **Contexts** | 3 | Environment-specific rules |
| **Hooks** | 1 universal + overlay checks + SessionStart update check | Automated safety gates |

**CLAUDE.md defines the standard. Agents guide you. Hooks enforce it. Deliver features confidently.**

---

## Additional Resources

- **Need help?** Check this DOC.md first
- **The Standard?** See [CLAUDE.md](CLAUDE.md) - the mandatory workflow
- **Design questions?** Ask the Architect agent
- **Code questions?** Ask the Code Reviewer agent
- **Learning stack patterns?** Reference the skills provided by your stack overlay
- **Hook details?** Each agent has a Hook Integration section showing relevant hooks

Remember: this toolkit exists to accelerate your development while maintaining high standards of quality, security, and scalability.
