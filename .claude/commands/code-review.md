---
name: code-review
description: Perform comprehensive code review on recent changes
argument-hint: [file or directory]
---

# Code Review Command

This command performs a comprehensive code review on your recent changes, following this project's standards.

## How to run it — delegate, do not do it inline

**Spawn the `code-reviewer` agent.** The sections below describe what that agent covers; they are
the brief you hand it, not a checklist for the main session.

Two reasons this matters. The agent works in its own context, so reading the whole diff and the surrounding code costs you almost none
of your own. And it carries its own model in frontmatter (`agents/code-reviewer.md`), chosen for
this job — doing the work inline silently runs it on whatever model your session is on.

## Usage

```bash
/code-review                          # Review all recent changes (git diff)
/code-review src/path/to/file         # Review specific file
/code-review src/module               # Review specific directory
```

## What This Command Does

1. **Spawns Code Reviewer Agent**: Launches the code-reviewer agent
2. **Checks Project Standards**: Verifies adherence to the project's patterns (see `rules/<stack>.md` and existing codebase conventions)
3. **Security Review**: Scans for security vulnerabilities
4. **Architecture Review**: Ensures correct layering/separation of concerns
5. **Provides Actionable Feedback**: Categorizes issues by priority

## Review Categories

### CRITICAL (Must Fix)
- Hardcoded secrets
- Injection vulnerabilities (SQL/command/etc.)
- Exposed internal/database IDs in public APIs
- Business logic leaking into the wrong layer
- Missing authentication on protected endpoints
- XSS vulnerabilities

### HIGH (Should Fix)
- Missing tests
- Oversized functions/methods
- Deep nesting
- Missing error handling
- Performance issues (N+1 queries, inefficient algorithms)
- No input validation

### MEDIUM (Consider Improving)
- Poor variable naming
- Missing documentation
- Magic numbers
- Accessibility issues
- Code duplication

## Project-Specific Checks

Verify the code follows the conventions documented for this project (in `rules/<stack>.md` and the existing codebase), for example:

- **Layer separation**: business logic, data access, and transport concerns stay in their own layers
- **Stable public identifiers**: never expose internal/database IDs where a public ID is expected
- **Boundary contracts (DTOs)**: use dedicated types at API boundaries instead of leaking internal models
- **Tests exist** for all code
- **Idiomatic data access** for your stack (parameterized queries, no string-built SQL)
- **Data fetching / state** follows the project's chosen libraries and patterns
- **Immutability** where the project's conventions require it

## Example Output

```markdown
## Code Review Summary

**Reviewed Files**: 3 files
**Review Status**: REQUEST CHANGES

### Critical Issues (Must Fix): 2

#### [CRITICAL] Internal ID Exposed in API
**File**: <controller/handler file>
**Issue**: Endpoint uses an internal/database ID instead of a public ID
**Fix**: Accept and return the public identifier instead

#### [CRITICAL] Hardcoded Connection String
**File**: <config file>
**Issue**: Connection string committed to git
**Fix**: Remove it; source from your secrets manager or environment variables

### High Priority Issues (Should Fix): 3

#### [HIGH] Missing Tests
**File**: <service/module file>
**Issue**: New method has no tests
**Fix**: Add tests to meet the project coverage threshold

### Medium Priority Issues (Consider): 1

#### [MEDIUM] Magic Number
**Issue**: Hardcoded value used inline
**Fix**: Extract to a named constant

### Positive Observations
- Good use of async patterns throughout
- Proper boundary types in the API layer
- Clear variable naming

### Overall Assessment
Cannot merge due to 2 CRITICAL issues. Fix the ID exposure and remove the hardcoded connection string before merging.
```

## When to Use This Command

- After writing new code
- Before creating a pull request
- After receiving feedback
- When refactoring existing code
- **Use proactively** - don't wait for PR reviews

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

**Remember**: Code review is mandatory before merging. Review early, review often.
