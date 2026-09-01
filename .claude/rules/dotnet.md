# .NET / C# Stack Standards

Stack-specific conventions for .NET/C# projects. Loaded when the **dotnet**
stack overlay is selected at download. These extend the language-agnostic
`rules/coding-style.md`, `rules/testing.md`, and `rules/security.md`. Deeper
patterns and worked examples live in the `backend-patterns-dotnet` skill.

Follows [Microsoft's .NET naming guidelines](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/naming-guidelines).

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| Classes, structs, records | PascalCase | `OrderService`, `CustomerDto` |
| Interfaces | `I` + PascalCase | `IOrderService`, `IRepository<T>` |
| Methods | PascalCase | `GetByPublicIdAsync` |
| Async methods | PascalCase + `Async` suffix | `CreateAsync` |
| Properties / public fields | PascalCase | `PublicOrderId` |
| Private fields | `_camelCase` | `_orderRepository`, `_logger` |
| Parameters / locals | camelCase | `publicOrderId`, `result` |
| Constants | PascalCase | `MaxRetryCount` |
| Type parameters | `T` + PascalCase | `TEntity`, `TResult` |
| Namespaces | `Company.Product.Feature` | `Contoso.Api.Orders` |

- One public type per file; file name matches the type.
- Methods ≤ 50 lines; files ≤ 800 lines. Organize by feature, not by type.

## Architecture — Controller-Service-Repository

```
Controller  → HTTP concerns, routing, model validation only
Service     → business logic, orchestration only
Repository  → data access / persistence only
```

- No layer skipping (Controller → Repository is wrong).
- Constructor injection for dependencies; register in DI.

## DTO-at-boundary & Public IDs

- All API inputs/outputs use DTOs — never expose EF entities directly.
- Never expose database IDs externally. Keep an internal key (`OrderId`) and a
  stable external `PublicOrderId`; map between them in the service layer.

## Data access — Entity Framework Core

- EF Core is the default ORM for new projects; Dapper only for measured
  performance-critical paths. Don't mix ORMs within a project.
- Always parameterize (EF and Dapper do this for you) — never string-concat SQL.
- Review every generated migration: Npgsql quotes PascalCase columns
  (`"Status"`), and partial-index filters must use the same quoting.

## Async/await

- Async all the way down; never `.Result` / `.Wait()` (deadlock risk).
- No `async void` except event handlers.

## Testing

- xUnit + FluentAssertions; Moq (or NSubstitute) for test doubles.
- Arrange-Act-Assert; test the Controller/Service/Repository layers
  independently. Integration tests via `WebApplicationFactory<Program>`.

## Secrets

- Local dev: `dotnet user-secrets`. Deployed: your platform's secret manager
  (with the **azure** overlay, that's Azure Key Vault + managed identity — see
  `rules/azure.md`). Never hardcode; `appsettings.json` holds no secrets.
