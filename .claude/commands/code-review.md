---
name: code-review
description: Perform comprehensive code review on recent changes
usage: /code-review [file or directory]
---

# Code Review Command

This command performs a comprehensive Wizardworks-standard code review on your recent changes.

## Usage

```bash
/code-review                          # Review all recent changes (git diff)
/code-review src/MagicService.cs      # Review specific file
/code-review src/Magic                # Review specific directory
```

## What This Command Does

1. **Spawns Code Reviewer Agent**: Launches the Wizardworks code-reviewer agent
2. **Checks Wizardworks Standards**: Verifies adherence to company patterns
3. **Security Review**: Scans for security vulnerabilities
4. **Architecture Review**: Ensures correct layer separation
5. **Provides Actionable Feedback**: Categorizes issues by priority

## Review Categories

### CRITICAL (Must Fix)
- Hardcoded secrets
- SQL injection vulnerabilities
- Exposed database IDs in APIs
- Business logic in controllers
- Missing authentication on protected endpoints
- XSS vulnerabilities

### HIGH (Should Fix)
- Missing tests
- Large functions (>50 lines for .NET, >30 for React)
- Deep nesting (>4 levels)
- Missing error handling
- Performance issues (N+1 queries, inefficient algorithms)
- No input validation

### MEDIUM (Consider Improving)
- Poor variable naming
- Missing documentation
- Magic numbers
- Accessibility issues
- Code duplication

## Wizardworks-Specific Checks

- **Controller-Service-Repository**: Correct layer separation
- **Public IDs**: Never exposing database IDs
- **DTOs**: Used for all API boundaries
- **TDD**: Tests exist for all code
- **EF Core**: Proper usage (or Dapper with justification)
- **Docker**: Configuration present
- **TanStack Query**: Used for frontend data fetching
- **Immutability**: No state mutation

## Example Output

```markdown
## Code Review Summary

**Reviewed Files**: 3 files
**Review Status**: ❌ REQUEST CHANGES

### Critical Issues (Must Fix): 2

#### [CRITICAL] Database ID Exposed in API
**File**: Controllers/MagicController.cs:42
**Issue**: Endpoint uses database ID instead of Public ID
**Fix**: Change parameter from `int id` to `string publicMagicId`

**Current**:
```csharp
[HttpGet("{id}")]
public async Task<IActionResult> Get(int id)
```

**Suggested**:
```csharp
[HttpGet("{publicMagicId}")]
public async Task<IActionResult> Get(string publicMagicId)
```

#### [CRITICAL] Hardcoded Connection String
**File**: appsettings.json:5
**Issue**: Connection string committed to git
**Fix**: Remove from appsettings.json, use User Secrets or Azure Key Vault

### High Priority Issues (Should Fix): 3

#### [HIGH] Missing Tests
**File**: Services/MagicService.cs
**Issue**: New SearchAsync method has no tests
**Fix**: Add unit tests with 80%+ coverage

### Medium Priority Issues (Consider): 1

#### [MEDIUM] Magic Number
**File**: Services/MagicService.cs:78
**Issue**: Hardcoded value 500 for debounce delay
**Fix**: Extract to named constant

### Positive Observations
- Good use of async/await throughout
- Proper DTO usage in API layer
- Clear variable naming

### Overall Assessment
Cannot merge due to 2 CRITICAL issues. Fix database ID exposure and remove hardcoded connection string before merging.
```

## When to Use This Command

- After writing new code
- Before creating a pull request
- After receiving feedback
- When refactoring existing code
- **Use proactively** - don't wait for PR reviews

## As a Wizardworks Employee

Code review is **mandatory** before merging. This command helps you catch issues early.

## Best Practices

1. Run review **before** committing
2. Address all CRITICAL and HIGH issues
3. Consider MEDIUM issues for code quality
4. Run again after fixes to verify
5. Use in combination with TDD workflow

## Related

- Use `/tdd` to ensure tests exist
- See `rules/coding-style.md` for style guidelines
- See `rules/security.md` for security standards
- See `agents/code-reviewer.md` for full review criteria

**Remember**: Quality code is non-negotiable at Wizardworks. Review early, review often.
