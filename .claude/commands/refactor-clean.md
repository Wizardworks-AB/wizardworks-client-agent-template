---
name: refactor-clean
description: Clean up and refactor code for maintainability
argument-hint: [file or directory]
---

# Refactor & Clean Command

This command helps improve code quality through systematic refactoring, technical debt removal, and cleanup following the project's standards.

## How to run it — delegate, do not do it inline

**Spawn the `refactor-cleaner` agent.** The sections below describe what that agent covers; they are
the brief you hand it, not a checklist for the main session.

Two reasons this matters. The agent works in its own context, so reading the code and finding the smells costs you almost none
of your own. And it carries its own model in frontmatter (`agents/refactor-cleaner.md`), chosen for
this job — doing the work inline silently runs it on whatever model your session is on.

## Usage

```bash
/refactor-clean                           # Refactor all recent changes
/refactor-clean src/services              # Refactor specific directory
/refactor-clean src/path/to/file          # Refactor specific file
/refactor-clean --extract-methods         # Extract large methods
/refactor-clean --remove-duplication      # Remove code duplication
/refactor-clean --simplify-logic          # Simplify complex logic
```

## What This Command Does

1. **Spawns Refactor Agent**: Launches the refactoring specialist
2. **Code Analysis**: Identifies refactoring opportunities
3. **Suggests Improvements**: Provides specific refactoring suggestions
4. **Maintains Tests**: Ensures tests still pass during refactoring
5. **Improves Readability**: Makes code easier to understand
6. **Reduces Complexity**: Simplifies complex logic
7. **Removes Duplication**: Consolidates repeated code
8. **Updates Documentation**: Keeps docs in sync

## Refactoring Patterns

These patterns are language-agnostic; apply them idiomatically for your stack (see `rules/<stack>.md` and existing conventions).

### 1. Extract Method

Break a long method that does several things into small, single-responsibility helpers (validate input, transform, persist). Each becomes independently testable and the top-level method reads as a sequence of intents.

### 2. Remove Duplication

When the same logic (e.g. validation + lookup) appears in more than one place, consolidate it into a single source of truth and call it from both sites.

### 3. Simplify Complex Logic

Replace a large boolean/branching expression with small, named predicate functions so the intent is readable and each condition is testable in isolation.

### 4. Extract Constants

Replace magic numbers/strings scattered inline with named constants centralized at the top of the type/module, so values are self-documenting and easy to change.

### 5. Improve Naming

Rename cryptic identifiers to descriptive ones (`s`/`p`/`sz` → `searchTerm`/`pageNumber`/`pageSize`). Clear names reduce cognitive load and act as documentation.

## Refactoring Checklist

Before and after refactoring:

- [ ] All tests pass before refactoring
- [ ] Single refactoring at a time
- [ ] All tests still pass after refactoring
- [ ] No functional changes (only structural)
- [ ] Performance not degraded
- [ ] Documentation updated
- [ ] PR/commit message explains refactoring

## Anti-Patterns to Fix

- **God objects** — a type with too many responsibilities. Split it into focused types (e.g. separate export, import, reporting, and notification concerns from core CRUD).
- **Long methods** — over the project's line limit. Extract helpers and replace long if/else chains with a dispatch/switch on the operation.
- **Deep nesting** — more than ~4 levels. Use early returns and extract a guard predicate that answers the access/precondition question in one call.

## Running Refactoring

**Before**: run the full test suite; if the code you are about to move has no test around it, put an integration test around it before you start.

**During**:
1. Make one change at a time
2. Run tests after each change
3. Keep tests green

**After**: run the full test suite again and run the project's quality/lint checks.

## Refactoring Guidelines

### DO
- Extract methods with a single responsibility
- Improve naming for clarity
- Remove code duplication
- Run tests after each change
- Keep refactoring focused (one concern at a time)
- Update documentation

### DON'T
- Change functionality while refactoring
- Add new features during refactoring
- Refactor without tests
- Skip test runs
- Mix refactoring with bug fixes

## When to Use This Command

- Preparing for major changes
- Reducing technical debt
- Improving code readability
- Reducing complexity
- After code review feedback
- When adding similar features

## Related Commands

- Use `/code-review` to identify refactoring opportunities
- Use `/build-fix` if refactoring breaks the build

**Remember**: Leave code better than you found it. Refactor continuously.
