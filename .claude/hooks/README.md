# Wizardworks Hooks System

Automated enforcement of Wizardworks engineering standards through Claude Code hooks.

## Overview

This hooks system provides real-time validation and guidance to ensure all code adheres to Wizardworks standards. Hooks automatically run when you write or edit files, checking for:

- Hardcoded secrets
- Database ID exposure
- DTO usage violations
- Layer separation issues
- Immutability violations
- TanStack Query usage
- Console.log statements
- Async/await best practices

## Installation

### For Claude Code Projects

1. **Copy hooks configuration to your project**:
   ```bash
   cp wizardworks-ai-p-and-p/hooks/hooks.json ~/.claude/hooks.json
   ```

2. **Copy hook scripts**:
   ```bash
   cp -r wizardworks-ai-p-and-p/hooks/scripts ~/.claude/hooks/scripts
   ```

3. **Make scripts executable** (Unix/Mac):
   ```bash
   chmod +x ~/.claude/hooks/scripts/*.js
   ```

4. **Verify Node.js is installed**:
   ```bash
   node --version  # Should be 18+
   ```

### For Individual Projects

You can also add hooks to individual projects:

```bash
# In your project root
mkdir -p .claude/hooks
cp path/to/wizardworks-ai-p-and-p/hooks/hooks.json .claude/hooks.json
cp -r path/to/wizardworks-ai-p-and-p/hooks/scripts .claude/hooks/scripts
```

## Available Hooks

### 1. Check for Hardcoded Secrets
**Trigger**: Writing or editing any file
**Severity**: CRITICAL (blocks commit)

Detects:
- API keys (OpenAI, AWS, etc.)
- Passwords in connection strings
- Hardcoded tokens
- Secrets not in environment variables

**Fix**:
- Use environment variables: `process.env.API_KEY`
- Use Azure Key Vault: `@Microsoft.KeyVault(...)`
- Use User Secrets for local dev: `dotnet user-secrets set`

### 2. Check for Database ID Exposure
**Trigger**: Writing Controllers or DTOs
**Severity**: HIGH (warns)

Detects:
- `int id` parameters in HTTP endpoints
- Database ID properties in DTOs
- Controllers returning entities instead of DTOs

**Fix**:
- Use `string publicMagicId` instead of `int id`
- Create DTOs with only public-facing properties

### 3. Check for console.log
**Trigger**: Writing TypeScript/JavaScript files
**Severity**: LOW (warns)

Detects:
- `console.log()` statements
- `console.warn()` statements
- `console.error()` for non-error handling

**Fix**:
- Remove debug statements
- Use proper logging framework

### 4. Enforce DTO Usage
**Trigger**: Writing Controllers
**Severity**: MEDIUM (warns)

Detects:
- Controllers accepting entity models
- Controllers returning entities instead of DTOs

**Fix**:
- Create `CreateXDto`, `UpdateXDto` for inputs
- Return `XDto` for outputs

### 5. Check Async/Await
**Trigger**: Writing C# files
**Severity**: MEDIUM (warns)

Detects:
- `async` methods without `await`
- `.Result` or `.Wait()` (blocking calls)
- `async void` (except event handlers)

**Fix**:
- Use `await` in async methods
- Replace `.Result` with `await`
- Use `async Task` instead of `async void`

### 6. Check Immutability
**Trigger**: Writing TypeScript/React files
**Severity**: MEDIUM (warns)

Detects:
- `array.push()`, `array.pop()`, `array.splice()`
- Direct property mutation
- `array.sort()` without spreading

**Fix**:
- Use spread operators: `[...array, item]`
- Use immutable methods: `array.filter()`, `array.map()`
- Spread before mutating: `[...array].sort()`

### 7. Check Layer Separation
**Trigger**: Writing Controllers
**Severity**: HIGH (warns)

Detects:
- Controllers with direct repository dependencies
- Business logic in controllers
- Direct database access in controllers

**Fix**:
- Follow Controller → Service → Repository pattern
- Move business logic to Service layer
- Remove direct repository/database access

### 8. Check TanStack Query Usage
**Trigger**: Writing React components
**Severity**: MEDIUM (warns)

Detects:
- Direct `fetch()` or `axios` calls in components
- `useEffect` for data fetching
- Manual loading state management

**Fix**:
- Use `useQuery` for GET requests
- Use `useMutation` for POST/PUT/DELETE
- Leverage TanStack Query's built-in states

### 9. Security Review Reminder
**Trigger**: Files with auth/security keywords
**Severity**: INFO (reminds)

Provides checklist for security-sensitive code.

### 10. Infrastructure as Code Reminder
**Trigger**: Mentions of Azure resource creation
**Severity**: INFO (reminds)

Reminds to use Bicep instead of manual portal creation.

### 11. Test Coverage Reminder
**Trigger**: Writing non-test Service/Repository/Controller files
**Severity**: INFO (reminds)

Reminds about 80%+ test coverage requirement.

### 12. TDD Workflow Reminder
**Trigger**: Writing test files
**Severity**: INFO (encourages)

Provides encouragement for following TDD workflow.

### 13. Docker Configuration Check
**Trigger**: Changing package.json or .csproj
**Severity**: INFO (reminds)

Reminds to update Docker configuration when dependencies change.

### 14. Code Review Reminder
**Trigger**: Writing non-test files
**Severity**: INFO (reminds)

Suggests running `/code-review` after implementation.

## Hook Execution Flow

```
┌─────────────────────────────────────┐
│  Developer writes/edits file        │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Claude Code detects tool use       │
│  (Write or Edit)                    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Matcher evaluates conditions       │
│  (file type, path, content)         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Hook script executes               │
│  (Node.js script runs)              │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Validation results displayed       │
│  - Pass (continue)                  │
│  - Warn (continue with warning)     │
│  - Block (prevent operation)        │
└─────────────────────────────────────┘
```

## Hook Matchers

Hooks use matchers to determine when to execute:

```json
{
  "matcher": "tool == \"Write\" || tool == \"Edit\"",
  // Runs on any Write or Edit tool use
}

{
  "matcher": "tool_input.file_path matches \"Controller\\.cs$\"",
  // Runs only on Controller.cs files
}

{
  "matcher": "user_message matches \"(?i)azure.*resource\"",
  // Runs when user mentions Azure resources
}
```

## Customizing Hooks

### Disable Specific Hooks

Edit `hooks.json` and remove or comment out unwanted hooks.

### Adjust Hook Severity

Change `continueOnError`:
- `false`: Block operation on violation
- `true`: Warn but allow to continue

### Add Project-Specific Hooks

Add new hooks to `hooks.json`:

```json
{
  "name": "Custom Check",
  "description": "Your custom validation",
  "matcher": "tool == \"Write\"",
  "hooks": [
    {
      "type": "command",
      "command": "node \"{{hooksDir}}/scripts/your-custom-check.js\" \"{{tool_input.file_path}}\"",
      "continueOnError": true
    }
  ]
}
```

## Creating Custom Hook Scripts

Create a new Node.js script in `hooks/scripts/`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath || !fs.existsSync(filePath)) {
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');

// Your validation logic
if (content.includes('YOUR_PATTERN')) {
  console.error('\n⚠️  [YOUR CHECK]');
  console.error('Issue detected!');
  console.error('Fix: Do this instead.');
  process.exit(0); // or process.exit(1) to block
}

process.exit(0);
```

## Testing Hooks

### Test Individual Hook

```bash
# Test secret detection
node hooks/scripts/check-secrets.js path/to/test/file.cs

# Test public ID check
node hooks/scripts/check-public-ids.js path/to/Controller.cs
```

### Test All Hooks

Create test files with violations and verify hooks trigger:

```bash
# Create test file with hardcoded secret
echo 'const apiKey = "sk-proj-abc123";' > test.ts

# Write file with Claude Code (hooks will trigger)
```

## Troubleshooting

### Hooks Not Running

1. **Check hooks.json location**:
   - Global: `~/.claude/hooks.json`
   - Project: `.claude/hooks.json`

2. **Verify Node.js is available**:
   ```bash
   node --version
   ```

3. **Check script permissions** (Unix/Mac):
   ```bash
   chmod +x ~/.claude/hooks/scripts/*.js
   ```

4. **Check matcher syntax**:
   - Use `tool == \"Write\"` (escaped quotes)
   - Test matchers with simple conditions first

### Hooks Running Too Slowly

1. **Optimize script execution**:
   - Use early returns
   - Limit file size checks
   - Cache results when possible

2. **Reduce number of active hooks**:
   - Disable non-critical hooks
   - Combine similar checks

### False Positives

1. **Adjust patterns in scripts**:
   - Add more context to regex patterns
   - Filter out known false positives

2. **Add exception handling**:
   ```javascript
   if (filePath.includes('test') || filePath.includes('example')) {
     process.exit(0); // Skip for test files
   }
   ```

## Best Practices

### For Developers

1. **Don't ignore warnings**: Hooks are there to help you
2. **Fix violations immediately**: Don't accumulate technical debt
3. **Understand why**: Read the hook explanation, don't just bypass
4. **Test changes**: Ensure your fixes actually resolve the issue

### For Teams

1. **Standardize hook configuration**: Use same hooks.json across team
2. **Document exceptions**: If disabling a hook, document why
3. **Update hooks with standards**: Keep hooks in sync with evolving standards
4. **Share learnings**: When a hook catches an issue, share with team

### For Hook Authors

1. **Clear error messages**: Explain what's wrong and how to fix
2. **Fast execution**: Keep scripts performant
3. **Low false positives**: Test thoroughly before deploying
4. **Helpful, not annoying**: Balance enforcement with usability

## Integration with CI/CD

While hooks run locally in Claude Code, you can also run them in CI/CD:

```yaml
# GitHub Actions example
- name: Run Wizardworks Hooks
  run: |
    for file in $(git diff --name-only origin/main); do
      if [[ $file == *.cs ]]; then
        node hooks/scripts/check-secrets.js "$file"
        node hooks/scripts/check-public-ids.js "$file"
      fi
      if [[ $file == *.ts || $file == *.tsx ]]; then
        node hooks/scripts/check-immutability.js "$file"
        node hooks/scripts/check-tanstack-query.js "$file"
      fi
    done
```

## Hook Development Workflow

1. **Identify need**: What standard needs enforcement?
2. **Write script**: Create validation logic in Node.js
3. **Test script**: Run against real files
4. **Add to hooks.json**: Configure matcher and execution
5. **Test integration**: Verify in Claude Code
6. **Document**: Add to this README
7. **Share**: Commit to repository

## Examples

### Example 1: Catching Hardcoded Secret

```csharp
// Developer writes:
const string ApiKey = "sk-proj-abc123def456";

// Hook output:
🚨 [CRITICAL] Potential Secrets Detected!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File: ApiClient.cs

[CRITICAL] OpenAI API Key:
  - sk-proj-abc123def456

Wizardworks Security Policy:
✗ NEVER hardcode secrets in code
✓ Use environment variables: process.env.API_KEY
✓ Use Azure Key Vault: @Microsoft.KeyVault(...)
✓ Use User Secrets for local dev: dotnet user-secrets set
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Blocking: CRITICAL security violation detected!
```

### Example 2: Catching Database ID Exposure

```csharp
// Developer writes:
[HttpGet("{id}")]
public async Task<IActionResult> Get(int id)
{
    var magic = await _service.GetByIdAsync(id);
    return Ok(magic);
}

// Hook output:
⚠️  [PUBLIC ID CHECK] Potential Database ID Exposure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File: MagicController.cs

1. HTTP endpoint uses int id instead of string publicId
   Found: HttpGet route parameter
   Fix: Change [HttpGet("{id}")] to [HttpGet("{publicMagicId}")]

Wizardworks Standard:
✗ NEVER expose database IDs (int MagicId) externally
✓ ALWAYS use Public IDs (string PublicMagicId) in APIs
✓ DTOs should only contain public-facing properties
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Please review and fix before continuing.
```

### Example 3: TDD Encouragement

```typescript
// Developer writes test first:
describe('MagicService', () => {
  it('creates magic with public ID', async () => {
    // Test implementation
  });
});

// Hook output:
✅ Great! Following TDD by writing tests first. Remember:
1. RED: Test should fail
2. GREEN: Write minimal implementation
3. REFACTOR: Improve code quality
```

## Summary

The Wizardworks hooks system provides:

✅ **Automated Standards Enforcement** - No manual review needed for common issues
✅ **Real-Time Feedback** - Catch issues immediately, not in code review
✅ **Educational** - Teaches best practices through clear error messages
✅ **Customizable** - Adapt to your project's specific needs
✅ **Non-Intrusive** - Warns without blocking (except critical issues)
✅ **CI/CD Ready** - Can run in automated pipelines

By using these hooks, you ensure that all code follows Wizardworks standards from the moment it's written.

---

**Remember**: Hooks are here to help you write better code faster. They catch issues early, saving time in code review and preventing bugs in production.

**Wizardworks Engineering**
*Quality First, Always*
