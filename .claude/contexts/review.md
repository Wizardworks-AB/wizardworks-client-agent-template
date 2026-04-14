# Wizardworks Code Review Context

Mode: Pull Request review, code analysis, quality assurance
Focus: Quality, security, maintainability, and Wizardworks standard compliance

## Behavior

- **Read thoroughly first**: Examine all files and changes before commenting
- **Prioritize by severity**: CRITICAL → HIGH → MEDIUM → LOW
- **Suggest fixes, not just problems**: Provide concrete solutions
- **Check architectural compliance**: Verify Controller-Service-Repository pattern
- **Security focus**: Look for secrets, injection risks, auth issues
- **Test coverage**: Verify 80%+ coverage requirement met
- **Pattern adherence**: Ensure Public ID and DTO patterns followed

## Review Checklist

### Architecture & Patterns

- [ ] Controller-Service-Repository layers properly separated (no layer skipping)
- [ ] Controllers only contain HTTP concerns
- [ ] Services contain business logic
- [ ] Repositories handle data access only
- [ ] Public IDs used in API responses (never database IDs)
- [ ] DTOs used for API contracts (entities never exposed)
- [ ] Frontend components are small and composable (<200 lines)

### Code Quality

- [ ] Logic is correct and handles edge cases
- [ ] Methods under size limits: <50 lines (.NET) / <30 lines (React)
- [ ] Files under size limits: <800 lines (.NET) / <400 lines (TypeScript)
- [ ] Early returns used to reduce nesting (max 4 levels)
- [ ] No duplicated code - extract to shared functions
- [ ] Naming is clear and descriptive
- [ ] No commented-out code
- [ ] No console.log statements (except tests)

### Error Handling & Logging

- [ ] Try-catch blocks properly implemented
- [ ] Exceptions logged with context
- [ ] Generic error messages to clients (no sensitive data leaks)
- [ ] Edge cases handled (null, empty, invalid input)
- [ ] Boundary values tested

### Testing

- [ ] Unit tests present for public methods/functions
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical user flows
- [ ] 80%+ code coverage maintained
- [ ] Edge cases covered (null, empty, boundary values, errors)
- [ ] Mocks used for external dependencies
- [ ] Test names are descriptive
- [ ] AAA pattern used (Arrange-Act-Assert)

### Security (CRITICAL)

- [ ] No hardcoded secrets (API keys, passwords, connection strings)
- [ ] Secrets use environment variables or Azure Key Vault
- [ ] Parameterized queries used (EF Core auto-parameterizes)
- [ ] Input validation on all API endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention (HTML escaping or DOMPurify sanitization)
- [ ] Authentication/authorization on sensitive endpoints
- [ ] Rate limiting on public endpoints
- [ ] HTTPS enforced
- [ ] No sensitive data in error messages
- [ ] Dependencies scanned for vulnerabilities

### .NET/C# Standards

- [ ] PascalCase for classes, methods, properties
- [ ] camelCase for parameters and local variables
- [ ] Interfaces start with 'I'
- [ ] Async methods end with 'Async' suffix
- [ ] Async/await used correctly (no .Result or .Wait())
- [ ] ConfigureAwait(false) in library code
- [ ] Null checks with early returns
- [ ] XML documentation on public APIs
- [ ] File organized by feature, not type

### TypeScript/React Standards

- [ ] camelCase for variables and functions
- [ ] PascalCase for components and types
- [ ] UPPER_SNAKE_CASE for constants
- [ ] No 'any' types (strict mode compliance)
- [ ] Proper TypeScript types on function parameters/returns
- [ ] Immutability patterns (spread operators, not mutations)
- [ ] Null/undefined checks
- [ ] Proper hook naming and usage (use prefix)
- [ ] Component props properly typed
- [ ] JSDoc on exported functions

## Priority Levels

### CRITICAL (Block merge)

- Security vulnerabilities (secrets, injection, auth bypass)
- Layer architecture violations (Controller → Repository skipping Service)
- Public IDs not used (exposing database IDs)
- DTOs not used (exposing entities)
- No tests (particularly security-sensitive code)
- Coverage below 80%
- Hardcoded secrets

### HIGH (Must fix before merge)

- Logic errors that break functionality
- Missing edge case handling
- Improper error handling
- SQL injection risks
- XSS vulnerabilities
- Missing input validation
- Insufficient test coverage (<80%)

### MEDIUM (Should fix)

- Code style violations
- Overly complex methods
- Duplicated code not extracted
- Missing documentation
- Poor naming
- Performance issues
- Test flakiness

### LOW (Nice to have)

- Minor style preferences
- Optimization suggestions
- Documentation improvements
- Comment typos

## Review Output Format

Group findings by:

1. **File name** (organize by affected files)
2. **Severity** (CRITICAL, HIGH, MEDIUM, LOW within each file)
3. **Specific line numbers** (if applicable)
4. **Clear explanation** of the issue
5. **Concrete suggestion** for fixing
6. **Code example** if helpful

## Security Review Focus

- [ ] Search for: `hardcoded`, `password`, `key`, `secret`, `token`
- [ ] Check: Parameterized queries (LINQ, EF, Dapper with @param)
- [ ] Verify: Input validation on all public endpoints
- [ ] Ensure: Auth headers on sensitive operations
- [ ] Validate: No console.log or Debug.WriteLine with sensitive data
- [ ] Check: Environment variables for configuration

## Testing Review Focus

- [ ] Coverage percentage meets 80% minimum
- [ ] Happy path and error paths tested
- [ ] Boundary conditions tested
- [ ] Null/empty/invalid input tested
- [ ] Mocks verify correct calls to dependencies
- [ ] Test names describe what's being tested
- [ ] No flaky or time-dependent tests

## Architecture Review Focus

- [ ] No Controller directly calling Repository
- [ ] Service layer orchestrates business logic
- [ ] DTOs separate API contracts from domain models
- [ ] Public IDs used externally
- [ ] Component dependencies properly injected
- [ ] Components are testable units
- [ ] Separation of concerns maintained

## Common Issues to Flag

| Issue | Example | Fix |
|-------|---------|-----|
| Layer Skipping | Controller → Repository | Route through Service layer |
| Exposed DB ID | return magic.MagicId | Use magic.PublicMagicId |
| Entity Exposure | [HttpPost] Create(Magic m) | Use CreateMagicDto parameter |
| Hardcoded Secret | apiKey = "sk-..." | Use configuration/Key Vault |
| SQL Injection | $"...WHERE Id='{id}'" | Use parameterized queries |
| No Auth Check | [HttpDelete] Delete(id) | Add [Authorize] attribute |
| Low Coverage | <80% | Add missing tests |
| Oversized Method | 100+ lines | Extract helper methods |

## Approval Criteria

Code is ready to merge when:

- ✅ All CRITICAL issues resolved
- ✅ All HIGH issues resolved
- ✅ MEDIUM/LOW issues addressed or accepted
- ✅ 80%+ test coverage verified
- ✅ Architecture follows patterns
- ✅ Security standards met
- ✅ Code style compliant
- ✅ Tests passing in CI/CD

## Helpful References

- **CONSTITUTION.md**: Core standards and enforcement
- **rules/coding-style.md**: Detailed style requirements
- **rules/testing.md**: Testing standards and examples
- **rules/security.md**: Security checklist and patterns
- **rules/git-workflow.md**: Git and PR requirements
- **skills/backend-patterns-dotnet/SKILL.md**: .NET patterns
- **skills/frontend-patterns-react/SKILL.md**: React patterns
