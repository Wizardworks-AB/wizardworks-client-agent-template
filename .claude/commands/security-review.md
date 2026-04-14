---
name: security-review
description: Run comprehensive security review for vulnerabilities and compliance
usage: /security-review [file or directory]
---

# Security Review Command

This command performs a comprehensive Wizardworks security review on your code for vulnerabilities, compliance violations, and security best practices.

## Usage

```bash
/security-review                          # Review all recent changes
/security-review src/MagicService.cs      # Review specific file
/security-review src/Controllers          # Review specific directory
/security-review appsettings.json         # Check configuration security
```

## What This Command Does

1. **Spawns Security Reviewer Agent**: Launches specialized security analysis
2. **Secrets Detection**: Scans for hardcoded API keys, passwords, connection strings
3. **SQL Injection Prevention**: Checks for parameterized queries and unsafe SQL
4. **XSS Prevention**: Verifies HTML sanitization and React safety
5. **Authentication/Authorization**: Validates protection on sensitive endpoints
6. **Input Validation**: Ensures all user inputs are validated
7. **Dependency Scanning**: Checks for vulnerable packages
8. **Error Handling**: Verifies no sensitive data leaks in errors
9. **CORS/HTTPS**: Validates security configurations
10. **Compliance Checks**: Verifies GDPR, HIPAA readiness if applicable

## Security Review Categories

### CRITICAL (Halt Development)

Fix immediately before any commit:

**Hardcoded Secrets**
```csharp
// ❌ CRITICAL VIOLATION
private const string ApiKey = "sk-proj-xxxxx";
private const string ConnectionString = "Server=...;Password=secret123";
```

**SQL Injection Vulnerability**
```csharp
// ❌ CRITICAL VIOLATION
var sql = $"SELECT * FROM Magics WHERE Name = '{name}'";  // String interpolation
var result = await _context.Magics.FromSqlRaw(sql).FirstOrDefaultAsync();
```

**Exposed Database IDs**
```csharp
// ❌ CRITICAL VIOLATION - Exposes internal database ID
[HttpGet("{id}")]
public async Task<IActionResult> Get(int id)
{
    var magic = await _service.GetByIdAsync(id);  // Should use public ID
    return Ok(magic);
}
```

**Missing Authentication**
```csharp
// ❌ CRITICAL VIOLATION - Unprotected sensitive endpoint
[HttpDelete("{publicMagicId}")]
public async Task<IActionResult> Delete(string publicMagicId)
{
    // Anyone can call this!
    await _service.DeleteAsync(publicMagicId);
    return NoContent();
}
```

**XSS Vulnerability**
```typescript
// ❌ CRITICAL VIOLATION - Unsanitized HTML
export function MagicDisplay({ magic }: { magic: MagicDto }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: magic.description || '' }} />
  );
}
```

### HIGH (Should Fix)

Fix before merging:

**Missing Input Validation**
```csharp
// ❌ HIGH - No validation on user input
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateMagicDto dto)
{
    // No validation of dto properties
    var result = await _service.CreateAsync(dto);
    return Ok(result);
}
```

**No Error Handling on Sensitive Operations**
```csharp
// ❌ HIGH - Exception details leaked
try
{
    await _service.DeleteAsync(publicMagicId);
}
catch (Exception ex)
{
    return StatusCode(500, ex.ToString());  // Leaks stack trace
}
```

**Missing Rate Limiting on Public Endpoints**
```csharp
// ❌ HIGH - No rate limiting
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginDto dto)
{
    // Vulnerable to brute force attacks
    var token = await _authService.LoginAsync(dto);
    return Ok(token);
}
```

**Vulnerable Dependencies**
- Known CVEs in package versions
- Outdated security patches not applied
- Unpatched dependencies used

### MEDIUM (Consider Improving)

Address for security hardening:

**Loose Error Messages**
```csharp
// ⚠️ MEDIUM - Generic but could be more specific
return BadRequest("Invalid request");  // Could help identify attack patterns
```

**CORS Too Permissive**
```csharp
// ⚠️ MEDIUM - Could be more restrictive
policy.AllowAnyOrigin()  // Better to specify allowed domains
```

**Missing HSTS Headers**
```csharp
// ⚠️ MEDIUM - Should enforce HTTPS
// Missing: app.UseHsts();
```

## Security Review Examples

### Example 1: Hardcoded Secret Detection

```markdown
## Security Review Results

**Reviewed Files**: 1 file
**Security Status**: ❌ CRITICAL ISSUES FOUND

### CRITICAL Issues: 1

#### [CRITICAL] Hardcoded API Key
**File**: appsettings.json:5
**Issue**: API key committed to git repository
**Risk**: Immediate credential compromise

**Found**:
```json
{
  "OpenAI": {
    "ApiKey": "sk-proj-xxxxx"
  }
}
```

**Fix**: Remove from appsettings.json, use Azure Key Vault or environment variables

**Correct Approach**:
```csharp
// Program.cs
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{keyVaultName}.vault.azure.net/"),
    new DefaultAzureCredential());

// appsettings.json
{
  "OpenAI": {
    "ApiKey": ""  // Leave empty, populated from Key Vault
  }
}
```

**Action Items**:
1. Remove secret from git history: `git filter-branch --tree-filter ...`
2. Rotate the exposed key immediately
3. Add appsettings.json to .gitignore
4. Store secret in Azure Key Vault
5. Update code to read from Key Vault
```

### Example 2: SQL Injection Detection

```markdown
## Security Review Results

**Reviewed Files**: 1 file
**Security Status**: ❌ CRITICAL ISSUES FOUND

### CRITICAL Issues: 1

#### [CRITICAL] SQL Injection Vulnerability
**File**: Repositories/MagicRepository.cs:42
**Issue**: String interpolation used in raw SQL query
**Risk**: Complete database compromise possible

**Current Code**:
```csharp
public async Task<IEnumerable<Magic>> SearchAsync(string searchTerm)
{
    var sql = $"SELECT * FROM Magics WHERE Name LIKE '%{searchTerm}%'";
    return await _context.Magics.FromSqlRaw(sql).ToListAsync();
}
```

**Attack Example**:
```csharp
// Input: "test' OR '1'='1"
// Results in: SELECT * FROM Magics WHERE Name LIKE '%test' OR '1'='1%'
// Returns all records!
```

**Fix**: Use parameterized queries

**Correct Approach**:
```csharp
public async Task<IEnumerable<Magic>> SearchAsync(string searchTerm)
{
    // ✅ GOOD: Uses parameter, safe from injection
    return await _context.Magics
        .FromSqlRaw("SELECT * FROM Magics WHERE Name LIKE {0}", $"%{searchTerm}%")
        .ToListAsync();

    // Alternative: Use LINQ (preferred)
    return await _context.Magics
        .Where(m => m.Name.Contains(searchTerm))
        .ToListAsync();
}
```

**Action Items**:
1. Change to parameterized query immediately
2. Review all database access code for similar issues
3. Add code review check for SQL safety
4. Consider using LINQ exclusively (safer)
```

### Example 3: Authentication Missing

```markdown
## Security Review Results

**Reviewed Files**: 1 file
**Security Status**: ❌ CRITICAL ISSUES FOUND

### CRITICAL Issues: 1

#### [CRITICAL] Missing Authentication on Admin Endpoint
**File**: Controllers/AdminController.cs:15
**Issue**: Delete endpoint has no authorization check
**Risk**: Unauthorized deletion of critical data

**Current Code**:
```csharp
[HttpDelete("{publicMagicId}")]
public async Task<IActionResult> Delete(string publicMagicId)
{
    // No [Authorize] attribute!
    await _service.DeleteAsync(publicMagicId);
    return NoContent();
}
```

**Fix**: Add authorization

**Correct Approach**:
```csharp
[Authorize(Policy = "RequireAdminRole")]  // Add this
[HttpDelete("{publicMagicId}")]
public async Task<IActionResult> Delete(string publicMagicId)
{
    await _service.DeleteAsync(publicMagicId);
    return NoContent();
}
```

**Action Items**:
1. Add [Authorize] attribute
2. Audit all delete/admin endpoints
3. Define appropriate authorization policies
4. Add integration tests for authorization
```

## Wizardworks Security Standards

All code must comply with these mandatory standards:

### Secret Management

```csharp
// ✅ GOOD: Environment variables/Key Vault
public class ApiClient
{
    private readonly string _apiKey;

    public ApiClient(IConfiguration configuration)
    {
        _apiKey = configuration["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI API key not configured");
    }
}
```

### SQL Prevention

```csharp
// ✅ GOOD: Parameterized queries
return await _context.Magics
    .Where(m => m.Name == name)  // LINQ is safe
    .ToListAsync();

// ✅ GOOD: If using raw SQL, use parameters
return await _context.Magics
    .FromSqlRaw("SELECT * FROM Magics WHERE Name = {0}", name)
    .ToListAsync();
```

### XSS Prevention

```typescript
// ✅ GOOD: React escapes by default
<div>{magic.description}</div>  // Automatically escaped

// ✅ GOOD: Only use sanitization if absolutely necessary
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />

// ❌ BAD: No sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Authentication

```csharp
// ✅ GOOD: Protected endpoints
[Authorize]
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateMagicDto dto)
{
    var result = await _service.CreateAsync(dto);
    return Ok(result);
}
```

### Input Validation

```csharp
// ✅ GOOD: Validate user input
public class CreateMagicDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = null!;

    [StringLength(2000)]
    public string? Description { get; set; }
}
```

## When to Use This Command

- **Before committing code**
- **After implementing security-related features**
- **During security-focused refactoring**
- **After dependency updates**
- **Whenever handling sensitive data**
- **When adding new endpoints**
- **Before each PR**
- **During incident response**

## Security Review Checklist

Before committing:

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (proper sanitization)
- [ ] CSRF protection enabled
- [ ] Authentication on protected endpoints
- [ ] Authorization on sensitive operations
- [ ] Rate limiting on public endpoints
- [ ] Error messages don't leak sensitive data
- [ ] Dependencies scanned for vulnerabilities
- [ ] Secrets in Key Vault or environment variables
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Logging doesn't include sensitive data

## Response to Security Issues

If critical security issues found:

1. **STOP** - Do not commit or deploy
2. **Fix** - Address all CRITICAL issues
3. **Review** - Look for similar issues in codebase
4. **Verify** - Re-run security review
5. **Notify** - Inform security team if needed
6. **Document** - Update security procedures if pattern repeated

## Related Commands

- Use `/code-review` for general code quality
- Use `/tdd` to write security-focused tests
- See `rules/security.md` for full security guidelines
- See `agents/code-reviewer.md` for detailed review criteria

## As a Wizardworks Employee

Security is **NON-NEGOTIABLE** at Wizardworks. Security review is mandatory before any code merges.

**Remember**: Better to be paranoid than breached. When in doubt, ask the security team.
