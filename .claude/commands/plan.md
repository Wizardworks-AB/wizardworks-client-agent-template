---
name: plan
description: Start planning workflow for complex features - gather requirements and design architecture
argument-hint: [feature description]
---

# Planning Command

This command initiates the planning workflow for complex features. Use this BEFORE implementation to ensure proper design and architecture.

## How to run it — delegate, do not plan inline

**Spawn the `planner` agent and have it produce the plan.** Do not work through the sections
below yourself in the main session: they describe what the *planner* covers, and they are the
brief you hand it.

This matters for two reasons. The planner runs in its own context, so reading the codebase to
build the plan costs you almost none of your own. And it carries its own model in frontmatter
(`agents/planner.md`) chosen for exactly this job — planning inline silently runs the work on
whatever model your session happens to be on instead.

Give the planner: the feature description, the acceptance criteria if they exist, the relevant
stack rules, and anything the knowledge graph already knows about the area. Ask it back for a
plan that opens with what gets built and the decisions still open, then the acceptance
criteria and an ordered task breakdown with dependencies, risks and complexity estimates
(`rules/writing.md`).

The one exception is a change small enough that a plan is a sentence — then you do not need
`/plan` at all.

## Usage

```bash
/plan implement semantic search for items
/plan add real-time collaboration features
/plan redesign authentication for multi-tenant
/plan build data export pipeline
```

## What This Command Does

1. **Spawns the planner agent** (see above — this is the command's whole point)
2. **Requirements Analysis**: Gathers functional and non-functional requirements
3. **Architecture Design**: Creates a system design with diagrams
4. **Trade-Off Analysis**: Documents design decisions with pros/cons
5. **Infrastructure Planning**: Plans required resources and deployment strategy
6. **Implementation Roadmap**: Creates a phased implementation plan

## Planning Workflow

### Step 1: Requirements Gathering

Clarify:

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

Understand the existing architecture (follow the stack overlay `rules/<stack>.md` and existing codebase conventions):

- Review the current layering / separation of concerns
- Identify existing components to reuse
- Check identifier and boundary-contract conventions
- Assess data-model/schema impact
- Review related services

### Step 3: Design Proposal

Create a high-level architecture appropriate to your stack, for example:

```
Client / UI
    ↓ API (HTTP/REST/GraphQL/etc.)
Application / Service layer
    ↓
Data access layer
    ↓
Datastore
```

### Step 4: Trade-Off Analysis

Document each significant decision with options, pros/cons, and the rationale for the choice. Prefer options that align with the project's existing conventions unless there's a clear reason to diverge.

### Step 5: Infrastructure Planning

Plan the resources needed (compute, datastore, secrets store, cache, observability, storage/CDN as relevant), defined as infrastructure-as-code where the project supports it.

### Step 6: Implementation Roadmap

Create a phased approach, for example:

1. **Core infrastructure** — resources, containers, config
2. **API layer** — endpoints, validation, auth
3. **Business logic** — services and rules
4. **Data access** — repositories/queries, migrations
5. **Frontend integration** — UI, data fetching, error handling
6. **Testing & validation** — integration tests at the boundary, e2e for the critical flow

## When to Use This Command

- Starting new features (medium to large scope)
- Architectural refactoring
- System redesigns
- Multi-service integrations
- Performance optimization projects
- Infrastructure changes

**When NOT to use**: inside `/feature`, which spawns the planner itself in step 1 — run `/plan` on its own when you want the design without the rest of the flow.

## Architecture Principles

All plans should follow the project's core principles. Common ones:

1. **Layered architecture** — keep transport, business logic, and data access separated; don't skip layers.
2. **Stable public identifiers** — expose public IDs externally, never internal/database IDs.
3. **Boundary contracts** — use dedicated types (DTOs) at API boundaries; don't leak internal models.
4. **Tests with the code** — integration and e2e where they carry their weight; no coverage percentage.
5. **Infrastructure as code** — resources defined in versioned templates, no manual portal changes.

## Plan Checklist

Before starting implementation:

- [ ] Requirements documented (functional & non-functional)
- [ ] Current state analyzed
- [ ] Architecture diagram created
- [ ] All design decisions documented with trade-offs
- [ ] Data models specified (internal models and boundary contracts)
- [ ] API contracts defined
- [ ] Infrastructure resources planned
- [ ] Implementation roadmap created
- [ ] Team alignment on plan

## Related Commands

- Use `/feature` to implement the phases
- Use `/code-review` during implementation
- Use `/security-review` for security-specific features
- Use `/build-fix` if infrastructure deployment fails
- Use `/e2e` for critical user flow testing

**Remember**: Proper planning prevents poor performance. Think before you code.
