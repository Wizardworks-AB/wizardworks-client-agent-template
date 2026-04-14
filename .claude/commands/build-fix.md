---
name: build-fix
description: Fix build errors and deployment issues
usage: /build-fix [error message or type]
---

# Build Fix Command

This command helps diagnose and fix build errors, deployment failures, and infrastructure issues in your Wizardworks project.

## Usage

```bash
/build-fix                                    # Analyze and fix current build errors
/build-fix nuget restore failed               # Fix package restoration issue
/build-fix docker build failed                # Fix Docker build problem
/build-fix azure deployment failed            # Fix infrastructure deployment
/build-fix test coverage below threshold      # Fix coverage issues
/build-fix migration pending                  # Fix database migration
```

## What This Command Does

1. **Spawns Build Agent**: Launches Wizardworks build specialist
2. **Error Analysis**: Identifies root cause of build failures
3. **Solution Generation**: Suggests fixes with code examples
4. **Verification**: Helps validate the fix works
5. **Prevention**: Recommends process improvements
6. **CI/CD Debugging**: Troubleshoots pipeline failures

## Build Error Categories

### .NET Build Errors

**NuGet Restore Failures**
```
ERROR: Unable to find version of package 'FluentAssertions' that is compatible
```

**Fix Approach**:
```bash
# Clear NuGet cache
dotnet nuget locals all --clear

# Restore packages
dotnet restore

# Update package reference if needed
dotnet add package FluentAssertions --version 6.12.0
```

**C# Compilation Errors**
```
error CS0246: The type or namespace name 'IMagicService' could not be found
```

**Fix Approach**:
- Check using statements
- Verify interface exists
- Check project references
- Run `dotnet build` to see full error

**Entity Framework Errors**
```
error: Unable to create an object of type 'MagicContext'. For the different patterns supported at design time, see https://go.microsoft.com/fwlink/?linkid=851122
```

**Fix Approach**:
```csharp
// Add DbContext factory for design-time
public class MagicContextFactory : IDesignTimeDbContextFactory<MagicContext>
{
    public MagicContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<MagicContext>();
        optionsBuilder.UseSqlServer("Server=.;Database=Wizardworks;");
        return new MagicContext(optionsBuilder.Options);
    }
}
```

### Frontend Build Errors

**TypeScript Compilation**
```
error TS2307: Cannot find module '@/hooks/useMagic'
```

**Fix Approach**:
```json
// vite.config.ts or tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**React Import Errors**
```
error: 'React' is not defined
```

**Fix Approach**:
```typescript
// Add import if missing
import React from 'react';

// Or use JSX runtime
// If using new JSX transform, no import needed
```

**Module Not Found**
```
error: Cannot find module 'axios'
```

**Fix Approach**:
```bash
# Install missing dependency
pnpm install axios

# Verify node_modules
pnpm install  # Re-install all

# Clear cache
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Docker Build Errors

**Base Image Not Found**
```
ERROR: failed to solve with frontend dockerfile.v0: failed to build LLB: failed to load /dockerignore: ...
```

**Fix Approach**:
```dockerfile
# Use correct base image
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
...
FROM mcr.microsoft.com/dotnet/aspnet:9.0
```

**File Not Found in Build Context**
```
ERROR: failed to solve: filenotfound: /app/appsettings.json
```

**Fix Approach**:
```dockerfile
# Copy files correctly
COPY ["Wizardworks.csproj", ""]
COPY ["appsettings.json", ""]
RUN dotnet restore

# Multi-stage build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Wizardworks.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/build .
ENTRYPOINT ["dotnet", "Wizardworks.dll"]
```

### Test Coverage Failures

**Coverage Below Threshold**
```
error: Coverage 72% is below required 80%
```

**Fix Approach**:
```bash
# Check coverage report
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover

# Generate HTML report
reportgenerator -reports:coverage.opencover.xml -targetdir:coverage-report

# Find uncovered code and add tests
# Then re-run tests to verify
```

### Database Migration Issues

**Pending Migrations**
```
error: An unread migration 'AddMagicSearch' has been applied to the database.
```

**Fix Approach**:
```bash
# Check migration status
dotnet ef migrations list

# Update database
dotnet ef database update

# If migration is problematic, remove it
dotnet ef migrations remove
dotnet ef migrations add YourMigration
dotnet ef database update
```

**Connection String Error**
```
error: A network-related or instance-specific error occurred while establishing a connection to SQL Server
```

**Fix Approach**:
```csharp
// Verify connection string
// Use User Secrets for local development
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=Wizardworks;Integrated Security=true;"

// Verify in code
var connectionString = configuration.GetConnectionString("DefaultConnection");
```

### Azure Deployment Errors

**Authentication Failed**
```
error: The command has failed because the provided credentials were invalid
```

**Fix Approach**:
```bash
# Login to Azure
az login

# Select subscription
az account set --subscription "Your-Subscription-ID"

# Verify credentials
az account show
```

**Bicep Validation Failed**
```
error: Template validation failed: The variable 'location' is not defined
```

**Fix Approach**:
```bicep
// Ensure variables are declared
param location string = resourceGroup().location

// Use correct syntax
var appServiceName = 'wizardworks-${environment}-api'

resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: appServiceName
  location: location
}
```

**Container Registry Login Failed**
```
error: failed to push image to registry
```

**Fix Approach**:
```bash
# Get registry credentials
az acr credential show --resource-group YourRG --name YourRegistry

# Login to registry
az acr login --name YourRegistry

# Tag and push image
docker tag wizardworks:latest yourregistry.azurecr.io/wizardworks:latest
docker push yourregistry.azurecr.io/wizardworks:latest
```

## Example Fix Session

```markdown
## Build Error Analysis

**Issue**: NuGet package restore failing in CI/CD pipeline

**Error Message**:
```
ERROR: Failed to download packages from nuget.org
HTTP status code: 408 (Request Timeout)
```

**Root Cause Analysis**:
- Network timeout during package download
- CI/CD agent may have network restrictions
- Package sources misconfigured

**Solutions**:

### Solution 1: Configure NuGet Sources (Recommended)
```bash
# Create nuget.config in repository root
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <clear />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
  </packageSources>
  <packageSourceCredentials>
    <!-- If using private feeds -->
  </packageSourceCredentials>
</configuration>
```

### Solution 2: Add Retry Logic
```yaml
# GitHub Actions
- name: Restore NuGet packages
  run: |
    dotnet restore --disable-parallel
  retry: 3  # Retry up to 3 times
```

### Solution 3: Use Package Cache
```yaml
# GitHub Actions
- name: Cache NuGet packages
  uses: actions/cache@v3
  with:
    path: ~/.nuget/packages
    key: ${{ runner.os }}-nuget-${{ hashFiles('**/packages.lock.json') }}
    restore-keys: |
      ${{ runner.os }}-nuget-
```

**Verification**:
```bash
# Test locally
dotnet clean
dotnet restore
dotnet build
```

**Prevention**:
1. Use package caching in CI/CD
2. Keep dependencies up to date
3. Monitor NuGet.org status
4. Document any network requirements
```

## Build Process Checklist

Ensure all these pass before deployment:

- [ ] `dotnet build` succeeds without warnings
- [ ] `dotnet test` passes all tests
- [ ] Test coverage ≥ 80%
- [ ] `dotnet test /p:CollectCoverage=true` shows acceptable coverage
- [ ] `docker build -t app .` succeeds
- [ ] `docker run app` starts successfully
- [ ] No secrets exposed in image
- [ ] `az bicep build` Bicep templates validate
- [ ] `pnpm build` frontend builds successfully
- [ ] No TypeScript errors
- [ ] All linting passes
- [ ] No dependency vulnerabilities

## Preventing Build Failures

### .NET Project

**Add to .csproj**:
```xml
<ItemGroup>
  <!-- Ensure proper restore -->
  <PackageReference Include="FluentAssertions" Version="6.12.0" />
  <PackageReference Include="xunit" Version="2.6.0" />
  <PackageReference Include="coverlet.collector" Version="6.0.0" />
</ItemGroup>

<!-- Lock file for consistency -->
<PackageReference Include="..." />
```

**Create global.json**:
```json
{
  "sdk": {
    "version": "9.0.0",
    "rollForward": "latestFeature"
  }
}
```

### Frontend Project

**Create .npmrc or .pnpmrc**:
```
registry=https://registry.npmjs.org/
@your-scope:registry=https://registry.npmjs.org/
```

**Lock Dependencies**:
```bash
# Use lock files
pnpm-lock.yaml  # Commit this
package-lock.json  # Commit this
```

### Docker

**Use .dockerignore**:
```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
coverage
dist
build
```

### CI/CD Pipeline

**GitHub Actions Best Practices**:
```yaml
name: Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '9.0.x'
          cache: true  # Cache NuGet packages

      - name: Restore dependencies
        run: dotnet restore

      - name: Build
        run: dotnet build --no-restore --configuration Release

      - name: Test
        run: dotnet test --no-build --configuration Release /p:CollectCoverage=true

      - name: Verify Coverage
        run: |
          coverage=$(grep -oP 'line-rate="\K[0-9.]+' coverage.opencover.xml)
          if (( $(echo "$coverage < 0.80" | bc -l) )); then
            echo "Coverage $coverage is below 80%"
            exit 1
          fi
```

## When to Use This Command

- **Build fails locally**
- **CI/CD pipeline fails**
- **Docker build errors**
- **Deployment failures**
- **Test coverage drops below threshold**
- **Database migration issues**
- **Container registry problems**
- **Infrastructure deployment errors**

## Related Commands

- Use `/code-review` to prevent issues
- Use `/tdd` to ensure tests exist
- Use `/security-review` to catch vulnerabilities
- See `rules/testing.md` for test requirements
- See `agents/code-reviewer.md` for review criteria

## As a Wizardworks Employee

Build success is **MANDATORY** before merging. This command helps you:
- Fix issues quickly
- Learn from failures
- Prevent future problems
- Maintain CI/CD hygiene

**Remember**: A broken build blocks the team. Fix it immediately.
