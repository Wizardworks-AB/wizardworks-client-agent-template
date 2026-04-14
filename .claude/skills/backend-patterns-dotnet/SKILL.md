---
name: backend-patterns-dotnet
description: Wizardworks backend architecture patterns for .NET/C#, Entity Framework Core, API design, Docker, and TDD. As a Wizardworks employee, you must adhere to these standards.
---

# Wizardworks Backend Development Patterns (.NET/C#)

Backend architecture patterns and best practices for scalable .NET applications at Wizardworks.

**Important**: As a Wizardworks employee/agent, you are expected to follow these standards rigorously.

## Technology Stack

### Required Stack (New Projects)
- **.NET 10+** (always use latest LTS)
- **ASP.NET Core** for Web APIs
- **Entity Framework Core** (default ORM for new projects)
- **Docker** for containerization
- **xUnit** or **NUnit** for testing (xUnit preferred)
- **FluentAssertions** for test assertions

### Optional/Alternative Tools
- **Dapper** (only for high-performance scenarios where EF overhead is measured concern)
- **MediatR** (for CQRS patterns in complex domains)
- **AutoMapper** (for complex DTO mappings)

### Existing Projects - Follow Existing Patterns
**Critical**: If joining or modifying an existing project:
- **Use whatever ORM the project already uses** - if it's Dapper, use Dapper
- **Don't mix ORMs** - consistency within a project matters more than the "new project" standard
- **Follow existing naming conventions and patterns** - even if they differ from this guide
- The patterns in this document are for **new projects** or **new modules in greenfield areas**

## Architecture Pattern: Controller-Service-Repository

Wizardworks uses a strict layered architecture:

```
┌─────────────────────────────────────┐
│        Controller Layer             │  ← HTTP concerns, routing, validation
├─────────────────────────────────────┤
│         Service Layer               │  ← Business logic, orchestration
├─────────────────────────────────────┤
│       Repository Layer              │  ← Data access, persistence
├─────────────────────────────────────┤
│     Entity Framework Core           │  ← ORM
└─────────────────────────────────────┘
```

### Layer Responsibilities

**Controllers**:
- Handle HTTP requests/responses
- Input validation (Data Annotations, FluentValidation)
- Route to appropriate service methods
- Return appropriate status codes
- NO business logic

**Services**:
- Contain all business logic
- Orchestrate operations across repositories
- Transaction management
- Domain validation
- NO direct database access

**Repositories**:
- Abstract data access
- CRUD operations
- Complex queries
- NO business logic

## Entity Framework Core Patterns

### DbContext Configuration

```csharp
// ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Magic> Magics { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure entity relationships and constraints
        modelBuilder.Entity<Magic>(entity =>
        {
            entity.HasKey(e => e.MagicId);
            entity.HasIndex(e => e.PublicMagicId).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });
    }
}
```

### Entity Models

```csharp
// Magic.cs (Database Entity)
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("Magics")]
public class Magic
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int MagicId { get; set; }

    [Required]
    [StringLength(50)]
    public string PublicMagicId { get; set; } = null!;

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(2000)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; } = true;
}
```

### DTO Pattern with Public IDs

Wizardworks ALWAYS exposes Public IDs externally, NEVER internal database IDs.

```csharp
// MagicDto.cs (External representation)
public class MagicDto
{
    public string PublicMagicId { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}

// CreateMagicDto.cs (Input DTO)
using System.ComponentModel.DataAnnotations;

public class CreateMagicDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = null!;

    [StringLength(2000)]
    public string? Description { get; set; }
}

// UpdateMagicDto.cs (Update DTO)
public class UpdateMagicDto
{
    [StringLength(200, MinimumLength = 1)]
    public string? Name { get; set; }

    [StringLength(2000)]
    public string? Description { get; set; }

    public bool? IsActive { get; set; }
}
```

### Repository Pattern with EF Core

```csharp
// IMagicRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IMagicRepository
{
    Task<IEnumerable<Magic>> GetAllAsync();
    Task<Magic?> GetByPublicIdAsync(string publicMagicId);
    Task<Magic?> GetByIdAsync(int magicId);
    Task<Magic> CreateAsync(Magic magic);
    Task<Magic> UpdateAsync(Magic magic);
    Task DeleteAsync(int magicId);
    Task<bool> ExistsAsync(string publicMagicId);
}

// MagicRepository.cs
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class MagicRepository : IMagicRepository
{
    private readonly ApplicationDbContext _context;

    public MagicRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Magic>> GetAllAsync()
    {
        return await _context.Magics
            .Where(m => m.IsActive)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<Magic?> GetByPublicIdAsync(string publicMagicId)
    {
        return await _context.Magics
            .FirstOrDefaultAsync(m => m.PublicMagicId == publicMagicId && m.IsActive);
    }

    public async Task<Magic?> GetByIdAsync(int magicId)
    {
        return await _context.Magics
            .FirstOrDefaultAsync(m => m.MagicId == magicId);
    }

    public async Task<Magic> CreateAsync(Magic magic)
    {
        _context.Magics.Add(magic);
        await _context.SaveChangesAsync();
        return magic;
    }

    public async Task<Magic> UpdateAsync(Magic magic)
    {
        magic.UpdatedAt = DateTime.UtcNow;
        _context.Magics.Update(magic);
        await _context.SaveChangesAsync();
        return magic;
    }

    public async Task DeleteAsync(int magicId)
    {
        var magic = await GetByIdAsync(magicId);
        if (magic != null)
        {
            // Soft delete by default
            magic.IsActive = false;
            magic.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(string publicMagicId)
    {
        return await _context.Magics
            .AnyAsync(m => m.PublicMagicId == publicMagicId);
    }
}
```

### Service Layer Pattern

```csharp
// IMagicService.cs
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IMagicService
{
    Task<IEnumerable<MagicDto>> GetAllAsync();
    Task<MagicDto?> GetByPublicIdAsync(string publicMagicId);
    Task<MagicDto> CreateAsync(CreateMagicDto dto);
    Task<MagicDto?> UpdateAsync(string publicMagicId, UpdateMagicDto dto);
    Task<bool> DeleteAsync(string publicMagicId);
}

// MagicService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class MagicService : IMagicService
{
    private readonly IMagicRepository _magicRepository;

    public MagicService(IMagicRepository magicRepository)
    {
        _magicRepository = magicRepository;
    }

    public async Task<IEnumerable<MagicDto>> GetAllAsync()
    {
        var magics = await _magicRepository.GetAllAsync();
        return magics.Select(MapToDto);
    }

    public async Task<MagicDto?> GetByPublicIdAsync(string publicMagicId)
    {
        var magic = await _magicRepository.GetByPublicIdAsync(publicMagicId);
        return magic != null ? MapToDto(magic) : null;
    }

    public async Task<MagicDto> CreateAsync(CreateMagicDto dto)
    {
        var magic = new Magic
        {
            PublicMagicId = GeneratePublicId(),
            Name = dto.Name,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _magicRepository.CreateAsync(magic);
        return MapToDto(created);
    }

    public async Task<MagicDto?> UpdateAsync(string publicMagicId, UpdateMagicDto dto)
    {
        var magic = await _magicRepository.GetByPublicIdAsync(publicMagicId);
        if (magic == null) return null;

        if (dto.Name != null) magic.Name = dto.Name;
        if (dto.Description != null) magic.Description = dto.Description;
        if (dto.IsActive.HasValue) magic.IsActive = dto.IsActive.Value;

        var updated = await _magicRepository.UpdateAsync(magic);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(string publicMagicId)
    {
        var magic = await _magicRepository.GetByPublicIdAsync(publicMagicId);
        if (magic == null) return false;

        await _magicRepository.DeleteAsync(magic.MagicId);
        return true;
    }

    private static MagicDto MapToDto(Magic magic)
    {
        return new MagicDto
        {
            PublicMagicId = magic.PublicMagicId,
            Name = magic.Name,
            Description = magic.Description,
            CreatedAt = magic.CreatedAt,
            IsActive = magic.IsActive
        };
    }

    private static string GeneratePublicId()
    {
        // Use a more robust public ID generator in production
        // Options: NanoId, ULID, ShortGuid
        return Guid.NewGuid().ToString("N").Substring(0, 12);
    }
}
```

### Controller Pattern

```csharp
// MagicController.cs
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class MagicController : ControllerBase
{
    private readonly IMagicService _magicService;

    public MagicController(IMagicService magicService)
    {
        _magicService = magicService;
    }

    /// <summary>
    /// Get all active magic items
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<MagicDto>), 200)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> GetAllAsync()
    {
        try
        {
            var result = await _magicService.GetAllAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            // Log the exception (use ILogger in production)
            return StatusCode(500, new { error = "An error occurred while retrieving magic items" });
        }
    }

    /// <summary>
    /// Get magic item by public ID
    /// </summary>
    [HttpGet("{publicMagicId}")]
    [ProducesResponseType(typeof(MagicDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> GetByPublicIdAsync(string publicMagicId)
    {
        try
        {
            var result = await _magicService.GetByPublicIdAsync(publicMagicId);
            if (result == null)
            {
                return NotFound(new { error = "Magic item not found" });
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving the magic item" });
        }
    }

    /// <summary>
    /// Create a new magic item
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(MagicDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> CreateAsync([FromBody] CreateMagicDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _magicService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetByPublicIdAsync), new { publicMagicId = result.PublicMagicId }, result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while creating the magic item" });
        }
    }

    /// <summary>
    /// Update an existing magic item
    /// </summary>
    [HttpPut("{publicMagicId}")]
    [ProducesResponseType(typeof(MagicDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> UpdateAsync(string publicMagicId, [FromBody] UpdateMagicDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _magicService.UpdateAsync(publicMagicId, dto);
            if (result == null)
            {
                return NotFound(new { error = "Magic item not found" });
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while updating the magic item" });
        }
    }

    /// <summary>
    /// Delete a magic item (soft delete)
    /// </summary>
    [HttpDelete("{publicMagicId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> DeleteAsync(string publicMagicId)
    {
        try
        {
            var deleted = await _magicService.DeleteAsync(publicMagicId);
            if (!deleted)
            {
                return NotFound(new { error = "Magic item not found" });
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while deleting the magic item" });
        }
    }
}
```

## Exception Handling

Wizardworks uses a layered exception handling approach: custom exceptions for domain errors, global middleware for consistency, and Application Insights for observability.

### Custom Exception Types

```csharp
// Exceptions/NotFoundException.cs
public class NotFoundException : Exception
{
    public string ResourceType { get; }
    public string ResourceId { get; }

    public NotFoundException(string resourceType, string resourceId)
        : base($"{resourceType} with ID '{resourceId}' was not found.")
    {
        ResourceType = resourceType;
        ResourceId = resourceId;
    }
}

// Exceptions/ValidationException.cs
public class ValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(IDictionary<string, string[]> errors)
        : base("One or more validation errors occurred.")
    {
        Errors = errors;
    }

    public ValidationException(string field, string message)
        : base(message)
    {
        Errors = new Dictionary<string, string[]>
        {
            { field, new[] { message } }
        };
    }
}

// Exceptions/BusinessRuleException.cs
public class BusinessRuleException : Exception
{
    public string RuleCode { get; }

    public BusinessRuleException(string ruleCode, string message)
        : base(message)
    {
        RuleCode = ruleCode;
    }
}
```

### Standardized Error Response

```csharp
// Models/ErrorResponse.cs
public class ErrorResponse
{
    public string Error { get; set; } = null!;
    public string? Code { get; set; }
    public IDictionary<string, string[]>? Details { get; set; }
    public string? TraceId { get; set; }

    public static ErrorResponse FromException(Exception ex, string? traceId = null)
    {
        return new ErrorResponse
        {
            Error = ex.Message,
            TraceId = traceId
        };
    }
}
```

### Global Exception Handling Middleware

```csharp
// Middleware/GlobalExceptionMiddleware.cs
using Microsoft.ApplicationInsights;
using System.Net;
using System.Text.Json;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly TelemetryClient _telemetryClient;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        TelemetryClient telemetryClient)
    {
        _next = next;
        _logger = logger;
        _telemetryClient = telemetryClient;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;

        // Log to Application Insights
        _telemetryClient.TrackException(exception, new Dictionary<string, string>
        {
            { "TraceId", traceId },
            { "Path", context.Request.Path },
            { "Method", context.Request.Method }
        });

        var (statusCode, response) = exception switch
        {
            NotFoundException notFound => (
                HttpStatusCode.NotFound,
                new ErrorResponse
                {
                    Error = notFound.Message,
                    Code = "NOT_FOUND",
                    TraceId = traceId
                }
            ),
            ValidationException validation => (
                HttpStatusCode.BadRequest,
                new ErrorResponse
                {
                    Error = validation.Message,
                    Code = "VALIDATION_ERROR",
                    Details = validation.Errors,
                    TraceId = traceId
                }
            ),
            BusinessRuleException business => (
                HttpStatusCode.UnprocessableEntity,
                new ErrorResponse
                {
                    Error = business.Message,
                    Code = business.RuleCode,
                    TraceId = traceId
                }
            ),
            UnauthorizedAccessException => (
                HttpStatusCode.Unauthorized,
                new ErrorResponse
                {
                    Error = "Unauthorized access.",
                    Code = "UNAUTHORIZED",
                    TraceId = traceId
                }
            ),
            _ => (
                HttpStatusCode.InternalServerError,
                new ErrorResponse
                {
                    Error = "An unexpected error occurred. Please try again later.",
                    Code = "INTERNAL_ERROR",
                    TraceId = traceId
                }
            )
        };

        // Log based on severity
        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception occurred. TraceId: {TraceId}", traceId);
        }
        else
        {
            _logger.LogWarning(exception, "Handled exception occurred. TraceId: {TraceId}", traceId);
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
```

### Controller Exception Handling Pattern

With global middleware in place, controllers can throw exceptions directly:

```csharp
// MagicController.cs - Simplified with global exception handling
[ApiController]
[Route("api/[controller]")]
public class MagicController : ControllerBase
{
    private readonly IMagicService _magicService;
    private readonly ILogger<MagicController> _logger;

    public MagicController(IMagicService magicService, ILogger<MagicController> logger)
    {
        _magicService = magicService;
        _logger = logger;
    }

    [HttpGet("{publicMagicId}")]
    public async Task<ActionResult<MagicDto>> GetByPublicIdAsync(string publicMagicId)
    {
        var result = await _magicService.GetByPublicIdAsync(publicMagicId);

        if (result == null)
        {
            throw new NotFoundException("Magic", publicMagicId);
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<MagicDto>> CreateAsync([FromBody] CreateMagicDto dto)
    {
        // Validation happens via model binding and FluentValidation
        var result = await _magicService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetByPublicIdAsync), new { publicMagicId = result.PublicMagicId }, result);
    }
}
```

### Service Layer Exception Usage

```csharp
// MagicService.cs - Throwing domain exceptions
public class MagicService : IMagicService
{
    public async Task<MagicDto> CreateAsync(CreateMagicDto dto)
    {
        // Business rule validation
        if (await _magicRepository.ExistsByNameAsync(dto.Name))
        {
            throw new BusinessRuleException("DUPLICATE_NAME", $"A magic item with name '{dto.Name}' already exists.");
        }

        var magic = new Magic
        {
            PublicMagicId = GeneratePublicId(),
            Name = dto.Name,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _magicRepository.CreateAsync(magic);
        return MapToDto(created);
    }
}
```

### Application Insights Configuration

```csharp
// Program.cs - Add Application Insights
var builder = WebApplication.CreateBuilder(args);

// Add Application Insights telemetry
builder.Services.AddApplicationInsightsTelemetry();

// ... other services ...

var app = builder.Build();

// Add global exception middleware early in the pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();

// ... rest of middleware pipeline ...
```

### Exception Handling Best Practices

1. **Controller Layer**: Let exceptions propagate to global middleware
2. **Service Layer**: Throw custom exceptions for business rule violations
3. **Repository Layer**: Let database exceptions bubble up (middleware handles them)
4. **Always include TraceId**: Enables correlation in Application Insights
5. **Don't swallow exceptions**: Log and rethrow or let middleware handle
6. **Use specific exception types**: Enables appropriate HTTP status codes

## Dependency Injection Setup

```csharp
// Program.cs (.NET 10+)
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Entity Framework Core
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptions => sqlServerOptions.EnableRetryOnFailure()
    )
);

// Register repositories
builder.Services.AddScoped<IMagicRepository, MagicRepository>();

// Register services
builder.Services.AddScoped<IMagicService, MagicService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

## Docker Configuration

### Dockerfile

```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["YourProject.csproj", "./"]
RUN dotnet restore "YourProject.csproj"
COPY . .
RUN dotnet build "YourProject.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "YourProject.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "YourProject.dll"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5000:80"
      - "5001:443"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Server=db;Database=WizardworksDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True
    depends_on:
      - db
    networks:
      - wizardworks-network

  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Password123
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql
    networks:
      - wizardworks-network

volumes:
  sqlserver-data:

networks:
  wizardworks-network:
    driver: bridge
```

## EF Core Migrations

```bash
# Create initial migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# Create new migration after model changes
dotnet ef migrations add AddMagicDescriptionField

# Rollback migration
dotnet ef database update PreviousMigrationName

# Generate SQL script
dotnet ef migrations script
```

## Testing Standards (TDD)

### Unit Test Example (xUnit + FluentAssertions)

```csharp
// MagicServiceTests.cs
using FluentAssertions;
using Moq;
using Xunit;
using System.Threading.Tasks;

public class MagicServiceTests
{
    private readonly Mock<IMagicRepository> _mockRepository;
    private readonly MagicService _service;

    public MagicServiceTests()
    {
        _mockRepository = new Mock<IMagicRepository>();
        _service = new MagicService(_mockRepository.Object);
    }

    [Fact]
    public async Task CreateAsync_Should_GeneratePublicId_And_CreateMagic()
    {
        // Arrange
        var createDto = new CreateMagicDto
        {
            Name = "Test Magic",
            Description = "Test Description"
        };

        _mockRepository
            .Setup(r => r.CreateAsync(It.IsAny<Magic>()))
            .ReturnsAsync((Magic m) => m);

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.PublicMagicId.Should().NotBeNullOrEmpty();
        result.Name.Should().Be("Test Magic");
        result.Description.Should().Be("Test Description");

        _mockRepository.Verify(r => r.CreateAsync(It.Is<Magic>(m =>
            m.Name == createDto.Name &&
            m.Description == createDto.Description &&
            !string.IsNullOrEmpty(m.PublicMagicId)
        )), Times.Once);
    }

    [Fact]
    public async Task GetByPublicIdAsync_Should_ReturnNull_When_NotFound()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.GetByPublicIdAsync(It.IsAny<string>()))
            .ReturnsAsync((Magic?)null);

        // Act
        var result = await _service.GetByPublicIdAsync("nonexistent");

        // Assert
        result.Should().BeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public async Task GetByPublicIdAsync_Should_Handle_InvalidInput(string? publicId)
    {
        // Arrange & Act
        var result = await _service.GetByPublicIdAsync(publicId!);

        // Assert
        result.Should().BeNull();
    }
}
```

### Integration Test Example

```csharp
// MagicControllerIntegrationTests.cs
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

public class MagicControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public MagicControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Replace with in-memory database for testing
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                });
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Post_CreateMagic_Returns_Created()
    {
        // Arrange
        var createDto = new CreateMagicDto
        {
            Name = "Integration Test Magic",
            Description = "Created in integration test"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/magic", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<MagicDto>();
        result.Should().NotBeNull();
        result!.Name.Should().Be(createDto.Name);
        result.PublicMagicId.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Get_RetrieveMagic_Returns_Ok()
    {
        // Arrange - First create a magic item
        var createDto = new CreateMagicDto { Name = "Test", Description = "Test" };
        var createResponse = await _client.PostAsJsonAsync("/api/magic", createDto);
        var created = await createResponse.Content.ReadFromJsonAsync<MagicDto>();

        // Act
        var response = await _client.GetAsync($"/api/magic/{created!.PublicMagicId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<MagicDto>();
        result.Should().NotBeNull();
        result!.PublicMagicId.Should().Be(created.PublicMagicId);
    }
}
```

## Performance Considerations

### When to Use Dapper

Use Dapper for:
- Complex queries with significant performance requirements
- Bulk operations
- Read-heavy scenarios where EF overhead is measured and problematic

```csharp
// Example Dapper usage (optional)
using Dapper;
using System.Data;

public class MagicDapperRepository : IMagicRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public MagicDapperRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Magic>> GetAllAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT MagicId, PublicMagicId, Name, Description, CreatedAt, UpdatedAt, IsActive
            FROM Magics
            WHERE IsActive = 1
            ORDER BY CreatedAt DESC";

        return await connection.QueryAsync<Magic>(sql);
    }
}
```

### Async/Await Best Practices

```csharp
// Use ConfigureAwait(false) in library code
public async Task<Magic?> GetByIdAsync(int magicId)
{
    return await _context.Magics
        .FirstOrDefaultAsync(m => m.MagicId == magicId)
        .ConfigureAwait(false);
}
```

## Wizardworks Best Practices Summary

1. **Always use Controller-Service-Repository pattern**
2. **Entity Framework Core is default, Dapper is optional**
3. **Always expose Public IDs externally, never database IDs**
4. **Use DTOs for all API inputs/outputs**
5. **Write tests first (TDD)**
6. **Use Docker for local development**
7. **Use EF migrations for database schema changes**
8. **Interface-based dependency injection**
9. **Soft delete by default**
10. **Comprehensive error handling**

**Remember**: These patterns enable rapid development, easy testing, and confident deployment. Follow them rigorously as a Wizardworks employee.
