# Wizardworks Coding Style Standards

**MANDATORY**: All Wizardworks employees and AI agents must follow these coding standards rigorously.

Wizardworks follows **Microsoft's official naming conventions** for .NET and industry-standard conventions for TypeScript/React. See [Microsoft .NET Naming Guidelines](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/naming-guidelines) for the authoritative reference.

## Universal Principles

### 1. Readability First
- Code is read more than written
- Clear, descriptive variable and function names
- Self-documenting code preferred over comments
- Consistent formatting throughout codebase

### 2. KISS (Keep It Simple, Stupid)
- Simplest solution that works
- Avoid over-engineering
- No premature optimization
- Easy to understand > clever code

### 3. DRY (Don't Repeat Yourself)
- Extract common logic into functions/methods
- Create reusable components
- Share utilities across modules
- Avoid copy-paste programming

### 4. YAGNI (You Aren't Gonna Need It)
- Don't build features before they're needed
- Add complexity only when required
- Start simple, refactor when needed

## .NET/C# Standards

Wizardworks follows [Microsoft's .NET Naming Guidelines](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/naming-guidelines).

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Classes, Structs, Records | PascalCase | `MagicService`, `CustomerDto` |
| Interfaces | PascalCase with 'I' prefix | `IMagicService`, `IRepository<T>` |
| Methods | PascalCase | `GetByPublicIdAsync`, `CreateMagic` |
| Properties | PascalCase | `PublicMagicId`, `CreatedAt` |
| Events | PascalCase | `MagicCreated`, `OnPropertyChanged` |
| Public Fields | PascalCase | `MaxRetries` (prefer properties) |
| Private Fields | camelCase with underscore | `_magicRepository`, `_logger` |
| Parameters | camelCase | `publicMagicId`, `createDto` |
| Local Variables | camelCase | `magicEntity`, `result` |
| Constants | PascalCase | `MaxRetryCount`, `DefaultTimeout` |
| Namespaces | PascalCase | `Wizardworks.Api.Magic` |
| Enums | PascalCase (singular) | `MagicType`, `OrderStatus` |
| Enum Values | PascalCase | `MagicType.Fire`, `OrderStatus.Pending` |
| Type Parameters | PascalCase with 'T' prefix | `TEntity`, `TResult` |
| Async Methods | PascalCase with 'Async' suffix | `GetByIdAsync`, `CreateAsync` |

```csharp
// ✅ GOOD: Following Microsoft naming conventions
public class MagicService : IMagicService
{
    private readonly IMagicRepository _magicRepository;
    private readonly ILogger<MagicService> _logger;

    public string PublicMagicId { get; set; }

    public async Task<MagicDto> GetByPublicIdAsync(string publicMagicId)
    {
        var magicEntity = await _magicRepository.GetByPublicIdAsync(publicMagicId);
        return MapToDto(magicEntity);
    }
}

// ✅ GOOD: Interfaces start with 'I'
public interface IMagicService { }
public interface IMagicRepository { }

// ✅ GOOD: Generic type parameters start with 'T'
public interface IRepository<TEntity> where TEntity : class { }

// ✅ GOOD: Async methods end with 'Async'
public async Task<Magic> GetByIdAsync(int id) { }

// ❌ BAD: Violates Microsoft conventions
public class magicservice { }  // Should be PascalCase
public string publicmagicid { get; set; }  // Should be PascalCase
public async Task<Magic> GetById(int id) { }  // Missing Async suffix
private IMagicRepository magicRepository;  // Should be _magicRepository
```

### Namespace Conventions

Follow the pattern: `<Company>.<Product>.<Feature>.<Subfeature>`

```csharp
// ✅ GOOD: Wizardworks namespace conventions
namespace Wizardworks.Api.Magic.Controllers { }
namespace Wizardworks.Api.Magic.Services { }
namespace Wizardworks.Common.Models { }
namespace Wizardworks.Common.Repositories { }

// ❌ BAD: Unclear or inconsistent namespaces
namespace Magic { }  // Too generic
namespace wizardworks.api { }  // Wrong casing
```

### File Organization

```csharp
// ✅ GOOD: One class per file, file name matches class name
// MagicService.cs
public class MagicService : IMagicService
{
    // Implementation
}

// ✅ GOOD: Organize by feature, not by type
/Features
  /Magic
    /Controllers
      MagicController.cs
    /Services
      MagicService.cs
      IMagicService.cs
    /Repositories
      MagicRepository.cs
      IMagicRepository.cs
    /DTOs
      MagicDto.cs
      CreateMagicDto.cs
      UpdateMagicDto.cs
    /Models
      Magic.cs

// ❌ BAD: Organize by type only
/Controllers
  MagicController.cs
  UserController.cs
/Services
  MagicService.cs
  UserService.cs
```

### Code Quality

```csharp
// ✅ GOOD: Small, focused methods (<50 lines)
public async Task<MagicDto> CreateAsync(CreateMagicDto dto)
{
    var magic = MapToEntity(dto);
    magic.PublicMagicId = GeneratePublicId();
    magic.CreatedAt = DateTime.UtcNow;

    var created = await _repository.CreateAsync(magic);
    return MapToDto(created);
}

// ❌ BAD: Large methods (>50 lines)
public async Task<MagicDto> CreateAsync(CreateMagicDto dto)
{
    // 100+ lines of code doing too many things
}

// ✅ GOOD: Early returns to reduce nesting
public async Task<MagicDto?> GetByPublicIdAsync(string publicMagicId)
{
    if (string.IsNullOrEmpty(publicMagicId))
        return null;

    var magic = await _repository.GetByPublicIdAsync(publicMagicId);
    if (magic == null)
        return null;

    return MapToDto(magic);
}

// ❌ BAD: Deep nesting
public async Task<MagicDto?> GetByPublicIdAsync(string publicMagicId)
{
    if (!string.IsNullOrEmpty(publicMagicId))
    {
        var magic = await _repository.GetByPublicIdAsync(publicMagicId);
        if (magic != null)
        {
            return MapToDto(magic);
        }
    }
    return null;
}
```

### Async/Await Best Practices

```csharp
// ✅ GOOD: Use async/await consistently
public async Task<IEnumerable<MagicDto>> GetAllAsync()
{
    var magics = await _repository.GetAllAsync();
    return magics.Select(MapToDto);
}

// ✅ GOOD: ConfigureAwait(false) in library code
public async Task<Magic?> GetByIdAsync(int id)
{
    return await _repository.GetByIdAsync(id).ConfigureAwait(false);
}

// ❌ BAD: Blocking async calls
public MagicDto Create(CreateMagicDto dto)
{
    return CreateAsync(dto).Result;  // DON'T DO THIS
}

// ❌ BAD: Async void (except event handlers)
public async void ProcessMagic() { }  // DON'T DO THIS
```

### Error Handling

```csharp
// ✅ GOOD: Proper exception handling
public async Task<MagicDto> CreateAsync(CreateMagicDto dto)
{
    try
    {
        var magic = MapToEntity(dto);
        var created = await _repository.CreateAsync(magic);
        return MapToDto(created);
    }
    catch (DbUpdateException ex)
    {
        _logger.LogError(ex, "Database error creating magic item");
        throw new ApplicationException("Failed to create magic item", ex);
    }
}

// ❌ BAD: Swallowing exceptions
public async Task CreateAsync(CreateMagicDto dto)
{
    try
    {
        // ... code ...
    }
    catch (Exception)
    {
        // Silent failure
    }
}

// ❌ BAD: Catching Exception without re-throw
public async Task CreateAsync(CreateMagicDto dto)
{
    try
    {
        // ... code ...
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex);  // Just logging, not handling
    }
}
```

## TypeScript/React Standards

### Naming Conventions

```typescript
// ✅ GOOD: camelCase for variables and functions
const magicService = createMagicService();
function getMagicById(id: string) { }

// ✅ GOOD: PascalCase for components, classes, types
interface MagicDto { }
type CreateMagicDto = { };
class MagicService { }
function MagicListComponent() { }

// ✅ GOOD: UPPER_SNAKE_CASE for constants
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// ❌ BAD: Unclear names
const x = getMagic();
const temp = process(data);
const flag = true;
```

### Component Structure

```typescript
// ✅ GOOD: Functional components with proper types
interface MagicListProps {
  onMagicClick: (publicId: string) => void;
  filter?: string;
}

export function MagicList({ onMagicClick, filter }: MagicListProps) {
  const { data: magics, isLoading } = useMagicList();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {magics?.map((magic) => (
        <div key={magic.publicMagicId} onClick={() => onMagicClick(magic.publicMagicId)}>
          {magic.name}
        </div>
      ))}
    </div>
  );
}

// ❌ BAD: No types, poor structure
export function MagicList(props) {
  // Missing types, unclear structure
}
```

### Immutability (CRITICAL)

```typescript
// ✅ GOOD: Use spread operator for objects
const updatedMagic = {
  ...magic,
  name: 'New Name',
};

// ✅ GOOD: Use spread operator for arrays
const updatedMagics = [...magics, newMagic];
const filteredMagics = magics.filter(m => m.isActive);

// ❌ BAD: Direct mutation
magic.name = 'New Name';  // MUTATION
magics.push(newMagic);    // MUTATION
```

### TypeScript Strict Mode

```typescript
// ✅ GOOD: Proper typing, no 'any'
interface MagicDto {
  publicMagicId: string;
  name: string;
  description?: string;
}

function getMagic(id: string): Promise<MagicDto | null> {
  // Implementation
}

// ❌ BAD: Using 'any'
function getMagic(id: any): Promise<any> {
  // Loses type safety
}

// ✅ GOOD: Handle null/undefined
const magic = await getMagic(id);
if (magic) {
  console.log(magic.name);  // Safe
}

// ❌ BAD: Not checking null
const magic = await getMagic(id);
console.log(magic.name);  // Might crash if magic is null
```

### Custom Hooks

```typescript
// ✅ GOOD: Proper hook naming (use prefix) and types
export function useMagic(publicMagicId: string) {
  return useQuery({
    queryKey: ['magic', publicMagicId],
    queryFn: () => magicService.getByPublicId(publicMagicId),
    enabled: !!publicMagicId,
  });
}

// ✅ GOOD: Extract reusable logic
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

## File Size Limits

### .NET/C#
- **Typical**: 200-400 lines per file
- **Maximum**: 800 lines per file
- If exceeding 800 lines, split into multiple files

### TypeScript/React
- **Components**: 100-200 lines (including JSX)
- **Maximum**: 400 lines per file
- Extract utilities, hooks, and types to separate files

## Code Quality Checklist

Before marking work complete:

### .NET/C#
- [ ] Code follows PascalCase/camelCase conventions
- [ ] All public methods have XML documentation
- [ ] Async methods use async/await (no .Result or .Wait())
- [ ] Proper exception handling with logging
- [ ] No hardcoded values (use configuration)
- [ ] Files under 800 lines
- [ ] Methods under 50 lines

### TypeScript/React
- [ ] Code follows camelCase/PascalCase conventions
- [ ] All exported functions have JSDoc comments
- [ ] No 'any' types (strict mode compliance)
- [ ] Immutability patterns used (spread operators)
- [ ] Proper null/undefined checks
- [ ] Files under 400 lines
- [ ] Components under 200 lines

### Universal
- [ ] Code is readable and well-named
- [ ] No duplicated code
- [ ] Proper error handling
- [ ] No console.log statements (use proper logging)
- [ ] Tests written (80%+ coverage)
- [ ] No commented-out code

## Comments & Documentation

### When to Comment

```csharp
// ✅ GOOD: Explain WHY, not WHAT
// Use exponential backoff to avoid overwhelming the API during outages
var delay = Math.Min(1000 * Math.Pow(2, retryCount), 30000);

// Deliberately using Dapper here for performance with large result sets
using var connection = _connectionFactory.CreateConnection();

// ❌ BAD: Stating the obvious
// Increment counter by 1
count++;

// Set name to magic name
name = magic.Name;
```

### XML Documentation (.NET)

```csharp
/// <summary>
/// Creates a new magic item with a generated public ID.
/// </summary>
/// <param name="dto">The magic item data to create.</param>
/// <returns>The created magic item with public ID.</returns>
/// <exception cref="ArgumentNullException">Thrown when dto is null.</exception>
/// <exception cref="DbUpdateException">Thrown when database save fails.</exception>
public async Task<MagicDto> CreateAsync(CreateMagicDto dto)
{
    // Implementation
}
```

### JSDoc (TypeScript)

```typescript
/**
 * Fetches a magic item by its public ID.
 *
 * @param publicMagicId - The public ID of the magic item
 * @returns The magic item or null if not found
 * @throws {Error} If the API request fails
 *
 * @example
 * ```typescript
 * const magic = await getMagic('abc123');
 * console.log(magic?.name);
 * ```
 */
export async function getMagic(publicMagicId: string): Promise<MagicDto | null> {
  // Implementation
}
```

## Code Smell Detection

### Long Methods/Functions
- **Limit**: 50 lines for .NET, 30 lines for React components
- **Fix**: Extract smaller, focused methods/functions

### Deep Nesting
- **Limit**: 4 levels maximum
- **Fix**: Use early returns, extract methods

### Magic Numbers
- **Issue**: Unexplained numeric literals
- **Fix**: Use named constants

```csharp
// ❌ BAD
if (retryCount > 3) { }

// ✅ GOOD
const int MaxRetries = 3;
if (retryCount > MaxRetries) { }
```

### Duplicated Code
- **Issue**: Same code in multiple places
- **Fix**: Extract to shared method/function

**Remember**: Code quality is non-negotiable at Wizardworks. Clean, maintainable code enables rapid development and confident refactoring.
