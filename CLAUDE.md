# [CUSTOMER_NAME] — Client Agent

## Project

- **Customer:** [CUSTOMER_NAME]
- **Domain:** [DOMAIN_DESCRIPTION]
- **Code repository:** ~/code/[PROJECT_NAME]/
- **Tech stack:** [TECH_STACK or "See CONSTITUTION.md defaults"]

## Project-Specific Notes

Add any project-specific context here:
- Technology choices that differ from standard (e.g., "Uses Dapper, not EF Core")
- Legacy patterns to follow
- Domain-specific terminology
- Key contacts or resources

## Template Variants

This is the **greenfield** template. For other project types, see `variants/`:
- `existing-codebase/` — Follow customer patterns, gradual improvement
- `maintenance/` — Bug-focused, fast cycles, minimal changes

## Reference

All Wizardworks standards, workflows, and tool guides are in `.claude/rules/` and `.claude/CONSTITUTION.md`. They load automatically in every session — you do not need to reference them manually.

| Location | Contents |
|----------|----------|
| `.claude/CONSTITUTION.md` | Engineering principles, architectural standards, technology stack |
| `.claude/rules/workflow.md` | Development workflow (PLAN→DESIGN→IMPLEMENT→REVIEW→SECURE→VERIFY→DOCUMENT) |
| `.claude/rules/agents-and-commands.md` | 10 specialist agents, slash commands, parallel execution |
| `.claude/rules/fae.md` | Fae knowledge graph — how to use Remindr MCP tools |
| `.claude/rules/hooks.md` | 14 automated quality hooks |
| `.claude/rules/coding-style.md` | Naming conventions, file organization, code quality |
| `.claude/rules/testing.md` | TDD workflow, coverage requirements |
| `.claude/rules/security.md` | Security guidelines, secret management |
| `.claude/rules/git-workflow.md` | Commits, branches, PRs |
| `.claude/agents/` | Agent configurations (architect, code-reviewer, tdd-*, etc.) |
| `.claude/commands/` | Slash commands (/plan, /tdd-test, /code-review, etc.) |
| `.claude/hooks/` | Hook scripts and configuration |
| `.claude/skills/` | Pattern libraries (backend .NET, frontend React, IaC) |
