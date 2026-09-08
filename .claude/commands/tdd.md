---
name: tdd
description: Start Test-Driven Development workflow for a new feature or fix
argument-hint: [feature description]
---

# Test-Driven Development Command

This command initiates the TDD workflow for a new feature or bug fix.

## Usage

```bash
/tdd implement search functionality
/tdd fix null reference in the lookup path
/tdd add pagination to the list endpoint
```

## What This Command Does

1. **Orchestrates the TDD agents**: Launches the tdd-test-writer agent (RED) and then the tdd-implementer agent (GREEN→REFACTOR)
2. **Enforces Red-Green-Refactor**: Guides you through the TDD cycle
3. **Ensures Tests First**: Prevents writing implementation before tests
4. **Verifies Coverage**: Checks that the project's coverage threshold is maintained

Use your stack's test framework and conventions (see `rules/testing.md`, `rules/<stack>.md`, and existing tests).

## TDD Workflow

### Step 1: Red (Write Failing Test)

Write a test that captures the desired behavior and fails because the feature doesn't exist yet. For example, assert that a `search` operation returns matching results for a query.

### Step 2: Green (Minimal Implementation)

Write just enough code to make the test pass — no more.

### Step 3: Refactor (Improve Code)

Improve code quality while keeping tests passing.

### Step 4: Verify Coverage

Ensure the project's coverage threshold is maintained.

## When to Use This Command

- Starting a new feature
- Fixing a bug
- Refactoring existing code
- Adding functionality to existing code

## Example Session

```
User: /tdd implement search with semantic similarity

Agent: I'll guide you through implementing search using TDD.

Step 1: Write the test first.
Create a test that calls the (not-yet-existing) search method and asserts it
returns results matching the query.

Run this test — it should FAIL because the method doesn't exist yet.

[Tests fail as expected]

Step 2: Now implement the minimal code to make the test pass...
```

## Related

- Use `/code-review` after implementation
- Use `/plan` for complex features before starting TDD
- See `rules/testing.md` for full testing requirements

**Remember**: No code without tests. Tests first, always.
