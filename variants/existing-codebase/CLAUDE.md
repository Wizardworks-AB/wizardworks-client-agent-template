# [CUSTOMER_NAME] — Client Agent (Existing Codebase)

## Project

- **Customer:** [CUSTOMER_NAME]
- **Domain:** [DOMAIN_DESCRIPTION]
- **Code repository:** ~/code/[PROJECT_NAME]/
- **Tech stack:** [TECH_STACK — document the customer's actual stack]

## Project-Specific Notes

Add any project-specific context here:
- Technology choices that differ from standard (e.g., "Uses Dapper, not EF Core")
- Legacy patterns to follow
- Domain-specific terminology
- Key contacts or resources

---

## Existing Codebase — Key Principle

**Follow the customer's patterns, not ours.**

### Step 0: Analyze Existing Codebase

Before any implementation, understand the codebase:

1. **ANALYZE** — Read existing code, identify patterns, document architecture
2. **DOCUMENT** — Record patterns, deviations from Wizardworks standard, tech debt
3. **ALIGN** — Agree with customer on which patterns to follow

#### What to analyze

- **Architecture pattern** — Is it CSR? MVC? CQRS? Something else? Follow it.
- **Naming conventions** — camelCase? PascalCase? snake_case? Match existing.
- **Error handling** — How does the codebase handle errors? Be consistent.
- **Testing patterns** — What test framework? What style? Follow it.
- **Dependencies** — What libraries are used? Don't introduce competing alternatives.

#### Document in this file

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

### Follow, Don't Impose

- **DO**: Follow existing naming, patterns, error handling
- **DON'T**: Introduce Wizardworks patterns where the codebase uses something else
- **DO**: Suggest gradual improvements when asked
- **DON'T**: Rewrite working code to match our standards

### Gradual Improvement

When the customer asks for improvements:
1. Propose changes incrementally
2. One pattern at a time
3. Never mix feature work with pattern migration
4. Get explicit approval before changing established patterns

### Hooks

Not all hooks apply to existing codebases. See `.claude/rules/hooks.md` for which to keep and which to disable.

### Non-Negotiable (Even in Existing Codebases)

- **Security**: No hardcoded secrets, validate inputs, parameterized queries
- **Testing**: Write tests for new code (follow existing test framework/style)
- **Code review**: Every change gets reviewed
- **No regressions**: New code must not break existing functionality

## Reference

All Wizardworks standards, Fae knowledge graph instructions, and workflow guides load automatically from `.claude/rules/` and `.claude/CONSTITUTION.md`.

When the customer's codebase has no established pattern, reference Wizardworks skills:
- `.claude/skills/backend-patterns-dotnet/`
- `.claude/skills/frontend-patterns-react/`
- `.claude/skills/infrastructure-as-code/`
