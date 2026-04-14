# Wizardworks Security Guidelines

**MANDATORY**: Security is non-negotiable at Wizardworks. All code must pass security review.

## Pre-Commit Security Checklist

Before ANY commit:

- [ ] No hardcoded secrets (API keys, passwords, tokens, connection strings)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries with EF Core)
- [ ] XSS prevention (sanitized HTML output)
- [ ] CSRF protection enabled
- [ ] Authentication/authorization implemented and tested
- [ ] Rate limiting on all public endpoints
- [ ] Error messages don't leak sensitive data
- [ ] Dependencies scanned for vulnerabilities
- [ ] Secrets stored in Azure Key Vault or environment variables

## Secret Management

### NEVER: Hardcoded Secrets

```csharp
// ❌ CRITICAL SECURITY VIOLATION
public class ApiClient
{
    private const string ApiKey = "sk-proj-xxxxx";  // NEVER DO THIS
    private const string ConnectionString = "Server=...;Password=secret123";  // NEVER DO THIS
}
```

```typescript
// ❌ CRITICAL SECURITY VIOLATION
const apiKey = "sk-proj-xxxxx";  // NEVER DO THIS
const dbPassword = "secret123";   // NEVER DO THIS
```

### ALWAYS: Environment Variables or Azure Key Vault

**For .NET:**
```csharp
// ✅ GOOD: Use configuration
public class ApiClient
{
    private readonly string _apiKey;

    public ApiClient(IConfiguration configuration)
    {
        _apiKey = configuration["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI API key not configured");
    }
}

// ✅ GOOD: Azure Key Vault integration
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{keyVaultName}.vault.azure.net/"),
    new DefaultAzureCredential());

// appsettings.json should NOT contain secrets
{
  "OpenAI": {
    "ApiKey": ""  // Leave empty, use environment variable or Key Vault
  },
  "ConnectionStrings": {
    "DefaultConnection": ""  // Never commit actual connection string
  }
}

// Use User Secrets for local development
dotnet user-secrets set "OpenAI:ApiKey" "your-key-here"
```

**For TypeScript:**
```typescript
// ✅ GOOD: Use environment variables
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('VITE_OPENAI_API_KEY not configured');
}

// .env file should be in .gitignore
// .env.example should show required keys (without values)
```

### Environment Variable Security

```bash
# .env.example (committed to git)
VITE_API_BASE_URL=
VITE_APP_NAME=
# Never put actual values here

# .env (in .gitignore, never committed)
VITE_API_BASE_URL=https://api.example.com
VITE_APP_NAME=Wizardworks Magic

# Azure Key Vault (production)
# All secrets stored in Key Vault, referenced in configuration
```

## SQL Injection Prevention

### ALWAYS: Use Parameterized Queries

**For Entity Framework Core:**
```csharp
// ✅ GOOD: EF Core parameterizes automatically
public async Task<Magic?> GetByNameAsync(string name)
{
    return await _context.Magics
        .FirstOrDefaultAsync(m => m.Name == name);  // Safe, parameterized
}

// ✅ GOOD: Raw SQL with parameters
public async Task<IEnumerable<Magic>> SearchAsync(string searchTerm)
{
    return await _context.Magics
        .FromSqlRaw("SELECT * FROM Magics WHERE Name LIKE {0}", $"%{searchTerm}%")
        .ToListAsync();
}

// ❌ CRITICAL: String concatenation (SQL INJECTION RISK)
public async Task<Magic?> GetByNameUnsafe(string name)
{
    var sql = $"SELECT * FROM Magics WHERE Name = '{name}'";  // DANGEROUS
    return await _context.Magics.FromSqlRaw(sql).FirstOrDefaultAsync();
}
```

**For Dapper (if used):**
```csharp
// ✅ GOOD: Dapper with parameters
public async Task<Magic?> GetByNameAsync(string name)
{
    const string sql = "SELECT * FROM Magics WHERE Name = @Name";
    using var connection = _connectionFactory.CreateConnection();
    return await connection.QueryFirstOrDefaultAsync<Magic>(sql, new { Name = name });
}

// ❌ CRITICAL: String interpolation (SQL INJECTION RISK)
public async Task<Magic?> GetByNameUnsafe(string name)
{
    var sql = $"SELECT * FROM Magics WHERE Name = '{name}'";  // DANGEROUS
    using var connection = _connectionFactory.CreateConnection();
    return await connection.QueryFirstOrDefaultAsync<Magic>(sql);
}
```

## XSS Prevention

### TypeScript/React

```typescript
// ✅ GOOD: React escapes by default
export function MagicDisplay({ magic }: { magic: MagicDto }) {
  return (
    <div>
      <h2>{magic.name}</h2>  {/* Automatically escaped */}
      <p>{magic.description}</p>  {/* Safe */}
    </div>
  );
}

// ⚠️ DANGEROUS: dangerouslySetInnerHTML
export function MagicDisplayWithHtml({ magic }: { magic: MagicDto }) {
  // Only use if you MUST render HTML and have sanitized it
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(magic.description || '')  // Sanitize first!
      }}
    />
  );
}

// ❌ CRITICAL: Unsanitized HTML
export function UnsafeMagicDisplay({ magic }: { magic: MagicDto }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: magic.description || '' }} />  // XSS RISK
  );
}
```

### .NET (Razor/Blazor)

```razor
@* ✅ GOOD: Razor escapes by default *@
<h2>@Model.Magic.Name</h2>
<p>@Model.Magic.Description</p>

@* ❌ DANGEROUS: @Html.Raw *@
<div>
    @Html.Raw(Model.Magic.Description) @* Only if you've sanitized it first! *@
</div>
```

## Input Validation

### ALWAYS: Validate at API Boundaries

**For .NET:**
```csharp
// ✅ GOOD: Data annotations
public class CreateMagicDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    [RegularExpression(@"^[a-zA-Z0-9\s\-]+$", ErrorMessage = "Invalid characters")]
    public string Name { get; set; } = null!;

    [StringLength(2000)]
    public string? Description { get; set; }

    [EmailAddress]
    public string? ContactEmail { get; set; }
}

// ✅ GOOD: FluentValidation (alternative)
public class CreateMagicDtoValidator : AbstractValidator<CreateMagicDto>
{
    public CreateMagicDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200)
            .Matches(@"^[a-zA-Z0-9\s\-]+$");

        RuleFor(x => x.Description)
            .MaximumLength(2000);
    }
}

// ✅ GOOD: Controller validation check
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateMagicDto dto)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    var result = await _service.CreateAsync(dto);
    return CreatedAtAction(nameof(Get), new { publicMagicId = result.PublicMagicId }, result);
}
```

**For TypeScript:**
```typescript
// ✅ GOOD: Zod validation
import { z } from 'zod';

const createMagicSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name too long')
    .regex(/^[a-zA-Z0-9\s\-]+$/, 'Invalid characters'),
  description: z.string().max(2000).optional(),
  contactEmail: z.string().email().optional(),
});

export type CreateMagicDto = z.infer<typeof createMagicSchema>;

// Validate before sending to API
export async function createMagic(data: unknown) {
  const validated = createMagicSchema.parse(data);  // Throws if invalid
  return apiClient.post('/api/magic', validated);
}
```

## Authentication & Authorization

### .NET

```csharp
// ✅ GOOD: JWT authentication setup
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = configuration["AzureAd:Authority"];
        options.Audience = configuration["AzureAd:ClientId"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
        };
    });

// ✅ GOOD: Authorization policies
services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy =>
        policy.RequireRole("Admin"));

    options.AddPolicy("RequireUserOrAdmin", policy =>
        policy.RequireRole("User", "Admin"));
});

// ✅ GOOD: Protect endpoints
[Authorize(Policy = "RequireAdminRole")]
[HttpDelete("{publicMagicId}")]
public async Task<IActionResult> Delete(string publicMagicId)
{
    await _service.DeleteAsync(publicMagicId);
    return NoContent();
}

// ❌ CRITICAL: No authorization on sensitive endpoint
[HttpDelete("{publicMagicId}")]  // Anyone can delete!
public async Task<IActionResult> Delete(string publicMagicId)
{
    await _service.DeleteAsync(publicMagicId);
    return NoContent();
}
```

### TypeScript/React

```typescript
// ✅ GOOD: Send JWT token with requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ GOOD: Protected route
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}
```

## Rate Limiting

### .NET

```csharp
// ✅ GOOD: ASP.NET Core rate limiting
using Microsoft.AspNetCore.RateLimiting;

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));
});

app.UseRateLimiter();

// Apply to specific endpoints
[EnableRateLimiting("fixed")]
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateMagicDto dto) { }
```

## Error Handling Security

### NEVER: Leak Sensitive Information

```csharp
// ❌ CRITICAL: Exposing sensitive error details
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateMagicDto dto)
{
    try
    {
        var result = await _service.CreateAsync(dto);
        return Ok(result);
    }
    catch (Exception ex)
    {
        // Exposes stack trace, connection strings, etc.
        return StatusCode(500, ex.ToString());  // NEVER DO THIS
    }
}

// ✅ GOOD: Generic error message, log details internally
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateMagicDto dto)
{
    try
    {
        var result = await _service.CreateAsync(dto);
        return Ok(result);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to create magic item");
        return StatusCode(500, new { error = "An error occurred while creating the magic item" });
    }
}
```

```typescript
// ✅ GOOD: Generic error messages to user
export async function createMagic(dto: CreateMagicDto) {
  try {
    return await apiClient.post('/api/magic', dto);
  } catch (error) {
    console.error('Failed to create magic:', error);  // Log full error
    throw new Error('Failed to create magic item');   // Generic message to user
  }
}
```

## Dependency Security

### Regular Scanning

```bash
# .NET: Scan for vulnerable packages
dotnet list package --vulnerable --include-transitive

# TypeScript: Scan with npm/pnpm
pnpm audit
pnpm audit fix

# Update dependencies regularly
dotnet outdated
pnpm outdated
```

### Lock Files

```bash
# ✅ GOOD: Commit lock files
# .NET
packages.lock.json  # Commit this

# TypeScript
pnpm-lock.yaml  # Commit this
package-lock.json  # Commit this
```

## HTTPS/TLS

```csharp
// ✅ GOOD: Enforce HTTPS
app.UseHttpsRedirection();

// ✅ GOOD: HSTS headers
app.UseHsts();

// appsettings.json
{
  "Kestrel": {
    "Endpoints": {
      "Https": {
        "Url": "https://*:443"
      }
    }
  }
}
```

## CORS Security

```csharp
// ✅ GOOD: Specific CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://app.wizardworks.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");

// ❌ DANGEROUS: Allow all origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()  // DANGEROUS
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

## Security Response Protocol

If security issue found:

1. **STOP** immediately
2. Use **security-reviewer** agent
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets immediately
5. Review entire codebase for similar issues
6. Notify security team
7. Update security documentation

## Security Checklist Summary

- [ ] No hardcoded secrets
- [ ] Azure Key Vault for production secrets
- [ ] User Secrets for local development
- [ ] Parameterized queries (EF Core/Dapper)
- [ ] Input validation on all endpoints
- [ ] Authentication/authorization on protected endpoints
- [ ] Rate limiting on public endpoints
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Generic error messages (no sensitive data leaks)
- [ ] Dependencies scanned for vulnerabilities
- [ ] XSS protection (sanitization if needed)
- [ ] CSRF tokens (for forms)

**Remember**: Security is everyone's responsibility at Wizardworks. Never compromise on security. When in doubt, consult the security team.
