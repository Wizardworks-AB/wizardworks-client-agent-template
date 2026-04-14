# [CUSTOMER_NAME] — Client Agent (Existing Codebase)

## Project

- **Customer:** [CUSTOMER_NAME]
- **Domain:** [DOMAIN_DESCRIPTION]
- **Code repository:** ~/code/[PROJECT_NAME]/
- **Tech stack:** [TECH_STACK — document the customer's actual stack]
- **Fae URL:** [FAE_REMINDR_URL]

## Project-Specific Notes

Add any project-specific context here:
- Technology choices that differ from standard (e.g., "Uses Dapper, not EF Core")
- Legacy patterns to follow
- Domain-specific terminology
- Key contacts or resources

---

# Wizardworks Development Standard — Existing Codebase

This is how Wizardworks works in existing codebases.

**Key principle: Follow the customer's patterns, not ours.**

---

## Step 0: Analyze Existing Codebase

Before any implementation, understand the codebase:

```
1. ANALYZE     Read existing code, identify patterns, document architecture
2. DOCUMENT    Record patterns, deviations from Wizardworks standard, tech debt
3. ALIGN       Agree with customer on which patterns to follow
```

### What to analyze

- **Architecture pattern** — Is it CSR? MVC? CQRS? Something else? Follow it.
- **Naming conventions** — camelCase? PascalCase? snake_case? Match existing.
- **Error handling** — How does the codebase handle errors? Be consistent.
- **Testing patterns** — What test framework? What style? Follow it.
- **Dependencies** — What libraries are used? Don't introduce competing alternatives.

### Document in this file

After analysis, add sections below:

```markdown
## Codebase Patterns

### Architecture
[Describe the pattern used]

### Naming
[Describe conventions]

### Testing
[Framework, style, coverage expectations]

### Key Deviations from Wizardworks Standard
[List what differs and WHY we follow the customer's way]
```

---

## The Workflow

Every feature, every bug fix follows this workflow — adapted for existing codebases:

```
TASK RECEIVED
     ↓
┌─────────────────────────────────────────────────────────────────┐
│  1. PLAN          /plan [feature]                               │
│                   Analyze impact on existing code               │
├─────────────────────────────────────────────────────────────────┤
│  2. DESIGN        architect agent                               │
│                   Fit design into existing architecture         │
├─────────────────────────────────────────────────────────────────┤
│  3. IMPLEMENT     /tdd-test then /tdd-implement                  │
│                   Follow EXISTING patterns, not Wizardworks     │
├─────────────────────────────────────────────────────────────────┤
│  4. REVIEW        /code-review                                  │
│                   Check consistency with existing codebase      │
├─────────────────────────────────────────────────────────────────┤
│  5. SECURE        /security-review                              │
│                   Check for vulnerabilities                     │
├─────────────────────────────────────────────────────────────────┤
│  6. VERIFY        /e2e run                                      │
│                   Test critical user flows                      │
├─────────────────────────────────────────────────────────────────┤
│  7. DOCUMENT      /update-docs                                  │
│                   Keep documentation current                    │
└─────────────────────────────────────────────────────────────────┘
     ↓
READY TO MERGE
```

---

## Key Differences from Greenfield

### Follow, don't impose
- **DO**: Follow existing naming, patterns, error handling
- **DON'T**: Introduce Wizardworks patterns where the codebase uses something else
- **DO**: Suggest gradual improvements when asked
- **DON'T**: Rewrite working code to match our standards

### Hooks
Not all Wizardworks hooks apply to existing codebases. Review and disable hooks that conflict with the customer's patterns:

```json
// In .claude/hooks/hooks.json - disable hooks that don't apply
```

Hooks to typically keep:
- `check-secrets.js` — Always relevant
- `check-console-log.js` — Usually relevant

Hooks to review/disable:
- `check-dto-usage.js` — Only if codebase uses DTOs
- `check-layer-separation.js` — Only if codebase uses CSR
- `check-public-ids.js` — Only if codebase uses public IDs
- `check-immutability.js` — Only if codebase uses immutable patterns
- `check-tanstack-query.js` — Only if codebase uses TanStack

### Gradual improvement
When the customer asks for improvements:
1. Propose changes incrementally
2. One pattern at a time
3. Never mix feature work with pattern migration
4. Get explicit approval before changing established patterns

---

## Non-Negotiable Standards (Even in Existing Codebases)

These apply regardless:

- **Security**: No hardcoded secrets, validate inputs, parameterized queries
- **Testing**: Write tests for new code (follow existing test framework/style)
- **Code review**: Every change gets reviewed
- **No regressions**: New code must not break existing functionality

---

## Technology Stack

Follow the customer's stack. Reference Wizardworks patterns only when the customer's codebase has no established pattern for something new.

---

## Reference

| Document | Purpose |
|----------|---------|
| [.claude/CONSTITUTION.md](.claude/CONSTITUTION.md) | Engineering principles |
| [.claude/DOC.md](.claude/DOC.md) | Complete usage guide |
| [.claude/hooks/README.md](.claude/hooks/README.md) | Hook system details |

### Skills (Pattern Libraries)
Use as reference when the customer has no established pattern:
- `.claude/skills/backend-patterns-dotnet/` - .NET/C# patterns
- `.claude/skills/frontend-patterns-react/` - React/TypeScript patterns
- `.claude/skills/infrastructure-as-code/` - Bicep/Docker patterns

---

## Fae Knowledge Graph (Remindr MCP)

This agent is connected to the Fae knowledge graph via Remindr MCP. The knowledge graph is a shared, persistent memory across all agents and sessions working on this project.

> For full tool reference with all parameters, see the greenfield CLAUDE.md. This section highlights the session flow and existing-codebase-specific guidance.

### Session Flow

1. **Session start** → `briefing(sinceLastSession: true)` — Orient yourself. Check recent decisions, active blockers, unread messages.
2. **Check messages** → `inbox()` then `read_thread(threadId)` — Check for updates from other agents.
3. **Before implementation** → `context(query)` — Search for existing knowledge, codebase patterns, known gotchas.
4. **After decisions** → `decide(decision, rationale, alternatives)` — Document every decision with rationale and alternatives. Critical in existing codebases where decisions about following vs. deviating from customer patterns must be traceable. Remindr auto-detects contradictions.
5. **Codebase patterns** → `remember("preference", title, content)` — Save customer-specific conventions, patterns, and deviations from Wizardworks defaults.
6. **Gotchas** → `remember("gotcha", title, content)` — Save non-obvious behavior, quirks, and workarounds.
7. **Blockers** → `block(description, urgency)` / `resolve(nodeId, resolution)` — Track immediately with urgency level.
8. **Communication** → `send(to, subject, content)` / `inbox()` — Coordinate with other agents. Use `"*"` for broadcast.
9. **Session end** → `remember("state", title, content)` — Persist session state.

### Rules

- **ALWAYS** use `decide()` (not `remember`) for decisions — especially when choosing to follow or deviate from customer patterns. Include `alternatives` and `rationale`.
- **ALWAYS** run `briefing(sinceLastSession: true)` at session start.
- **ALWAYS** save customer-specific patterns with `remember("preference", ...)` when discovering codebase conventions.
- **ALWAYS** document gotchas with `remember("gotcha", ...)`.
- **ALWAYS** check `inbox()` at session start.
- **PREFER** `propose(content)` when observing something but unsure how to classify it — let Sage decide.

---

*The Wizardworks Way — Respecting Existing Codebases*
