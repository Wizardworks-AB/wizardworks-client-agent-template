# Wizardworks Development Context

Mode: Active implementation and feature development
Focus: Building features following TDD, architectural standards, and quality gates

## Behavior

- **Test-First Development**: Write tests BEFORE implementation (Red-Green-Refactor)
- **Architectural Compliance**: Adhere to Controller-Service-Repository pattern (no layer skipping)
- **Public ID Pattern**: Never expose database IDs - always use Public IDs in APIs
- **DTO Pattern**: All API inputs/outputs use DTOs, never expose entities
- **Iterative Implementation**: Get it working → Get it right → Get it clean
- **Run tests after changes**: Verify coverage stays at 80%+
- **Keep commits atomic**: One logical change per commit

## Priorities

1. **Get it working** (tests pass, feature functions)
2. **Get it right** (follows Wizardworks patterns and security standards)
3. **Get it clean** (refactored, optimized, well-named)

## Development Checklist

Before completing any feature:

- [ ] Tests written first (TDD workflow)
- [ ] 80%+ test coverage maintained
- [ ] Controller-Service-Repository layers properly separated
- [ ] Public IDs used (never database IDs)
- [ ] DTOs used for API contracts
- [ ] No hardcoded secrets (use environment variables or Key Vault)
- [ ] Input validation on all API endpoints
- [ ] Code follows Wizardworks style guide
- [ ] Methods < 50 lines (.NET) / < 30 lines (React)
- [ ] Files < 800 lines (.NET) / < 400 lines (TypeScript)
- [ ] No console.log in production
- [ ] Async/await used correctly (no .Result blocking)
- [ ] Early returns to reduce nesting
- [ ] Error handling with proper logging

## Tools to Favor

- **Edit, Write**: Code changes and implementations
- **Bash**: Running tests, builds, and linters
- **Grep, Glob**: Finding code patterns and references
- **Read**: Understanding existing codebase before implementing
- **Skill**: Use `/tdd` to guide test-first development

## Wizardworks Standards to Reference

### Core Patterns

- **Controller-Service-Repository**: HTTP → Business Logic → Data Access (mandatory)
- **Public ID Pattern**: Always expose `PublicMagicId`, never `MagicId`
- **DTO Pattern**: Separate DTOs for API contracts, map from entities
- **Component Composition** (Frontend): Build from small, focused components

### Testing Requirements

- **Unit Tests**: Test individual methods/functions
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test critical user flows
- **Coverage**: Minimum 80% (lines, functions, branches, statements)
- **Frameworks**: xUnit + FluentAssertions (.NET), Vitest + React Testing Library (React)

### Security Standards

- **Secrets**: Never hardcode - use environment variables or Azure Key Vault
- **SQL Injection**: Always use parameterized queries (EF Core handles this)
- **XSS Prevention**: React escapes by default, use DOMPurify if dangerouslySetInnerHTML needed
- **Input Validation**: Validate all user inputs at API boundaries
- **Authentication**: JWT with proper validation, authorization policies on sensitive endpoints

### Coding Style

**.NET/C#**:
- PascalCase: classes, methods, properties, interfaces (start with I)
- camelCase: parameters, local variables
- Async methods: end with Async suffix
- Early returns to reduce nesting
- One class per file, organize by feature not type

**TypeScript/React**:
- camelCase: variables, functions
- PascalCase: components, types, classes
- UPPER_SNAKE_CASE: constants
- Immutability: use spread operators, never mutate
- No 'any' types - strict mode required

## Git Workflow

- **Commit Format**: `<type>: <description>` (feat, fix, refactor, test, chore)
- **Branch Naming**: `feature/add-magic-search`, `fix/null-reference`, `refactor/extract-dto`
- **Pre-Commit**: Build passes, tests pass, 80%+ coverage, no secrets, linter passes

## Common Development Tasks

### Starting a New Feature

1. Use `/tdd [feature-name]` to start TDD workflow
2. Write failing test first (defines requirements)
3. Implement minimal code to pass test
4. Refactor for quality
5. Verify 80%+ coverage

### Implementing a New Endpoint

1. Create DTO(s) for input/output (never expose entities)
2. Create controller action with validation
3. Implement service method with business logic
4. Implement repository method for data access
5. Write tests for all layers (mocking dependencies)
6. Verify Public ID is used, never internal database ID

### Refactoring Existing Code

1. Verify all tests pass before refactoring
2. Make small, incremental changes
3. Run tests after each change
4. Maintain 80%+ coverage
5. Use atomic commits

## Helpful References

- **CONSTITUTION.md**: Core standards and principles
- **rules/coding-style.md**: Detailed style guidelines
- **rules/testing.md**: TDD requirements and examples
- **rules/security.md**: Security checklist and patterns
- **skills/backend-patterns-dotnet/SKILL.md**: .NET specific patterns
- **skills/frontend-patterns-react/SKILL.md**: React specific patterns
