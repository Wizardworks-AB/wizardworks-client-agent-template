# Wizardworks Engineering Constitution

**Version**: 1.1
**Last Updated**: 2025-01-26
**Status**: Active

---

## Purpose

This constitution defines the core principles, standards, and practices for all engineering work at Wizardworks. It serves as the foundation for our AI-first approach to software development.

**Important**: All Wizardworks employees and AI agents must adhere to these standards rigorously.

---

## Core Principles

### 1. AI-First Development
Wizardworks embraces AI as a core development partner. We leverage Claude Code and AI agents to enhance productivity while maintaining human oversight and responsibility.

### 2. Quality Over Speed
We value sustainable, high-quality code over quick fixes. Quality enables long-term velocity.

### 3. Test-Driven Development
Tests are not optional. We write tests first (TDD), always. 80%+ coverage is mandatory.

### 4. Infrastructure as Code
All infrastructure is defined in code (Bicep). Manual resource creation is prohibited.

### 5. Security First
Security is non-negotiable. We validate inputs, protect secrets, and follow security best practices always.

### 6. Continuous Learning
We document patterns, learn from experience, and continuously improve our practices.

---

## Technology Standards

### Backend Stack

**Required**:
- **.NET 10** (latest LTS or current version)
- **ASP.NET Core** (Web APIs)
- **Entity Framework Core** (default ORM for new projects)
- **Docker** (containerization)
- **xUnit** (testing framework)
- **FluentAssertions** (test assertions)

**Optional** (with justification):
- **Dapper** (performance-critical scenarios only)
- **MediatR** (CQRS in complex domains)

**Existing Projects**: Follow existing patterns. If a project uses Dapper, continue using Dapper. Don't mix ORMs - consistency within a project matters more than following the "new project" standard.

### Frontend Stack

**Required**:
- **React 19+** (latest version)
- **TypeScript 5+** (strict mode enabled)
- **TanStack Query** (data fetching/caching)
- **TanStack Form** (form management)
- **TanStack Table** (data tables)
- **Tailwind CSS** (styling)
- **Vite** or **Next.js** (build tool)
- **Vitest** (testing framework)
- **Playwright** (E2E testing)

### Infrastructure Stack

**Required**:
- **Azure** (cloud platform)
- **Bicep** (Infrastructure as Code)
- **Docker** (containerization)
- **Azure DevOps** or **GitHub Actions** (CI/CD)
- **Azure Key Vault** (secrets management)
- **Application Insights** (monitoring)

---

## Architectural Standards

### Controller-Service-Repository Pattern (MANDATORY)

All backend applications must follow this layered architecture:

```
┌─────────────────────────────────────┐
│        Controller Layer             │  ← HTTP concerns, routing, validation
├─────────────────────────────────────┤
│         Service Layer               │  ← Business logic, orchestration
├─────────────────────────────────────┤
│       Repository Layer              │  ← Data access, persistence
├─────────────────────────────────────┤
│     Entity Framework Core           │  ← ORM
└─────────────────────────────────────┘
```

**Rules**:
- Controllers: HTTP concerns ONLY
- Services: Business logic ONLY
- Repositories: Data access ONLY
- NO layer skipping (Controller → Repository is WRONG)

### Public ID Pattern (MANDATORY)

**Rule**: NEVER expose database IDs externally. ALWAYS use Public IDs.

```csharp
// ✅ GOOD
public class Magic
{
    public int MagicId { get; set; }           // Internal DB ID
    public string PublicMagicId { get; set; }  // External Public ID
}

public class MagicDto
{
    public string PublicMagicId { get; set; }  // Only public ID exposed
}

// ❌ WRONG
public class MagicDto
{
    public int MagicId { get; set; }  // Exposing database ID
}
```

### DTO Pattern (MANDATORY)

**Rule**: All API inputs and outputs use DTOs. Never expose entities directly.

```csharp
// ✅ GOOD
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateMagicDto dto)
{
    var result = await _service.CreateAsync(dto);
    return Ok(result);  // Returns MagicDto
}

// ❌ WRONG
[HttpPost]
public async Task<IActionResult> Create([FromBody] Magic entity)
{
    // Exposing entity model directly
}
```

### Component Composition (Frontend)

**Rule**: Build UIs from small, focused components. Avoid large monolithic components.

```typescript
// ✅ GOOD: Composed components
<MagicList>
  <MagicListHeader />
  <MagicListFilters />
  <MagicListTable />
  <MagicListPagination />
</MagicList>

// ❌ WRONG: One giant component doing everything
<MagicListEverything />
```

---

## Development Standards

### Test-Driven Development (MANDATORY)

**Workflow**: Red → Green → Refactor

1. **Write Test First** (RED): Test should fail
2. **Run Test**: Verify it fails for right reason
3. **Minimal Implementation** (GREEN): Make test pass
4. **Run Test**: Verify it passes
5. **Refactor** (IMPROVE): Improve code quality
6. **Verify Coverage**: Ensure 80%+ coverage

**Required Test Types**:
- Unit Tests (individual functions/methods)
- Integration Tests (API endpoints, database)
- E2E Tests (critical user flows)

**Coverage Requirement**: 80% minimum (lines, functions, branches, statements)

### Coding Style

#### .NET/C#
- PascalCase for classes, methods, properties
- camelCase for parameters and local variables
- Interfaces start with 'I'
- Async methods end with 'Async'
- Methods: <50 lines
- Files: <800 lines

#### TypeScript/React
- camelCase for variables and functions
- PascalCase for components, classes, types
- UPPER_SNAKE_CASE for constants
- Components: <200 lines
- Files: <400 lines

#### Universal
- Clear, descriptive names
- Immutability patterns (spread operators)
- Early returns to reduce nesting
- Extract reusable logic
- No commented-out code
- No console.log in production

### Security (MANDATORY)

**Never**:
- Hardcode secrets (API keys, passwords, connection strings)
- Expose database IDs externally
- Use string concatenation for SQL queries
- Allow unsanitized HTML rendering
- Skip input validation
- Disable HTTPS

**Always**:
- Store secrets in Azure Key Vault or environment variables
- Use parameterized queries (EF Core handles this)
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
feature/add-magic-search
fix/null-reference-magic-service
refactor/extract-dto-mapping
```

**Pre-Commit Checklist**:
- [ ] Code builds successfully
- [ ] All tests pass
- [ ] 80%+ coverage maintained
- [ ] No console.log statements
- [ ] No hardcoded secrets
- [ ] Code follows style guide
- [ ] Linter passes

### Infrastructure as Code

**MANDATORY**: All Azure resources defined in Bicep. No manual portal creation.

**Structure**:
```
infrastructure/
├── main.bicep                 # Entry point
├── parameters/
│   ├── dev.bicepparam
│   ├── staging.bicepparam
│   └── production.bicepparam
└── modules/
    ├── appService.bicep
    ├── database.bicep
    ├── keyVault.bicep
    └── monitoring.bicep
```

**Deployment**: Automated via Azure DevOps or GitHub Actions

---

## AI Agent Standards

### Acting as Wizardworks Employees

All AI agents (Claude Code agents, subagents) working on Wizardworks projects are considered employees and must:

1. **Adhere to all standards** defined in this constitution
2. **Follow architectural patterns** (Controller-Service-Repository, Public IDs, DTOs)
3. **Practice TDD** (write tests first, 80%+ coverage)
4. **Enforce security** (no secrets, validate inputs, use parameterized queries)
5. **Use Infrastructure as Code** (Bicep for all Azure resources)
6. **Follow coding style** (naming conventions, file size limits, immutability)
7. **Respect git workflow** (proper commits, branch naming, pre-commit checks)

### Agent Types

**Architect Agent**:
- Design system architecture
- Evaluate technical trade-offs
- Ensure alignment with Wizardworks stack
- Plan infrastructure deployments

**Code Reviewer Agent**:
- Review for quality and security
- Check adherence to Wizardworks standards
- Verify layer separation
- Ensure Public ID and DTO usage

**TDD Test Writer Agent**:
- Write failing tests first (RED phase)
- Define expected behavior through tests
- Cover edge cases and error paths
- Support both .NET and TypeScript

**TDD Implementer Agent**:
- Make failing tests pass (GREEN phase)
- Write minimal code to satisfy tests
- Refactor while keeping tests green
- Ensure 80%+ coverage

### Agent Usage

**When to Use**:
- Complex features requiring planning → Architect
- After writing code → Code Reviewer
- Writing tests for new feature/fix → TDD Test Writer
- Making tests pass → TDD Implementer

**How to Invoke**:
- Via commands: `/tdd-test`, `/tdd-implement`, `/code-review`, `/plan`
- Directly in Claude Code
- As part of automated workflows

### Parallel Execution (RECOMMENDED)

**Run independent agents in parallel to maximize efficiency.**

**Sequential Dependencies** (must run in order):
```
/plan → architect → /tdd-test → /tdd-implement
```

**Parallel Validation** (run simultaneously after implementation):
```
/code-review + /security-review + /e2e + /update-docs
```

These validation agents work on the same code independently. Running them in parallel saves significant time without compromising quality.

**Example workflow**:
1. `/plan` (sequential)
2. `architect` (sequential)
3. `/tdd-test` (sequential)
4. `/tdd-implement` (sequential)
5. `/code-review` + `/security-review` + `/e2e` + `/update-docs` (PARALLEL)

### Self-Validation (MANDATORY)

**After ANY implementation, Claude MUST validate AND fix issues found.**

```
/tdd-implement
     ↓
/code-review + /security-review + /update-docs (PARALLEL)
     ↓
Issues found? → FIX → Re-run reviews
     ↓
All clean? → DONE
```

**Rules**:
- Never skip validation after implementation
- Don't just report issues - FIX THEM
- Re-run the review that found issues until clean
- Verify tests pass and coverage is 80%+

**Wrong**: `/tdd-implement` → `/code-review` reports issues → done (issues unfixed!)
**Right**: `/tdd-implement` → `/code-review` reports issues → FIX → `/code-review` clean → done

### Agent Model Selection (MANDATORY)

**NEVER override agent models when invoking them.** Each agent has an optimal model configured in its frontmatter.

| Model | Agents | Why |
|-------|--------|-----|
| **haiku** | doc-updater, e2e-runner, build-error-resolver | Structured tasks, no reasoning needed |
| **sonnet** | planner, code-reviewer, refactor-cleaner, tdd-test-writer | Judgment calls |
| **opus** | architect, security-reviewer, tdd-implementer | Deep reasoning, critical decisions |

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
- 80%+ coverage
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
2. Add to appropriate skill file
3. Share with team
4. Update constitution if needed

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
| [CONSTITUTION.md](CONSTITUTION.md) | This file - core standards |
| [skills/backend-patterns-dotnet/SKILL.md](skills/backend-patterns-dotnet/SKILL.md) | .NET/C# backend patterns |
| [skills/frontend-patterns-react/SKILL.md](skills/frontend-patterns-react/SKILL.md) | React/TypeScript frontend patterns |
| [skills/infrastructure-as-code/SKILL.md](skills/infrastructure-as-code/SKILL.md) | Bicep, Docker, CI/CD |
| [rules/testing.md](rules/testing.md) | TDD requirements and standards |
| [rules/security.md](rules/security.md) | Security guidelines |
| [rules/coding-style.md](rules/coding-style.md) | Code style standards |
| [rules/git-workflow.md](rules/git-workflow.md) | Git and version control |

### Essential Commands

| Command | Purpose |
|---------|---------|
| `/tdd-test [feature]` | Write failing tests first (RED) |
| `/tdd-implement [feature]` | Make tests pass (GREEN→REFACTOR) |
| `/code-review [file]` | Review code for quality and standards |
| `/plan [feature]` | Plan architecture for complex feature |

### Essential Agents

| Agent | When to Use |
|-------|-------------|
| **architect** | Planning new features, making design decisions |
| **code-reviewer** | After writing code, before creating PR |
| **tdd-test-writer** | Writing failing tests for new features or bug fixes |
| **tdd-implementer** | Making tests pass, refactoring code |

---

## Getting Started

### New Project Setup

1. **Clone this repository**
2. **Review this CONSTITUTION.md**
3. **Read [DOC.md](DOC.md) for detailed guidance**
4. **Set up your development environment**:
   - Install .NET 10 SDK (always latest LTS)
   - Install Node.js 20+
   - Install Docker
   - Install Azure CLI
5. **Configure Claude Code** with Wizardworks agents and rules
6. **Start with `/tdd-test` for first feature**

### For Existing Projects

1. **Audit against this constitution**
2. **Identify gaps**
3. **Create migration plan**
4. **Incrementally adopt standards**
5. **Update infrastructure to Bicep**
6. **Achieve 80%+ test coverage**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2025-01-26 | Split TDD agent into test-writer and implementer |
| 1.0 | 2025-01-23 | Initial constitution |

---

## Maintenance

**Constitution Owner**: Engineering Leadership
**Review Cadence**: Quarterly
**Amendment Process**: Proposal → Review → Approval → Version Update

---

**Remember**: This constitution exists to enable rapid, high-quality software development. These standards are the foundation of our AI-first engineering culture at Wizardworks. Follow them rigorously.

---

*"Quality is not an act, it is a habit." - Aristotle*

**Wizardworks Engineering**
*Building the Future with AI*
