---
name: infrastructure-as-code
description: Wizardworks Infrastructure as Code patterns using Bicep, Docker, Azure DevOps, and GitHub Actions. As a Wizardworks employee, you must adhere to these standards.
---

# Wizardworks Infrastructure as Code

Infrastructure as Code (IaC) standards and best practices for Wizardworks projects.

**Important**: As a Wizardworks employee/agent, you must define all infrastructure in code. No manual resource creation in Azure Portal.

## Technology Stack

### Required Tools
- **Bicep** (Azure infrastructure definition)
- **Docker** (containerization)
- **Azure DevOps** or **GitHub Actions** (CI/CD)
- **Azure CLI** (deployment)

### Azure Services (Common)
- Azure Container Apps or App Service
- Azure SQL Database or PostgreSQL Flexible Server
- Azure Key Vault
- Azure Container Registry
- Application Insights
- Azure Storage (if needed)

## Bicep Standards

### Project Structure

```
infrastructure/
├── main.bicep                    # Main entry point
├── parameters/
│   ├── dev.bicepparam           # Development parameters
│   ├── staging.bicepparam       # Staging parameters
│   └── production.bicepparam    # Production parameters
├── modules/
│   ├── appService.bicep         # App Service module
│   ├── database.bicep           # Database module
│   ├── keyVault.bicep           # Key Vault module
│   ├── containerRegistry.bicep  # ACR module
│   └── monitoring.bicep         # App Insights module
└── README.md                     # Infrastructure documentation
```

### Main Bicep Template

```bicep
// main.bicep
@description('Environment name (dev, staging, production)')
@allowed([
  'dev'
  'staging'
  'production'
])
param environmentName string

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Application name')
param appName string

@description('SQL Administrator username')
@secure()
param sqlAdminUsername string

@description('SQL Administrator password')
@secure()
param sqlAdminPassword string

// Variables
var resourceSuffix = '${appName}-${environmentName}'
var tags = {
  Environment: environmentName
  Application: appName
  ManagedBy: 'Bicep'
  Department: 'Engineering'
}

// Key Vault
module keyVault 'modules/keyVault.bicep' = {
  name: 'keyVault-deployment'
  params: {
    keyVaultName: 'kv-${resourceSuffix}'
    location: location
    tags: tags
  }
}

// Container Registry
module containerRegistry 'modules/containerRegistry.bicep' = {
  name: 'acr-deployment'
  params: {
    registryName: 'acr${replace(resourceSuffix, '-', '')}'
    location: location
    tags: tags
    sku: environmentName == 'production' ? 'Premium' : 'Standard'
  }
}

// Database
module database 'modules/database.bicep' = {
  name: 'database-deployment'
  params: {
    serverName: 'sql-${resourceSuffix}'
    databaseName: '${appName}Db'
    location: location
    tags: tags
    administratorLogin: sqlAdminUsername
    administratorPassword: sqlAdminPassword
    tier: environmentName == 'production' ? 'GeneralPurpose' : 'Basic'
  }
}

// App Service
module appService 'modules/appService.bicep' = {
  name: 'appService-deployment'
  params: {
    appName: 'app-${resourceSuffix}'
    location: location
    tags: tags
    sku: environmentName == 'production' ? 'P1v3' : 'B1'
    containerRegistryName: containerRegistry.outputs.registryName
    databaseConnectionString: database.outputs.connectionString
    keyVaultName: keyVault.outputs.keyVaultName
  }
}

// Application Insights
module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoring-deployment'
  params: {
    appInsightsName: 'appi-${resourceSuffix}'
    location: location
    tags: tags
  }
}

// Outputs
output appServiceUrl string = appService.outputs.defaultHostName
output keyVaultName string = keyVault.outputs.keyVaultName
output databaseServer string = database.outputs.serverName
output containerRegistryLoginServer string = containerRegistry.outputs.loginServer
```

### Parameter Files

```bicep
// parameters/dev.bicepparam
using '../main.bicep'

param environmentName = 'dev'
param location = 'eastus'
param appName = 'wizardworks-magic'
param sqlAdminUsername = 'sqladmin'
param sqlAdminPassword = readEnvironmentVariable('SQL_ADMIN_PASSWORD', 'default-dev-password')
```

```bicep
// parameters/production.bicepparam
using '../main.bicep'

param environmentName = 'production'
param location = 'eastus'
param appName = 'wizardworks-magic'
param sqlAdminUsername = readEnvironmentVariable('SQL_ADMIN_USERNAME')
param sqlAdminPassword = readEnvironmentVariable('SQL_ADMIN_PASSWORD')
```

### Bicep Module Examples

#### App Service Module

```bicep
// modules/appService.bicep
@description('App Service name')
param appName string

@description('Location for resources')
param location string

@description('Resource tags')
param tags object

@description('App Service Plan SKU')
@allowed([
  'B1'
  'B2'
  'S1'
  'P1v3'
  'P2v3'
])
param sku string = 'B1'

@description('Container Registry name')
param containerRegistryName string

@description('Database connection string')
@secure()
param databaseConnectionString string

@description('Key Vault name')
param keyVaultName string

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${appName}-plan'
  location: location
  tags: tags
  sku: {
    name: sku
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// App Service
resource appService 'Microsoft.Web/sites@2022-09-01' = {
  name: appName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      alwaysOn: true
      linuxFxVersion: 'DOCKER|${containerRegistryName}.azurecr.io/wizardworks-api:latest'
      appSettings: [
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${containerRegistryName}.azurecr.io'
        }
        {
          name: 'DOCKER_ENABLE_CI'
          value: 'true'
        }
        {
          name: 'ConnectionStrings__DefaultConnection'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVaultName}.vault.azure.net/secrets/DbConnectionString/)'
        }
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: 'Production'
        }
      ]
    }
  }
}

// Key Vault Access Policy
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' existing = {
  name: keyVaultName
}

resource accessPolicy 'Microsoft.KeyVault/vaults/accessPolicies@2023-02-01' = {
  parent: keyVault
  name: 'add'
  properties: {
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: appService.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
  }
}

output appServiceId string = appService.id
output defaultHostName string = appService.properties.defaultHostName
output principalId string = appService.identity.principalId
```

#### Database Module

```bicep
// modules/database.bicep
@description('SQL Server name')
param serverName string

@description('Database name')
param databaseName string

@description('Location')
param location string

@description('Tags')
param tags object

@description('Administrator login')
param administratorLogin string

@description('Administrator password')
@secure()
param administratorPassword string

@description('Database tier')
@allowed([
  'Basic'
  'Standard'
  'GeneralPurpose'
])
param tier string = 'Standard'

// SQL Server
resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: serverName
  location: location
  tags: tags
  properties: {
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// SQL Database
resource database 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: databaseName
  location: location
  tags: tags
  sku: tier == 'GeneralPurpose' ? {
    name: 'GP_S_Gen5_2'
    tier: 'GeneralPurpose'
  } : {
    name: tier
    tier: tier
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: tier == 'GeneralPurpose' ? 34359738368 : 2147483648
  }
}

// Firewall rule for Azure services
resource firewallRule 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

output serverName string = sqlServer.name
output serverId string = sqlServer.id
output connectionString string = 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${databaseName};Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
```

#### Key Vault Module

```bicep
// modules/keyVault.bicep
@description('Key Vault name')
param keyVaultName string

@description('Location')
param location string

@description('Tags')
param tags object

resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: false
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    accessPolicies: []
  }
}

output keyVaultId string = keyVault.id
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
```

## Docker Configuration

### Multi-Stage Dockerfile (.NET)

```dockerfile
# Dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["Wizardworks.API/Wizardworks.API.csproj", "Wizardworks.API/"]
COPY ["Wizardworks.Core/Wizardworks.Core.csproj", "Wizardworks.Core/"]
RUN dotnet restore "Wizardworks.API/Wizardworks.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/Wizardworks.API"
RUN dotnet build "Wizardworks.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Wizardworks.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Wizardworks.API.dll"]
```

### Multi-Stage Dockerfile (React/TypeScript)

```dockerfile
# Dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# Runtime stage
FROM nginx:alpine AS final
WORKDIR /usr/share/nginx/html

# Remove default nginx content
RUN rm -rf ./*

# Copy built app
COPY --from=build /app/dist .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml (Local Development)

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:80"
      - "5001:443"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Server=db;Database=WizardworksDb;User Id=sa;Password=${SA_PASSWORD};TrustServerCertificate=True
      - OpenAI__ApiKey=${OPENAI_API_KEY}
    depends_on:
      - db
    networks:
      - wizardworks-network
    volumes:
      - ./backend:/app
      - /app/bin
      - /app/obj

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:5000
    networks:
      - wizardworks-network
    volumes:
      - ./frontend:/app
      - /app/node_modules

  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=${SA_PASSWORD}
      - MSSQL_PID=Developer
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

## Azure DevOps Pipeline

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
      - develop
  paths:
    exclude:
      - README.md
      - docs/**

variables:
  - group: wizardworks-$(Build.SourceBranchName)
  - name: buildConfiguration
    value: 'Release'
  - name: containerRegistry
    value: 'acrwizardworks.azurecr.io'
  - name: imageName
    value: 'wizardworks-api'
  - name: imageTag
    value: '$(Build.BuildId)'

stages:
  - stage: Build
    displayName: 'Build and Test'
    jobs:
      - job: BuildBackend
        displayName: 'Build .NET API'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: UseDotNet@2
            displayName: 'Install .NET SDK'
            inputs:
              version: '9.x'

          - task: DotNetCoreCLI@2
            displayName: 'Restore packages'
            inputs:
              command: 'restore'
              projects: '**/*.csproj'

          - task: DotNetCoreCLI@2
            displayName: 'Build'
            inputs:
              command: 'build'
              projects: '**/*.csproj'
              arguments: '--configuration $(buildConfiguration) --no-restore'

          - task: DotNetCoreCLI@2
            displayName: 'Run tests'
            inputs:
              command: 'test'
              projects: '**/*Tests.csproj'
              arguments: '--configuration $(buildConfiguration) --no-build --collect:"XPlat Code Coverage" --logger trx'

          - task: PublishCodeCoverageResults@1
            displayName: 'Publish code coverage'
            inputs:
              codeCoverageTool: 'Cobertura'
              summaryFileLocation: '$(Agent.TempDirectory)/**/coverage.cobertura.xml'

          - script: |
              COVERAGE=$(grep -oP 'line-rate="\K[^"]+' coverage.cobertura.xml | awk '{sum+=$1} END {print sum*100}')
              if (( $(echo "$COVERAGE < 80" | bc -l) )); then
                echo "Coverage $COVERAGE% is below 80%"
                exit 1
              fi
            displayName: 'Check code coverage threshold'

      - job: BuildFrontend
        displayName: 'Build React Frontend'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: NodeTool@0
            displayName: 'Install Node.js'
            inputs:
              versionSpec: '20.x'

          - script: |
              npm install -g pnpm
              pnpm install --frozen-lockfile
            displayName: 'Install dependencies'

          - script: pnpm build
            displayName: 'Build frontend'

          - script: pnpm test:coverage
            displayName: 'Run tests with coverage'

          - task: PublishCodeCoverageResults@1
            displayName: 'Publish coverage'
            inputs:
              codeCoverageTool: 'Cobertura'
              summaryFileLocation: 'coverage/cobertura-coverage.xml'

  - stage: Docker
    displayName: 'Build and Push Docker Image'
    dependsOn: Build
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - job: DockerBuild
        displayName: 'Docker Build and Push'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: Docker@2
            displayName: 'Build Docker image'
            inputs:
              command: 'build'
              repository: '$(imageName)'
              dockerfile: '$(Build.SourcesDirectory)/backend/Dockerfile'
              tags: |
                $(imageTag)
                latest

          - task: Docker@2
            displayName: 'Push to Container Registry'
            inputs:
              command: 'push'
              containerRegistry: 'ACR-Connection'
              repository: '$(imageName)'
              tags: |
                $(imageTag)
                latest

  - stage: Deploy
    displayName: 'Deploy Infrastructure and Application'
    dependsOn: Docker
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployInfrastructure
        displayName: 'Deploy to Azure'
        environment: 'production'
        pool:
          vmImage: 'ubuntu-latest'
        strategy:
          runOnce:
            deploy:
              steps:
                - checkout: self

                - task: AzureCLI@2
                  displayName: 'Deploy Bicep Infrastructure'
                  inputs:
                    azureSubscription: 'Azure-ServiceConnection'
                    scriptType: 'bash'
                    scriptLocation: 'inlineScript'
                    inlineScript: |
                      az deployment group create \
                        --resource-group $(resourceGroup) \
                        --template-file infrastructure/main.bicep \
                        --parameters infrastructure/parameters/production.bicepparam \
                        --parameters sqlAdminPassword=$(SQL_ADMIN_PASSWORD)

                - task: AzureWebAppContainer@1
                  displayName: 'Deploy to App Service'
                  inputs:
                    azureSubscription: 'Azure-ServiceConnection'
                    appName: 'app-wizardworks-production'
                    containers: '$(containerRegistry)/$(imageName):$(imageTag)'
```

## GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DOTNET_VERSION: '9.0.x'
  NODE_VERSION: '20.x'
  CONTAINER_REGISTRY: acrwizardworks.azurecr.io
  IMAGE_NAME: wizardworks-api

jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Restore dependencies
        run: dotnet restore

      - name: Build
        run: dotnet build --configuration Release --no-restore

      - name: Test
        run: dotnet test --configuration Release --no-build --verbosity normal --collect:"XPlat Code Coverage"

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: '**/coverage.cobertura.xml'

  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  docker:
    needs: [build-backend, build-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to Azure Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.CONTAINER_REGISTRY }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ${{ env.CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
            ${{ env.CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:latest

  deploy:
    needs: docker
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy Bicep
        uses: azure/arm-deploy@v1
        with:
          subscriptionId: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          resourceGroupName: rg-wizardworks-production
          template: ./infrastructure/main.bicep
          parameters: ./infrastructure/parameters/production.bicepparam sqlAdminPassword=${{ secrets.SQL_ADMIN_PASSWORD }}

      - name: Deploy to App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: app-wizardworks-production
          images: ${{ env.CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

## Deployment Commands

```bash
# Deploy to development
az deployment group create \
  --resource-group rg-wizardworks-dev \
  --template-file infrastructure/main.bicep \
  --parameters infrastructure/parameters/dev.bicepparam

# Deploy to production
az deployment group create \
  --resource-group rg-wizardworks-production \
  --template-file infrastructure/main.bicep \
  --parameters infrastructure/parameters/production.bicepparam \
  --parameters sqlAdminPassword=$SQL_ADMIN_PASSWORD

# Validate Bicep template
az bicep build --file infrastructure/main.bicep

# What-if deployment (preview changes)
az deployment group what-if \
  --resource-group rg-wizardworks-dev \
  --template-file infrastructure/main.bicep \
  --parameters infrastructure/parameters/dev.bicepparam
```

## Wizardworks Infrastructure Best Practices

1. **All Resources in Bicep**: Never create resources manually in portal
2. **Environment-Specific Parameters**: Separate parameter files for each environment
3. **Secrets in Key Vault**: Never hardcode secrets in Bicep or pipelines
4. **Tagging Strategy**: All resources must have tags (Environment, Application, ManagedBy)
5. **Multi-Stage Dockerfiles**: Optimize image size
6. **Automated Deployments**: CI/CD for all environments
7. **Infrastructure Testing**: Use `az deployment group what-if` before applying
8. **Version Control**: All infrastructure files in Git
9. **Documentation**: README in infrastructure folder
10. **Security**: Managed identities, HTTPS only, minimal permissions

**Remember**: Infrastructure as Code is mandatory at Wizardworks. All Azure resources must be defined in Bicep and deployed via automated pipelines.
