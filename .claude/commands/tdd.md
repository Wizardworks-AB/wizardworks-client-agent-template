---
name: tdd
description: Start Test-Driven Development workflow for a new feature or fix
usage: /tdd [feature description]
---

# Test-Driven Development Command

This command initiates the Wizardworks TDD workflow for a new feature or bug fix.

## Usage

```bash
/tdd implement magic search functionality
/tdd fix null reference in GetByPublicIdAsync
/tdd add pagination to magic list
```

## What This Command Does

1. **Spawns TDD Guide Agent**: Launches the Wizardworks tdd-guide agent
2. **Enforces Red-Green-Refactor**: Guides you through the TDD cycle
3. **Ensures Tests First**: Prevents writing implementation before tests
4. **Verifies Coverage**: Checks that 80%+ coverage is maintained

## TDD Workflow

### Step 1: Red (Write Failing Test)
The agent will help you write a test that fails.

**For .NET:**
```csharp
[Fact]
public async Task SearchAsync_Should_ReturnMatchingMagics()
{
    // This test will fail - feature doesn't exist yet
    var result = await _service.SearchAsync("test query");
    result.Should().NotBeEmpty();
}
```

**For TypeScript:**
```typescript
it('returns matching magic items', async () => {
  const result = await searchMagics('test query');
  expect(result.length).toBeGreaterThan(0);
});
```

### Step 2: Green (Minimal Implementation)
Write just enough code to make the test pass.

### Step 3: Refactor (Improve Code)
Improve code quality while keeping tests passing.

### Step 4: Verify Coverage
Ensure 80%+ coverage is maintained.

## When to Use This Command

- Starting a new feature
- Fixing a bug
- Refactoring existing code
- Adding functionality to existing code

## As a Wizardworks Employee

TDD is **mandatory** at Wizardworks. This command helps you follow the company standard workflow.

## Example Session

```
User: /tdd implement magic search with semantic similarity

Agent: I'll guide you through implementing magic search using TDD.

Step 1: Let's write the test first.

For the backend (.NET), we'll create a test in MagicServiceTests.cs:

[Fact]
public async Task SearchAsync_Should_ReturnSemanticallyS imilarResults()
{
    // Arrange
    var mockRepo = new Mock<IMagicRepository>();
    var service = new MagicService(mockRepo.Object);

    // Act
    var results = await service.SearchAsync("spells");

    // Assert
    results.Should().NotBeEmpty();
    results.Should().Contain(m => m.Name.Contains("Magic"));
}

Run this test - it should FAIL because SearchAsync doesn't exist yet.

[Tests fail as expected]

Step 2: Now let's implement the minimal code to pass this test...
```

## Related

- Use `/code-review` after implementation
- Use `/plan` for complex features before starting TDD
- See `rules/testing.md` for full testing requirements

**Remember**: No code without tests. Tests first, always.
