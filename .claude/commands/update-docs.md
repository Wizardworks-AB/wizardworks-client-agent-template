---
name: update-docs
description: Update documentation to match code changes
argument-hint: [component or feature name]
---

# Update Documentation Command

This command helps keep documentation synchronized with code changes. Documentation must be maintained as code evolves to prevent information decay.

## How to run it — delegate, do not do it inline

**Spawn the `doc-updater` agent.** The sections below describe what that agent covers; they are
the brief you hand it, not a checklist for the main session.

Two reasons this matters. The agent works in its own context, so reading the change and the existing docs costs you almost none
of your own. And it carries its own model in frontmatter (`agents/doc-updater.md`), chosen for
this job — doing the work inline silently runs it on whatever model your session is on.

## Usage

```bash
/update-docs                              # Review and update all changed docs
/update-docs <component>                  # Update docs for a specific component
/update-docs api-endpoints                # Update API documentation
/update-docs setup-guide                  # Update setup/installation docs
/update-docs architecture                 # Update architecture documentation
/update-docs --audit                      # Audit all documentation
```

## What This Command Does

1. **Spawns Documentation Agent**: Launches the documentation specialist
2. **Scans Code Changes**: Finds what changed in recent commits
3. **Identifies Outdated Docs**: Detects documentation that's out of sync
4. **Suggests Updates**: Provides specific documentation updates needed
5. **Generates Examples**: Creates code examples from actual code
6. **Validates Links**: Checks for broken references and links
7. **Updates API Docs**: Regenerates API documentation from code
8. **Maintains Table of Contents**: Keeps navigation current

## Documentation Types

Keep documentation proportional — update what changed, don't manufacture docs that don't exist.

### 1. API Documentation

Document for each endpoint: URL and method, request parameters and types, response format and types, error codes, authentication requirements, rate limiting, and a working example request/response.

### 2. Architecture Documentation

Document the system design and diagram, component responsibilities, data flow, integration points, technology choices with rationale, and deployment architecture. Show internal models vs boundary contracts (DTOs) where relevant, and record key design decisions.

### 3. Developer Guide

Document how to: set up the dev environment, run the app locally, run tests, build the container, deploy, and troubleshoot common issues. Use the actual commands for this project's stack (see `rules/<stack>.md`).

### 4. Configuration Documentation

Document environment variables and config files (name, type, required, description, example), plus how secrets are managed — sourced from a secrets manager or environment variables, never committed.

### 5. Data Schema Documentation

Document table/collection schemas, relationships, indexes, and migration history.

## Maintaining Documentation

### When to Update

Update documentation when:
- Adding new API endpoints
- Changing data models
- Modifying architecture
- Adding configuration options
- Updating the deployment process
- Adding features
- Fixing bugs that affect documented behavior

### Documentation Quality Checklist

- [ ] Accurate and current
- [ ] Examples are valid and tested
- [ ] All code examples work
- [ ] Links are valid and not broken
- [ ] Consistent formatting
- [ ] Clear and concise language
- [ ] Table of contents is current
- [ ] API docs match actual endpoints
- [ ] Setup instructions work end-to-end
- [ ] Architecture diagrams are accurate
- [ ] Configuration docs complete
- [ ] Troubleshooting section helpful

## Documentation Standards

- Use standard Markdown with a clear heading hierarchy.
- For every code example, state what it does, prerequisites, steps, and expected output.
- Use ASCII art or Mermaid for diagrams.
- Generate API docs from code where the stack supports it (e.g. OpenAPI/Swagger, typedoc, or equivalent), and keep inline doc comments on public APIs.

## Documentation Audit

Periodically audit documentation — check for broken links, find outdated `TODO`/`FIXME`/`DEPRECATED` references, and verify examples still run.

## When to Use This Command

- After implementing new features
- After API changes
- After architecture changes
- During code reviews
- Before releases
- When onboarding new team members
- When a documentation audit is due

## Related Commands

- Use `/code-review` to identify documentation gaps
- Use `/plan` when documenting architecture
- Use `/refactor-clean` when restructuring code

**Remember**: If it's not documented, it doesn't exist. Keep docs current.
