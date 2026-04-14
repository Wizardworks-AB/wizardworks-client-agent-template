---
name: refactor-clean
description: Clean up and refactor code for maintainability
usage: /refactor-clean [file or directory]
---

# Refactor & Clean Command

This command helps improve code quality through systematic refactoring, technical debt removal, and cleanup following Wizardworks standards.

## Usage

```bash
/refactor-clean                           # Refactor all recent changes
/refactor-clean src/Services              # Refactor specific directory
/refactor-clean src/Controllers/MagicController.cs  # Refactor specific file
/refactor-clean --extract-methods         # Extract large methods
/refactor-clean --remove-duplication      # Remove code duplication
/refactor-clean --simplify-logic          # Simplify complex logic
```

## What This Command Does

1. **Spawns Refactor Agent**: Launches Wizardworks refactoring specialist
2. **Code Analysis**: Identifies refactoring opportunities
3. **Suggests Improvements**: Provides specific refactoring suggestions
4. **Maintains Tests**: Ensures tests still pass during refactoring
5. **Improves Readability**: Makes code easier to understand
6. **Reduces Complexity**: Simplifies complex logic
7. **Removes Duplication**: Consolidates repeated code
8. **Updates Documentation**: Keeps docs in sync

## Refactoring Patterns

### 1. Extract Method

**Before**:
```csharp
public async Task<MagicDto> CreateAsync(CreateMagicDto dto)
{
    // Validate input (5 lines)
    if (string.IsNullOrWhiteSpace(dto.Name))
        throw new ArgumentException("Name is required");
    if (dto.Name.Length > 200)
        throw new ArgumentException("Name too long");

    // Generate public ID (3 lines)
    var publicId = Guid.NewGuid().ToString("N").Substring(0, 12);

    // Create entity (4 lines)
    var entity = new Magic
    {
        PublicMagicId = publicId,
        Name = dto.Name,
        Description = dto.Description,
        CreatedAt = DateTime.UtcNow
    };

    // Save to database (2 lines)
    var result = await _repository.CreateAsync(entity);
    return _mapper.MapToDto(result);
}
```

**After**:
```csharp
public async Task<MagicDto> CreateAsync(CreateMagicDto dto)
{
    ValidateCreateInput(dto);
    var publicId = GeneratePublicId();
    var entity = CreateMagicEntity(dto, publicId);
    var result = await _repository.CreateAsync(entity);
    return _mapper.MapToDto(result);
}

private void ValidateCreateInput(CreateMagicDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.Name))
        throw new ArgumentException("Name is required");
    if (dto.Name.Length > 200)
        throw new ArgumentException("Name too long");
}

private string GeneratePublicId()
{
    return Guid.NewGuid().ToString("N").Substring(0, 12);
}

private Magic CreateMagicEntity(CreateMagicDto dto, string publicId)
{
    return new Magic
    {
        PublicMagicId = publicId,
        Name = dto.Name,
        Description = dto.Description,
        CreatedAt = DateTime.UtcNow
    };
}
```

**Benefits**:
- Each method has single responsibility
- Methods are testable independently
- Code is self-documenting
- Easier to maintain and modify

### 2. Remove Duplication

**Before**:
```csharp
// In MagicController.cs
private async Task<MagicDto> ValidateAndGetMagic(string publicMagicId)
{
    if (string.IsNullOrWhiteSpace(publicMagicId))
        throw new ArgumentException("ID is required");
    var magic = await _service.GetByPublicIdAsync(publicMagicId);
    if (magic == null)
        throw new KeyNotFoundException("Magic not found");
    return magic;
}

// In MagicService.cs
private void ValidatePublicId(string publicMagicId)
{
    if (string.IsNullOrWhiteSpace(publicMagicId))
        throw new ArgumentException("ID is required");
    var magic = await _repository.GetByPublicIdAsync(publicMagicId);
    if (magic == null)
        throw new KeyNotFoundException("Magic not found");
}
```

**After**:
```csharp
// In MagicService.cs (single source of truth)
public async Task<MagicDto> GetByPublicIdAsync(string publicMagicId)
{
    ValidatePublicId(publicMagicId);
    var magic = await _repository.GetByPublicIdAsync(publicMagicId);
    if (magic == null)
        throw new KeyNotFoundException("Magic not found");
    return _mapper.MapToDto(magic);
}

private void ValidatePublicId(string publicMagicId)
{
    if (string.IsNullOrWhiteSpace(publicMagicId))
        throw new ArgumentException("ID is required");
}

// In MagicController.cs (use service method)
[HttpGet("{publicMagicId}")]
public async Task<IActionResult> Get(string publicMagicId)
{
    try
    {
        var magic = await _service.GetByPublicIdAsync(publicMagicId);
        return Ok(magic);
    }
    catch (ArgumentException ex)
    {
        return BadRequest(ex.Message);
    }
    catch (KeyNotFoundException ex)
    {
        return NotFound(ex.Message);
    }
}
```

**Benefits**:
- Single source of truth
- Easier to maintain
- Consistent behavior
- Reduced code size

### 3. Simplify Complex Logic

**Before**:
```typescript
export function MagicFilter({ items, searchTerm, filters }: Props) {
  return items.filter(item => {
    let matches = true;

    if (searchTerm) {
      matches = matches && (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.category) {
      matches = matches && item.category === filters.category;
    }

    if (filters.isActive !== undefined) {
      matches = matches && item.isActive === filters.isActive;
    }

    if (filters.minPower !== undefined) {
      matches = matches && item.power >= filters.minPower;
    }

    if (filters.maxPower !== undefined) {
      matches = matches && item.power <= filters.maxPower;
    }

    return matches;
  });
}
```

**After**:
```typescript
export function MagicFilter({ items, searchTerm, filters }: Props) {
  return items.filter(item =>
    matchesSearchTerm(item, searchTerm) &&
    matchesCategory(item, filters.category) &&
    matchesActiveStatus(item, filters.isActive) &&
    matchesPowerRange(item, filters.minPower, filters.maxPower)
  );
}

function matchesSearchTerm(item: Magic, term?: string): boolean {
  if (!term) return true;
  const lowerTerm = term.toLowerCase();
  return item.name.toLowerCase().includes(lowerTerm) ||
         item.description?.toLowerCase().includes(lowerTerm) ?? false;
}

function matchesCategory(item: Magic, category?: string): boolean {
  return !category || item.category === category;
}

function matchesActiveStatus(item: Magic, isActive?: boolean): boolean {
  return isActive === undefined || item.isActive === isActive;
}

function matchesPowerRange(item: Magic, min?: number, max?: number): boolean {
  return (!min || item.power >= min) && (!max || item.power <= max);
}
```

**Benefits**:
- Each function has single responsibility
- Easier to test individual filters
- Logic is clearer and more readable
- Easier to modify individual filters

### 4. Extract Constants

**Before**:
```csharp
public class SearchService
{
    public async Task<IEnumerable<Magic>> SearchAsync(string term)
    {
        const int maxSearchLength = 50;
        const int minSearchLength = 2;
        const int debounceDelay = 600;
        const int maxResults = 100;
        const int resultsCacheDuration = 5; // minutes

        if (term.Length < minSearchLength || term.Length > maxSearchLength)
            throw new ArgumentException("Invalid search term");

        // ... rest of method
    }
}
```

**After**:
```csharp
public class SearchService
{
    private const int MaxSearchLength = 50;
    private const int MinSearchLength = 2;
    private const int DebounceDelay = 600; // milliseconds
    private const int MaxSearchResults = 100;
    private const int SearchCacheDuration = 5; // minutes

    public async Task<IEnumerable<Magic>> SearchAsync(string term)
    {
        ValidateSearchTerm(term);
        // ... rest of method
    }

    private void ValidateSearchTerm(string term)
    {
        if (term.Length < MinSearchLength || term.Length > MaxSearchLength)
            throw new ArgumentException($"Search term must be between {MinSearchLength} and {MaxSearchLength} characters");
    }
}
```

**Benefits**:
- Magic numbers removed
- Constants are centralized
- Easy to adjust values
- Self-documenting code

### 5. Improve Naming

**Before**:
```csharp
public class MagicService
{
    public async Task<List<MagicDto>> GetAsync(string s, int p, int sz)
    {
        var q = _context.Magics.Where(m => m.Name.Contains(s));
        var r = q.Skip((p - 1) * sz).Take(sz);
        return _mapper.Map<List<MagicDto>>(r);
    }

    private bool CheckIfValid(string v)
    {
        return !string.IsNullOrWhiteSpace(v) && v.Length > 2;
    }
}
```

**After**:
```csharp
public class MagicService
{
    public async Task<IEnumerable<MagicDto>> SearchAsync(
        string searchTerm,
        int pageNumber,
        int pageSize)
    {
        ValidateSearchTerm(searchTerm);

        var query = _context.Magics
            .Where(m => m.Name.Contains(searchTerm))
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize);

        return await _mapper.MapAsync<MagicDto>(query);
    }

    private void ValidateSearchTerm(string searchTerm)
    {
        if (!IsValidSearchTerm(searchTerm))
            throw new ArgumentException("Search term must be at least 3 characters");
    }

    private bool IsValidSearchTerm(string term)
    {
        return !string.IsNullOrWhiteSpace(term) && term.Length >= 3;
    }
}
```

**Benefits**:
- Code is self-documenting
- Easier to understand intent
- Reduces cognitive load
- Easier for new team members

## Refactoring Checklist

Before and after refactoring:

- [ ] All tests pass before refactoring
- [ ] Single refactoring at a time
- [ ] All tests still pass after refactoring
- [ ] Code coverage maintained or improved
- [ ] No functional changes (only structural)
- [ ] Performance not degraded
- [ ] Documentation updated
- [ ] PR/commit message explains refactoring

## Anti-Patterns to Fix

### God Objects (Too Many Responsibilities)

**Before**:
```csharp
public class MagicService
{
    // 50+ methods
    public async Task<MagicDto> CreateAsync(CreateMagicDto dto) { }
    public async Task<MagicDto> UpdateAsync(string id, UpdateMagicDto dto) { }
    public async Task<bool> DeleteAsync(string id) { }
    public async Task<IEnumerable<MagicDto>> SearchAsync(string term) { }
    public async Task ExportAsync(string format) { }
    public async Task ImportAsync(Stream stream) { }
    public async Task<ReportDto> GenerateReportAsync() { }
    public async Task NotifyUsersAsync(string notification) { }
    public async Task BackupAsync() { }
    // ... many more methods
}
```

**After**:
```csharp
public class MagicService
{
    // CRUD operations
    public async Task<MagicDto> CreateAsync(CreateMagicDto dto) { }
    public async Task<MagicDto> UpdateAsync(string id, UpdateMagicDto dto) { }
    public async Task<bool> DeleteAsync(string id) { }
    public async Task<IEnumerable<MagicDto>> SearchAsync(string term) { }
}

public class MagicExportService
{
    public async Task ExportAsync(string format, IEnumerable<Magic> items) { }
}

public class MagicImportService
{
    public async Task ImportAsync(Stream stream) { }
}

public class MagicReportingService
{
    public async Task<ReportDto> GenerateReportAsync() { }
}

public class NotificationService
{
    public async Task NotifyUsersAsync(string notification) { }
}

public class BackupService
{
    public async Task BackupAsync() { }
}
```

### Long Methods (Over 50 Lines)

**Before**:
```csharp
public async Task<bool> ProcessMagicAsync(string magicId, ProcessMagicRequest request)
{
    // 60+ lines of code
    var magic = await _repository.GetAsync(magicId);
    if (magic == null) throw new KeyNotFoundException();

    if (request.Type == "activate") {
        magic.IsActive = true;
        // 10 lines of validation
        // 10 lines of calculation
        // 10 lines of update
    }
    else if (request.Type == "deactivate") {
        magic.IsActive = false;
        // ... more logic
    }
    else if (request.Type == "archive") {
        // ... more logic
    }
    // ... lots more code

    await _repository.UpdateAsync(magic);
    return true;
}
```

**After**:
```csharp
public async Task<bool> ProcessMagicAsync(string magicId, ProcessMagicRequest request)
{
    var magic = await GetAndValidateMagic(magicId);

    await request.Type switch
    {
        "activate" => ActivateMagicAsync(magic),
        "deactivate" => DeactivateMagicAsync(magic),
        "archive" => ArchiveMagicAsync(magic),
        _ => throw new InvalidOperationException($"Unknown type: {request.Type}")
    };

    await _repository.UpdateAsync(magic);
    return true;
}

private async Task<Magic> GetAndValidateMagic(string magicId)
{
    var magic = await _repository.GetAsync(magicId);
    return magic ?? throw new KeyNotFoundException($"Magic {magicId} not found");
}

private async Task ActivateMagicAsync(Magic magic)
{
    magic.IsActive = true;
    // Specific activation logic
}

private async Task DeactivateMagicAsync(Magic magic)
{
    magic.IsActive = false;
    // Specific deactivation logic
}

private async Task ArchiveMagicAsync(Magic magic)
{
    magic.IsArchived = true;
    // Specific archive logic
}
```

### Deep Nesting (Over 4 Levels)

**Before**:
```typescript
if (user) {
  if (user.isAuthenticated) {
    if (user.roles.includes('admin')) {
      if (item) {
        if (item.isActive) {
          if (item.owner === user.id) {
            // Finally the real logic - 6 levels deep!
            return item.value * 2;
          }
        }
      }
    }
  }
}
return null;
```

**After**:
```typescript
if (!canUserAccessItem(user, item)) return null;
return item.value * 2;

function canUserAccessItem(user: User | null, item: Item | null): boolean {
  return user?.isAuthenticated &&
         user.roles.includes('admin') &&
         item?.isActive &&
         item.owner === user.id;
}
```

## Running Refactoring

**Before Refactoring**:
```bash
# Run all tests
dotnet test

# Check test coverage
dotnet test /p:CollectCoverage=true
```

**During Refactoring**:
1. Make one change at a time
2. Run tests after each change
3. Verify coverage maintained
4. Keep working tests green

**After Refactoring**:
```bash
# Verify all tests pass
dotnet test

# Verify coverage maintained
dotnet test /p:CollectCoverage=true

# Run code quality checks
dotnet test
```

## Refactoring Guidelines

### DO

- Do extract methods that have single responsibility
- Do improve naming for clarity
- Do remove code duplication
- do run tests after each change
- Do keep refactoring focused (one concern at a time)
- Do update documentation

### DON'T

- Don't change functionality while refactoring
- Don't add new features during refactoring
- Don't refactor without tests
- Don't skip test runs
- Don't mix refactoring with bug fixes

## When to Use This Command

- **Preparing for major changes**
- **Reducing technical debt**
- **Improving code readability**
- **Reducing complexity**
- **Before refactoring passes**
- **After code review feedback**
- **When adding similar features**

## Related Commands

- Use `/code-review` to identify refactoring opportunities
- Use `/tdd` to ensure tests guide refactoring
- Use `/build-fix` if refactoring breaks build

## As a Wizardworks Employee

Code quality is not a luxury - it's mandatory at Wizardworks. Regular refactoring:
- Keeps code maintainable
- Reduces bugs
- Makes features easier to add
- Improves developer experience
- Prevents technical debt

**Remember**: Leave code better than you found it. Refactor continuously.
