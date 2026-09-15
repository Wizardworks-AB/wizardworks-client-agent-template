# Development Context

Mode: Active implementation and feature development
Focus: Building features with tests, architectural standards, and quality gates

## Behavior

- **Tests ship with the code**: every change carries the tests that prove it (`rules/testing.md`)
- **Architectural Compliance**: Respect the project's layering / separation of concerns (no layer skipping)
- **Stable Public Identifiers**: Never expose internal/database IDs — use public IDs in APIs
- **Boundary Contracts**: All API inputs/outputs use dedicated types (DTOs), never leak internal models
- **Iterative Implementation**: Get it working → Get it right → Get it clean
- **Run tests after changes**: the whole suite, every task
- **Keep commits atomic**: One logical change per commit

## Priorities

1. **Get it working** (tests pass, feature functions)
2. **Get it right** (follows the project's patterns and security standards)
3. **Get it clean** (refactored, optimized, well-named)

## Development Checklist

Before completing any feature (adapt specifics to your stack — see `rules/<stack>.md` and existing conventions):

- [ ] Tests written for the change
- [ ] Layers properly separated (no skipping)
- [ ] Public IDs used (never internal/database IDs)
- [ ] Boundary contracts (DTOs) used for API contracts
- [ ] No hardcoded secrets (use a secrets manager or environment variables)
- [ ] Input validation on all API endpoints
- [ ] Code follows the project style guide
- [ ] Methods/functions within the project's size limits
- [ ] Files within the project's size limits
- [ ] No debug logging left in production code
- [ ] Async patterns used correctly (no blocking on async calls)
- [ ] Early returns to reduce nesting
- [ ] Error handling with proper logging

## Tools to Favor

- **Edit, Write**: Code changes and implementations
- **Bash**: Running tests, builds, and linters
- **Grep, Glob**: Finding code patterns and references
- **Read**: Understanding existing codebase before implementing

## Standards to Reference

### Core Patterns

- **Layered architecture**: transport → business logic → data access (no layer skipping)
- **Public ID pattern**: always expose a public identifier, never the internal/database ID
- **Boundary contracts (DTOs)**: separate types for API contracts, mapped from internal models
- **Component composition** (frontend): build from small, focused components

### Testing Requirements

- **Integration tests**: the default — endpoints, data access, handlers across a real boundary
- **E2E tests**: critical user flows
- **Unit tests**: only where the logic is intricate
- **Frameworks**: use the project's chosen test frameworks

### Security Standards

- **Secrets**: never hardcode — use a secrets manager or environment variables
- **Injection**: always use parameterized queries / safe query APIs
- **XSS prevention**: rely on framework output encoding; sanitize (allow-list) only when raw markup is unavoidable
- **Input validation**: validate all user inputs at API boundaries
- **Authentication**: proper token validation and authorization checks on sensitive endpoints

### Coding Style

Follow the naming, immutability, and typing conventions documented for your stack in `rules/coding-style.md` and `rules/<stack>.md`, and match the surrounding code.

## Git Workflow

- **Commit Format**: `<type>: <description>` (feat, fix, refactor, test, chore)
- **Branch Naming**: `feature/add-search`, `fix/null-reference`, `refactor/extract-boundary-types`
- **Pre-Commit**: build passes, tests pass, no secrets, linter passes

## Common Development Tasks

### Starting a New Feature

1. Use `/feature [feature-name]` — worktree, acceptance criteria, task list
2. Implement task by task, each with the test that proves it
3. Run the suite and try the real path locally
4. One review round, then a draft PR

### Implementing a New Endpoint

1. Create boundary type(s) for input/output (never expose internal models)
2. Create the endpoint/handler with validation
3. Implement the service method with business logic
4. Implement the data-access method
5. Write tests for all layers (mocking dependencies)
6. Verify a public ID is used, never the internal/database ID

### Refactoring Existing Code

1. Verify all tests pass before refactoring
2. Make small, incremental changes
3. Run tests after each change
4. Use atomic commits

## Helpful References

- **CONSTITUTION.md**: Core standards and principles
- **rules/coding-style.md**: Detailed style guidelines
- **rules/testing.md**: Testing requirements and examples
- **rules/security.md**: Security checklist and patterns
- **rules/<stack>.md**: Stack-specific patterns and conventions
