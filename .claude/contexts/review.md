# Code Review Context

Mode: Pull Request review, code analysis, quality assurance
Focus: Quality, security, maintainability, and project standard compliance

## Behavior

- **Read thoroughly first**: Examine all files and changes before commenting
- **Prioritize by severity**: CRITICAL → HIGH → MEDIUM → LOW
- **Suggest fixes, not just problems**: Provide concrete solutions
- **Check architectural compliance**: Verify the project's layering / separation of concerns
- **Security focus**: Look for secrets, injection risks, auth issues
- **Tests**: Verify the change ships with tests at the right level (`rules/testing.md`)
- **Pattern adherence**: Ensure public ID and boundary-contract (DTO) patterns are followed

## Review Checklist

### Architecture & Patterns

- [ ] Layers properly separated (no layer skipping)
- [ ] Transport/handler layer only contains transport concerns
- [ ] Business logic lives in the service layer
- [ ] Data-access layer handles data access only
- [ ] Public IDs used in API responses (never internal/database IDs)
- [ ] Boundary contracts (DTOs) used for API contracts (internal models never exposed)
- [ ] Frontend components are small and composable

### Code Quality

- [ ] Logic is correct and handles edge cases
- [ ] Methods/functions under the project's size limits
- [ ] Files under the project's size limits
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
- [ ] Edge cases covered (null, empty, boundary values, errors)
- [ ] Mocks used for external dependencies
- [ ] Test names are descriptive
- [ ] AAA pattern used (Arrange-Act-Assert)

### Security (CRITICAL)

- [ ] No hardcoded secrets (API keys, passwords, connection strings)
- [ ] Secrets sourced from a secrets manager or environment variables
- [ ] Parameterized queries / safe query APIs used
- [ ] Input validation on all API endpoints
- [ ] Injection prevention verified
- [ ] XSS prevention (output encoding, or allow-list sanitization for raw markup)
- [ ] Authentication/authorization on sensitive endpoints
- [ ] Rate limiting on public endpoints
- [ ] HTTPS enforced
- [ ] No sensitive data in error messages
- [ ] Dependencies scanned for vulnerabilities

### Language & Stack Standards

Verify code follows the naming, typing, async, immutability, documentation, and file-organization conventions documented for this project's stack (see `rules/coding-style.md` and `rules/<stack>.md`), and matches the surrounding code.

## Priority Levels

### CRITICAL (Block merge)

- Security vulnerabilities (secrets, injection, auth bypass)
- Layer architecture violations (transport calling data access, skipping business logic)
- Public IDs not used (exposing internal/database IDs)
- Boundary contracts not used (exposing internal models)
- No tests (particularly security-sensitive code)
- Hardcoded secrets

### HIGH (Must fix before merge)

- Logic errors that break functionality
- Missing edge case handling
- Improper error handling
- SQL injection risks
- XSS vulnerabilities
- Missing input validation
- Change ships without a test that would catch its regression

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
- [ ] Check: Parameterized queries / safe query APIs (no string-built queries)
- [ ] Verify: Input validation on all public endpoints
- [ ] Ensure: Auth checks on sensitive operations
- [ ] Validate: No debug logging with sensitive data
- [ ] Check: Configuration sourced from a secrets manager or environment variables

## Testing Review Focus

- [ ] The change has a test at the boundary it touches
- [ ] Happy path and error paths tested
- [ ] Boundary conditions tested
- [ ] Null/empty/invalid input tested
- [ ] Mocks verify correct calls to dependencies
- [ ] Test names describe what's being tested
- [ ] No flaky or time-dependent tests

## Architecture Review Focus

- [ ] No transport/handler layer directly calling data access
- [ ] Business-logic layer orchestrates the work
- [ ] Boundary contracts (DTOs) separate API contracts from domain models
- [ ] Public IDs used externally
- [ ] Component dependencies properly injected
- [ ] Components are testable units
- [ ] Separation of concerns maintained

## Common Issues to Flag

| Issue | Example | Fix |
|-------|---------|-----|
| Layer Skipping | transport calling data access directly | Route through the business-logic layer |
| Exposed internal ID | returning the internal/database ID | Return the public identifier |
| Internal model exposure | accepting/returning a domain entity at the API boundary | Use a dedicated boundary type (DTO) |
| Hardcoded Secret | `apiKey = "sk-..."` | Source from a secrets manager / environment variables |
| Injection | query built from interpolated user input | Use parameterized queries / safe query APIs |
| No Auth Check | delete/admin endpoint with no access control | Add the project's authorization check |
| Untested change | no test would fail if it regressed | Add an integration test at the boundary |
| Oversized Method | over the project's size limit | Extract helper methods |

## Approval Criteria

Code is ready to merge when:

- ✅ All CRITICAL issues resolved
- ✅ All HIGH issues resolved
- ✅ MEDIUM/LOW issues addressed or accepted
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
- **rules/<stack>.md**: Stack-specific patterns and conventions
