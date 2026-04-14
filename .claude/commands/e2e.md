---
name: e2e
description: Run end-to-end tests for critical user flows
usage: /e2e [test name or feature]
---

# E2E Testing Command

This command manages end-to-end testing using Playwright. E2E tests validate complete user journeys across your full application stack.

## Usage

```bash
/e2e                                      # Run all E2E tests
/e2e magic-creation                       # Run specific test
/e2e --headed                             # Run with browser visible
/e2e --debug                              # Run in debug mode
/e2e magic                                # Run all tests matching pattern
/e2e --update-snapshots                   # Update visual regression snapshots
```

## What This Command Does

1. **Launches Playwright Browser**: Starts automated browser instances
2. **Navigates Application**: Simulates real user interactions
3. **Validates Results**: Checks UI state and data
4. **Captures Screenshots**: Takes snapshots for comparison
5. **Generates Reports**: Creates HTML test reports
6. **Visual Regression**: Detects unintended UI changes
7. **Performance Metrics**: Measures critical interactions

## E2E Test Structure

### .NET/C# with Playwright

**Project Setup**:
```bash
dotnet add package Microsoft.Playwright.NUnit
dotnet playwright install
```

**Test File**:
```csharp
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;

[TestFixture]
public class MagicE2ETests : PageTest
{
    private const string BaseUrl = "https://localhost:5173";  // Vite dev server

    [Test]
    public async Task User_Can_Create_Magic_Item()
    {
        // Navigate to app
        await Page.GotoAsync($"{BaseUrl}/magic");

        // Wait for page to load
        await Expect(Page).ToHaveTitleAsync(/Magic/);

        // Click create button
        await Page.GetByRole(AriaRole.Button, new() { Name = "Create New" })
            .ClickAsync();

        // Fill form
        await Page.GetByLabel("Name").FillAsync("E2E Test Magic");
        await Page.GetByLabel("Description").FillAsync("Created via E2E test");

        // Submit
        await Page.GetByRole(AriaRole.Button, new() { Name = "Create" })
            .ClickAsync();

        // Verify success
        await Expect(Page.GetByText("E2E Test Magic")).ToBeVisibleAsync();

        // Optional: Take screenshot
        await Page.ScreenshotAsync(new() { Path = "magic-created.png" });
    }

    [Test]
    public async Task User_Can_Search_Magic_Items()
    {
        await Page.GotoAsync($"{BaseUrl}/magic");

        // Type in search
        await Page.GetByPlaceholder("Search magic items...").FillAsync("test");

        // Wait for debounced search (600ms)
        await Page.WaitForTimeoutAsync(700);

        // Verify filtered results
        var items = Page.Locator("[data-testid='magic-item']");
        await Expect(items).ToHaveCountGreaterThanAsync(0);
    }

    [Test]
    public async Task User_Can_Delete_Magic_Item()
    {
        await Page.GotoAsync($"{BaseUrl}/magic");

        // Find and click first item
        var firstItem = Page.Locator("[data-testid='magic-item']").First;
        await firstItem.ClickAsync();

        // Click delete
        await Page.GetByRole(AriaRole.Button, new() { Name = "Delete" })
            .ClickAsync();

        // Confirm
        await Page.GetByRole(AriaRole.Button, new() { Name = "Confirm" })
            .ClickAsync();

        // Verify removed
        await Expect(firstItem).Not.ToBeVisibleAsync();
    }
}
```

### TypeScript/React with Playwright

**Project Setup**:
```bash
npm init playwright@latest
# or
pnpm add -D @playwright/test
```

**Test File**:
```typescript
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Magic Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app before each test
    await page.goto(BASE_URL);
    // Wait for app to load
    await expect(page).toHaveTitle(/Magic/);
  });

  test('user can create magic item', async ({ page }) => {
    // Click create button
    await page.getByRole('button', { name: 'Create New' }).click();

    // Fill form
    await page.getByLabel('Name').fill('E2E Test Magic');
    await page.getByLabel('Description').fill('Created via E2E test');

    // Submit
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify success
    await expect(page.getByText('E2E Test Magic')).toBeVisible();
  });

  test('user can search and view magic item', async ({ page }) => {
    // Search
    await page.getByPlaceholder('Search magic items...').fill('test');

    // Wait for debounced search
    await page.waitForTimeout(700);

    // Verify results
    const items = page.locator('[data-testid="magic-item"]');
    await expect(items).toHaveCount(1);

    // Click to view
    await items.first().click();

    // Verify detail view
    await expect(page.getByRole('heading')).toContainText('Magic Details');
  });

  test('user can update magic item', async ({ page }) => {
    // Navigate to detail
    await page.goto(`${BASE_URL}/magic/test-magic-id`);

    // Click edit
    await page.getByRole('button', { name: 'Edit' }).click();

    // Update name
    await page.getByLabel('Name').clear();
    await page.getByLabel('Name').fill('Updated Magic Name');

    // Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify update
    await expect(page.getByText('Updated Magic Name')).toBeVisible();
  });

  test('user can delete magic item', async ({ page }) => {
    // Navigate to detail
    await page.goto(`${BASE_URL}/magic/test-magic-id`);

    // Click delete
    await page.getByRole('button', { name: 'Delete' }).click();

    // Confirm
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Verify redirect to list
    await expect(page).toHaveURL(`${BASE_URL}/magic`);
  });

  test('user sees error on invalid input', async ({ page }) => {
    // Navigate to create
    await page.goto(`${BASE_URL}/magic/new`);

    // Submit empty form
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify error messages
    await expect(page.getByText('Name is required')).toBeVisible();
  });
});
```

## Test Best Practices

### 1. Use Test Data Attributes

**React Component**:
```tsx
export function MagicItem({ magic }: Props) {
  return (
    <div data-testid="magic-item" data-magic-id={magic.publicMagicId}>
      <h3>{magic.name}</h3>
      <p>{magic.description}</p>
      <button data-testid="magic-edit-btn">Edit</button>
      <button data-testid="magic-delete-btn">Delete</button>
    </div>
  );
}
```

**Playwright Test**:
```typescript
// Use semantic selectors (more stable than CSS)
const item = page.locator('[data-testid="magic-item"]').first();
const editBtn = item.getByRole('button', { name: 'Edit' });
await editBtn.click();
```

### 2. Wait for Elements Properly

```typescript
// ✅ GOOD: Playwright waits automatically
await page.getByRole('button', { name: 'Create' }).click();

// ✅ GOOD: Wait for specific condition
await expect(page.getByText('Success')).toBeVisible();

// ❌ BAD: Fixed waits (flaky)
await page.waitForTimeout(1000);
```

### 3. Handle Async Operations

```typescript
// ✅ GOOD: Wait for network to settle
await page.goto(baseUrl);
await page.waitForLoadState('networkidle');

// ✅ GOOD: Wait for specific request
await Promise.all([
  page.waitForResponse(response => response.url().includes('/api/magic')),
  page.getByRole('button', { name: 'Create' }).click(),
]);

// ✅ GOOD: Wait for element after action
await page.getByLabel('Name').fill('Test');
await expect(page.getByText('Name is required')).not.toBeVisible();
```

### 4. Testing Authentication

```typescript
test.beforeEach(async ({ page, context }) => {
  // Set authentication token in localStorage
  await context.addInitScript(() => {
    window.localStorage.setItem(
      'auth_token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    );
  });

  await page.goto(BASE_URL);
});

test('authenticated user can access protected page', async ({ page }) => {
  // With token set, user is authenticated
  await page.goto(`${BASE_URL}/magic`);
  await expect(page).toHaveTitle(/Magic/);
});
```

### 5. Testing API Integration

```typescript
test('app displays data from API', async ({ page }) => {
  // Mock API response
  await page.route('**/api/magic', async route => {
    await route.abort('blockedbyclient');
  });

  // Or intercept and modify
  await page.route('**/api/magic*', async route => {
    const response = await route.fetch();
    const json = await response.json();
    json.items = json.items.slice(0, 1);  // Limit to 1 item
    await route.fulfill({ response, json });
  });
});
```

## Critical User Flows to Test

All Wizardworks applications should test these flows:

### Authentication Flow
```typescript
test('user can login and logout', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();

  // Verify logged in
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

  // Logout
  await page.getByRole('button', { name: 'Logout' }).click();

  // Verify logged out
  await expect(page).toHaveURL(`${BASE_URL}/login`);
});
```

### Create, Read, Update, Delete (CRUD)
```typescript
test('user can perform CRUD operations', async ({ page }) => {
  // Create
  // Read
  // Update
  // Delete
});
```

### Error Handling
```typescript
test('user sees error messages on failure', async ({ page }) => {
  // Network error
  // Validation error
  // Server error
});
```

### Accessibility
```typescript
test('page is keyboard navigable', async ({ page }) => {
  // Tab through form
  // Enter to submit
  // Escape to close
});
```

## Configuration

**playwright.config.ts**:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

## Running E2E Tests

**Locally**:
```bash
# Run all tests
pnpm test:e2e

# Run with browser visible
pnpm test:e2e --headed

# Run single test
pnpm test:e2e magic-creation

# Debug mode
pnpm test:e2e --debug

# Update snapshots
pnpm test:e2e --update-snapshots
```

**CI/CD Pipeline**:
```yaml
- name: Run E2E Tests
  run: pnpm test:e2e

- name: Upload Test Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## E2E Test Checklist

Essential tests for Wizardworks applications:

- [ ] User can authenticate
- [ ] User can navigate main features
- [ ] Create operation works end-to-end
- [ ] Read/display works correctly
- [ ] Update operation works end-to-end
- [ ] Delete operation works end-to-end
- [ ] Error messages display correctly
- [ ] Form validation works
- [ ] Search/filter functionality works
- [ ] Pagination works (if applicable)
- [ ] Export functionality works (if applicable)
- [ ] API errors handled gracefully
- [ ] Network timeouts handled gracefully
- [ ] Mobile responsiveness works (if applicable)
- [ ] Accessibility basics verified

## When to Use This Command

- **After major feature implementation**
- **Before release**
- **After critical bug fixes**
- **During regression testing**
- **Before deploying to production**
- **When testing cross-browser compatibility**
- **For performance-critical features**

## Related Commands

- Use `/tdd` for unit and integration tests
- Use `/code-review` before committing
- Use `/security-review` for auth/security flows
- See `rules/testing.md` for full testing requirements

## As a Wizardworks Employee

E2E tests validate real user experience. They catch issues that unit tests miss.

**Remember**: E2E tests are your safety net before production. Run them thoroughly.
