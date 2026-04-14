---
name: plan
description: Start planning workflow for complex features - gather requirements and design architecture
usage: /plan [feature description]
---

# Planning Command

This command initiates the Wizardworks planning workflow for complex features. Use this BEFORE starting TDD to ensure proper design and architecture.

## Usage

```bash
/plan implement semantic search for magic items
/plan add real-time collaboration features
/plan redesign authentication system for multi-tenant
/plan build data export pipeline
```

## What This Command Does

1. **Spawns Architect Agent**: Launches the Wizardworks architect agent
2. **Requirements Analysis**: Gathers functional and non-functional requirements
3. **Architecture Design**: Creates system design with architecture diagrams
4. **Trade-Off Analysis**: Documents design decisions with pros/cons
5. **Infrastructure Planning**: Plans Azure resources and deployment strategy
6. **Implementation Roadmap**: Creates a phased implementation plan

## Planning Workflow

### Step 1: Requirements Gathering

The agent will help you clarify:

**Functional Requirements**:
- User stories and use cases
- API contracts and endpoints
- Data models and relationships
- UI/UX flows

**Non-Functional Requirements**:
- Performance targets (latency, throughput)
- Scalability requirements (expected load)
- Security requirements (authentication, data protection)
- Availability targets (uptime SLA)
- Compliance requirements

### Step 2: Current State Analysis

Understand existing Wizardworks architecture:

- Review controller-service-repository pattern
- Identify existing components to reuse
- Check public ID usage
- Assess database schema impact
- Review related services

### Step 3: Design Proposal

Create high-level architecture:

```
Frontend (React)
    ↓ HTTPS/REST API
API Gateway (Optional)
    ↓
Backend (.NET)
  - Controllers Layer
  - Services Layer
  - Repositories Layer
    ↓
Database (SQL Server/PostgreSQL)
```

### Step 4: Trade-Off Analysis

Document decisions with examples:

**Decision: Use EF Core vs Dapper**

**Options**:
1. Entity Framework Core - ORM, LINQ support
2. Dapper - Lightweight, performance-optimized
3. Hybrid - EF Core + Dapper for specific queries

**Analysis**:

**EF Core**
- Pros: Type-safe, built-in migrations, relationships
- Cons: Performance overhead for large batches
- Wizardworks Alignment: Default choice, aligns with infrastructure

**Dapper**
- Pros: High performance, minimal overhead
- Cons: Manual mapping, no relationship tracking
- Wizardworks Alignment: Allowed for performance-critical scenarios

**Hybrid**
- Pros: Best of both worlds
- Cons: More complexity
- Wizardworks Alignment: Accepted pattern

### Step 5: Infrastructure Planning

Plan Azure deployment with Bicep:

- App Service/Container Apps
- SQL Database
- Azure Key Vault
- Redis (if caching needed)
- Application Insights
- Storage accounts
- CDN (if needed)

### Step 6: Implementation Roadmap

Create phased approach:

**Phase 1: Core Infrastructure**
- Set up Bicep templates
- Configure Azure resources
- Set up Docker containers

**Phase 2: API Layer**
- Implement controllers
- Add data validation
- Set up authentication

**Phase 3: Business Logic**
- Implement services
- Add business rules
- Implement public ID generation

**Phase 4: Data Access**
- Implement repositories
- Set up EF Core migrations
- Optimize queries

**Phase 5: Frontend Integration**
- Build React components
- Set up TanStack Query
- Add error handling

**Phase 6: Testing & Validation**
- Write tests (80%+ coverage)
- E2E testing
- Performance testing

## When to Use This Command

- **Starting new features** (medium to large scope)
- **Architectural refactoring**
- **System redesigns**
- **Multi-service integrations**
- **Performance optimization projects**
- **Infrastructure changes**

**When NOT to use**: Simple bug fixes or small feature additions - use `/tdd` directly instead.

## Example Planning Session

```
User: /plan implement real-time notifications system

Agent: I'll help you plan the real-time notifications system using Wizardworks standards.

Step 1: Requirements Analysis
Let me clarify some requirements:

Functional:
- What types of notifications? (user actions, system events, batch jobs?)
- Who needs to receive them? (specific users, roles, broadcast?)
- Delivery channels? (in-app, email, SMS, push?)
- Persistence? (store history, archive, real-time only?)

Non-Functional:
- Expected volume? (notifications/second)
- Latency target? (milliseconds?)
- Availability? (99.9% uptime?)
- Retention? (how long to keep history?)

Step 2: Current State Analysis
Looking at Wizardworks architecture:
- We have controller-service-repository pattern
- Public ID usage for all entities
- TanStack Query on frontend
- No existing notification system
- API runs on ASP.NET Core

Step 3: Design Proposal
I recommend:

Notification System Architecture:
┌─────────────┐
│   React     │
│  Frontend   │
└──────┬──────┘
       │ WebSocket/SignalR
┌──────▼──────────────────┐
│   ASP.NET Core API      │
│  - NotificationService  │
│  - NotificationHub      │
│  - NotificationRepo     │
└──────┬──────────────────┘
       │
┌──────▼──────────────────┐
│   SQL Database          │
│  - Notifications table  │
│  - User preferences     │
│  - Notification history │
└─────────────────────────┘

Step 4: Technology Decisions

Decision: SignalR vs WebSockets

Options:
1. SignalR - Managed WebSocket/fallback
2. Raw WebSockets - Lower level control
3. Server-Sent Events - One-way real-time

Selected: SignalR
Rationale:
- Built-in with ASP.NET Core
- Fallback support for older browsers
- Connection management handled
- Integrates well with dependency injection
- Wizardworks standard for real-time

Step 5: Infrastructure Plan
Azure resources needed:
- App Service with SignalR co-hosting or
- SignalR Service (for scale-out)
- SQL Database for persistence
- Cache (optional Redis for dedup)

Step 6: Implementation Roadmap

Phase 1: Backend Infrastructure (Day 1-2)
- Add SignalR to ASP.NET project
- Create Notification entity and repository
- Create NotificationService
- Create NotificationHub

Phase 2: API Layer (Day 3)
- NotificationController endpoints
- Authentication on hub
- Broadcasting logic

Phase 3: Frontend (Day 4-5)
- Create useNotifications hook
- React component to display notifications
- Error handling

Phase 4: Testing & Polish (Day 6-7)
- Write unit tests
- Integration tests
- E2E tests
- Reach 80%+ coverage

Next: Use /tdd to implement each phase following TDD workflow.
```

## Wizardworks Architecture Principles

All plans follow these mandatory principles:

### 1. Layered Architecture (Controller-Service-Repository)

```csharp
// Controllers: HTTP only
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateMagicDto dto)
{
    var result = await _service.CreateAsync(dto);
    return Ok(result);
}

// Services: Business logic only
public async Task<MagicDto> CreateAsync(CreateMagicDto dto)
{
    var publicId = GeneratePublicId();
    var entity = new Magic { PublicMagicId = publicId, Name = dto.Name };
    return await _repository.CreateAsync(entity);
}

// Repositories: Data access only
public async Task<Magic> CreateAsync(Magic entity)
{
    _context.Magics.Add(entity);
    await _context.SaveChangesAsync();
    return entity;
}
```

### 2. Public ID Pattern (Never Expose Database IDs)

```csharp
// Entity has both internal ID and public ID
public class Magic
{
    public int MagicId { get; set; }           // Never exposed
    public string PublicMagicId { get; set; }   // Exposed in APIs
}

// DTO only contains public ID
public class MagicDto
{
    public string PublicMagicId { get; set; }
    public string Name { get; set; }
}

// API uses public ID
[HttpGet("{publicMagicId}")]
public async Task<IActionResult> Get(string publicMagicId)
{
    var magic = await _service.GetByPublicIdAsync(publicMagicId);
    return Ok(magic);
}
```

### 3. DTO Pattern (All Boundaries)

- API inputs → use DTOs
- API outputs → use DTOs
- Internal services → use entities
- Clear separation maintained

### 4. Test-Driven Development (Before Implementation)

All code must have:
- Unit tests (service layer)
- Integration tests (API layer)
- E2E tests (critical flows)
- 80%+ coverage minimum

### 5. Infrastructure as Code (Bicep)

All Azure resources defined in versioned Bicep templates:
- No manual Azure Portal changes
- Environment-specific parameters
- Automated deployments

## Plan Checklist

Before starting implementation:

- [ ] Requirements documented (functional & non-functional)
- [ ] Current state analyzed
- [ ] Architecture diagram created
- [ ] All design decisions documented with trade-offs
- [ ] Data models specified (entities and DTOs)
- [ ] API contracts defined
- [ ] Infrastructure resources planned (Bicep)
- [ ] Implementation roadmap created
- [ ] Team alignment on plan

## Related Commands

- Use `/tdd` after planning to implement each phase
- Use `/code-review` during implementation
- Use `/security-review` for security-specific features
- Use `/build-fix` if infrastructure deployment fails
- Use `/e2e` for critical user flow testing

## As a Wizardworks Employee

Planning BEFORE implementation is mandatory for complex features. It prevents:
- Rework and technical debt
- Security vulnerabilities
- Performance issues
- Architectural violations
- Integration problems

Good planning enables rapid, confident development.

**Remember**: Proper planning prevents poor performance. Think before you code.
