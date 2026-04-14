# Wizardworks Testing Requirements

**MANDATORY**: Test-Driven Development (TDD) is a core principle at Wizardworks. All code must have tests.

## Minimum Test Coverage: 80%

This is NON-NEGOTIABLE. Code without 80%+ coverage cannot be merged.

## Test-Driven Development Workflow

### Step 1: Write Test First (RED)
- Write a failing test that defines desired functionality
- Test should fail because feature doesn't exist yet

### Step 2: Run Test (Verify FAIL)
- Confirm test fails for the right reason
- Proves test is actually testing something

### Step 3: Write Minimal Implementation (GREEN)
- Write just enough code to make test pass
- Don't add extra features

### Step 4: Run Test (Verify PASS)
- Confirm test now passes
- All existing tests still pass

### Step 5: Refactor (IMPROVE)
- Improve code quality
- Remove duplication
- Optimize performance
- Enhance readability

### Step 6: Verify Coverage
- Run coverage report
- Ensure 80%+ coverage
- Add tests for any gaps

## Test Types (ALL Required)

### 1. Unit Tests (Mandatory)

Test individual functions/methods in isolation.

**For .NET/C#:**
```csharp
// Test framework: xUnit
// Assertion library: FluentAssertions

using FluentAssertions;
using Xunit;

public class MagicServiceTests
{
    [Fact]
    public async Task CreateAsync_Should_GeneratePublicId()
    {
        // Arrange
        var mockRepo = new Mock<IMagicRepository>();
        var service = new MagicService(mockRepo.Object);
        var dto = new CreateMagicDto { Name = "Test" };

        mockRepo.Setup(r => r.CreateAsync(It.IsAny<Magic>()))
            .ReturnsAsync((Magic m) => m);

        // Act
        var result = await service.CreateAsync(dto);

        // Assert
        result.PublicMagicId.Should().NotBeNullOrEmpty();
        result.Name.Should().Be("Test");
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public async Task GetByPublicIdAsync_Should_ReturnNull_For_Invalid_Input(string? publicId)
    {
        // Arrange
        var mockRepo = new Mock<IMagicRepository>();
        var service = new MagicService(mockRepo.Object);

        // Act
        var result = await service.GetByPublicIdAsync(publicId!);

        // Assert
        result.Should().BeNull();
    }
}
```

**For TypeScript/React:**
```typescript
// Test framework: Vitest
// Testing Library: React Testing Library

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCreateMagic } from '@/hooks/useMagic';

describe('useCreateMagic', () => {
  it('creates magic item successfully', async () => {
    const newMagic = { name: 'Test', description: 'Test Desc' };

    const { result } = renderHook(() => useCreateMagic(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate(newMagic);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe('Test');
  });

  it('handles error when creation fails', async () => {
    vi.mocked(magicService.create).mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useCreateMagic(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({ name: 'Test' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

### 2. Integration Tests (Mandatory)

Test API endpoints, database operations, and component integration.

**For .NET/C# (API Tests):**
```csharp
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using Xunit;

public class MagicControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public MagicControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Post_CreateMagic_Returns_Created()
    {
        // Arrange
        var createDto = new CreateMagicDto
        {
            Name = "Integration Test",
            Description = "Test Description"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/magic", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<MagicDto>();
        result.Should().NotBeNull();
        result!.Name.Should().Be("Integration Test");
        result.PublicMagicId.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Get_WithInvalidId_Returns_NotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/magic/nonexistent");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
```

**For TypeScript/React:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MagicList } from '@/components/features/MagicList';

describe('MagicList', () => {
  it('displays magic items from API', async () => {
    const mockMagics = [
      { publicMagicId: '1', name: 'Test Magic 1', isActive: true, createdAt: new Date().toISOString() },
      { publicMagicId: '2', name: 'Test Magic 2', isActive: true, createdAt: new Date().toISOString() },
    ];

    vi.mocked(magicService.getAll).mockResolvedValue(mockMagics);

    render(<MagicList />, { wrapper: createAppWrapper() });

    await screen.findByText('Test Magic 1');
    expect(screen.getByText('Test Magic 2')).toBeInTheDocument();
  });

  it('handles delete action', async () => {
    const user = userEvent.setup();
    const mockMagics = [
      { publicMagicId: '1', name: 'Test Magic', isActive: true, createdAt: new Date().toISOString() },
    ];

    vi.mocked(magicService.getAll).mockResolvedValue(mockMagics);
    vi.mocked(magicService.delete).mockResolvedValue();

    render(<MagicList />, { wrapper: createAppWrapper() });

    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(magicService.delete).toHaveBeenCalledWith('1');
  });
});
```

### 3. E2E Tests (For Critical User Flows)

Test complete user journeys with Playwright.

**For .NET/C# (with Playwright):**
```csharp
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;

[TestFixture]
public class MagicE2ETests : PageTest
{
    [Test]
    public async Task User_Can_Create_And_View_Magic_Item()
    {
        await Page.GotoAsync("https://localhost:5001/magic");

        // Create new magic item
        await Page.GetByRole(AriaRole.Button, new() { Name = "Create New" }).ClickAsync();
        await Page.GetByLabel("Name").FillAsync("E2E Test Magic");
        await Page.GetByLabel("Description").FillAsync("Created in E2E test");
        await Page.GetByRole(AriaRole.Button, new() { Name = "Create" }).ClickAsync();

        // Verify it appears in list
        await Expect(Page.GetByText("E2E Test Magic")).ToBeVisibleAsync();
    }

    [Test]
    public async Task User_Can_Update_Magic_Item()
    {
        await Page.GotoAsync("https://localhost:5001/magic");

        // Click first item
        await Page.Locator("[data-testid='magic-item']").First.ClickAsync();

        // Edit
        await Page.GetByRole(AriaRole.Button, new() { Name = "Edit" }).ClickAsync();
        await Page.GetByLabel("Name").FillAsync("Updated Name");
        await Page.GetByRole(AriaRole.Button, new() { Name = "Save" }).ClickAsync();

        // Verify update
        await Expect(Page.GetByText("Updated Name")).ToBeVisibleAsync();
    }
}
```

**For TypeScript/React (with Playwright):**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Magic Items Management', () => {
  test('user can create and view magic item', async ({ page }) => {
    await page.goto('/magic');

    // Create new magic item
    await page.getByRole('button', { name: 'Create New' }).click();
    await page.getByLabel('Name').fill('E2E Test Magic');
    await page.getByLabel('Description').fill('Created in E2E test');
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify it appears in list
    await expect(page.getByText('E2E Test Magic')).toBeVisible();
  });

  test('user can search magic items', async ({ page }) => {
    await page.goto('/magic');

    await page.getByPlaceholder('Search magic items...').fill('test');

    // Wait for debounced search
    await page.waitForTimeout(600);

    // Verify filtered results
    const items = page.locator('[data-testid="magic-item"]');
    await expect(items).toHaveCountGreaterThan(0);
  });
});
```

## Edge Cases You MUST Test

For EVERY function/method, test these scenarios:

1. **Null/Undefined Input**
   ```csharp
   [Fact]
   public async Task Should_Handle_Null_Input()
   {
       var result = await _service.GetByPublicIdAsync(null!);
       result.Should().BeNull();
   }
   ```

2. **Empty Input**
   ```typescript
   it('handles empty string', () => {
       expect(validateInput('')).toBe(false);
   });
   ```

3. **Invalid Types** (TypeScript)
   ```typescript
   it('rejects invalid type', () => {
       expect(() => processData('invalid' as any)).toThrow();
   });
   ```

4. **Boundary Values**
   ```csharp
   [Theory]
   [InlineData(0)]
   [InlineData(int.MaxValue)]
   public async Task Should_Handle_Boundary_Values(int value) { }
   ```

5. **Error Conditions**
   ```typescript
   it('handles network error', async () => {
       vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));
       await expect(fetchData()).rejects.toThrow('Network error');
   });
   ```

6. **Concurrent Operations**
   ```csharp
   [Fact]
   public async Task Should_Handle_Concurrent_Updates()
   {
       var tasks = Enumerable.Range(0, 10)
           .Select(i => _service.UpdateAsync(publicId, new UpdateDto { Name = $"Name {i}" }));
       await Task.WhenAll(tasks);
       // Verify final state
   }
   ```

## Mocking Best Practices

### .NET/C# (Moq)

```csharp
// ✅ GOOD: Proper setup and verification
var mockRepo = new Mock<IMagicRepository>();
mockRepo
    .Setup(r => r.GetByPublicIdAsync("test-id"))
    .ReturnsAsync(new Magic { PublicMagicId = "test-id", Name = "Test" });

var result = await _service.GetByPublicIdAsync("test-id");

mockRepo.Verify(r => r.GetByPublicIdAsync("test-id"), Times.Once);

// ❌ BAD: No verification
var mockRepo = new Mock<IMagicRepository>();
mockRepo.Setup(r => r.GetByPublicIdAsync(It.IsAny<string>()))
    .ReturnsAsync(new Magic());
// Missing verification
```

### TypeScript (Vitest)

```typescript
// ✅ GOOD: Proper mock and cleanup
import { vi } from 'vitest';

vi.mock('@/services/magicService');

it('calls service correctly', async () => {
  const mockCreate = vi.mocked(magicService.create);
  mockCreate.mockResolvedValue({ publicMagicId: '1', name: 'Test' });

  await createMagic({ name: 'Test' });

  expect(mockCreate).toHaveBeenCalledWith({ name: 'Test' });
  expect(mockCreate).toHaveBeenCalledTimes(1);
});

// ❌ BAD: Not clearing mocks between tests
// Mocks can leak between tests causing flakiness
```

## Test Organization

### AAA Pattern (Arrange-Act-Assert)

```csharp
[Fact]
public async Task CreateAsync_Should_SaveToDatabase()
{
    // Arrange
    var mockRepo = new Mock<IMagicRepository>();
    var service = new MagicService(mockRepo.Object);
    var dto = new CreateMagicDto { Name = "Test" };

    // Act
    var result = await service.CreateAsync(dto);

    // Assert
    result.Should().NotBeNull();
    mockRepo.Verify(r => r.CreateAsync(It.IsAny<Magic>()), Times.Once);
}
```

### Test Naming

```csharp
// ✅ GOOD: Descriptive test names
[Fact]
public async Task GetByPublicIdAsync_Should_ReturnNull_When_NotFound() { }

[Fact]
public async Task CreateAsync_Should_ThrowException_When_NameIsEmpty() { }

// ❌ BAD: Vague test names
[Fact]
public async Task Test1() { }

[Fact]
public async Task TestCreate() { }
```

## Coverage Requirements

### Tools

**For .NET:**
```bash
# Install coverlet
dotnet add package coverlet.collector

# Run tests with coverage
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover

# Generate HTML report
reportgenerator -reports:coverage.opencover.xml -targetdir:coverage-report
```

**For TypeScript:**
```bash
# vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});

# Run tests with coverage
pnpm test:coverage
```

### Required Thresholds
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

## Test Quality Checklist

Before marking tests complete:

- [ ] All public methods/functions have unit tests
- [ ] All API endpoints have integration tests
- [ ] Critical user flows have E2E tests
- [ ] Edge cases covered (null, empty, invalid, boundaries)
- [ ] Error paths tested (not just happy path)
- [ ] Mocks used for external dependencies
- [ ] Tests are independent (no shared state)
- [ ] Test names describe what's being tested
- [ ] Assertions are specific and meaningful
- [ ] Coverage is 80%+ (verified with coverage report)
- [ ] Tests run successfully in CI/CD pipeline

## Wizardworks-Specific Testing

### Test Public ID Generation

```csharp
[Fact]
public async Task CreateAsync_Should_GenerateUniquePublicId()
{
    var result1 = await _service.CreateAsync(new CreateMagicDto { Name = "Test1" });
    var result2 = await _service.CreateAsync(new CreateMagicDto { Name = "Test2" });

    result1.PublicMagicId.Should().NotBe(result2.PublicMagicId);
}
```

### Test Controller-Service-Repository Layers Independently

```csharp
// Repository layer - test data access
public class MagicRepositoryTests { }

// Service layer - test business logic (mock repository)
public class MagicServiceTests { }

// Controller layer - test HTTP handling (mock service)
public class MagicControllerTests { }
```

### Test DTO Mapping

```csharp
[Fact]
public void MapToDto_Should_ExcludeDatabaseId()
{
    var magic = new Magic
    {
        MagicId = 123,  // Internal DB ID
        PublicMagicId = "abc",
        Name = "Test"
    };

    var dto = _service.MapToDto(magic);

    dto.PublicMagicId.Should().Be("abc");
    dto.Name.Should().Be("Test");
    // DTO should not have MagicId property
}
```

## CI/CD Integration

### .NET
```yaml
# GitHub Actions or Azure DevOps
- name: Run Tests
  run: dotnet test --configuration Release --logger trx --results-directory ./test-results /p:CollectCoverage=true

- name: Check Coverage
  run: |
    if [ $(grep 'line-rate' coverage.opencover.xml | awk -F'"' '{print $2*100}') -lt 80 ]; then
      echo "Coverage below 80%"
      exit 1
    fi
```

### TypeScript
```yaml
- name: Run Tests
  run: pnpm test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

**Remember**: Testing is not optional at Wizardworks. TDD is mandatory. 80%+ coverage is required. Tests protect our code, enable confident refactoring, and ensure quality.
