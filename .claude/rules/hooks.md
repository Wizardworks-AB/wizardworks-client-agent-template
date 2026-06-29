# Automated Hooks

15 hooks run automatically when the agent writes code. They are defined in `.claude/hooks/hooks.json`.

## Blocking (Will Stop You)

- **Check for Hardcoded Secrets** — No API keys, passwords, tokens in code. **Never disable this.**

## Warning (Will Tell You)

- **Check Database ID Exposure** — Use Public IDs, not database IDs
- **Enforce DTO Usage** — Use DTOs in Controllers
- **Layer Separation Check** — Respect Controller-Service-Repository pattern
- **Check console.log** — Remove debug statements
- **Async/Await Check** — Proper async patterns
- **Immutability Check** — No state mutations in React
- **TanStack Query Check** — Use TanStack for data fetching

## Reminders (Will Prompt You)

- **Check Test Coverage** — 100% passing, 80%+ coverage
- **Verify TDD Workflow** — Tests first
- **Infrastructure as Code** — Use Bicep
- **Security Review Reminder** — Check security
- **Docker Configuration** — Update containers
- **Code Review Reminder** — Run /code-review

## Knowledge Graph (Fae)

- **Record Operational Event** — When you mention a deploy, rollback, incident, outage, hotfix, or release, nudges you to capture it with `record_episode(title, content, occurredAt)` (a time-stamped event) instead of `remember("fact", ...)`, and to `record_outcome` if it is the realized result of a past decision/plan. See `.claude/rules/fae.md`.

## Adjusting Hooks for Existing Codebases

Some hooks may conflict with a customer's existing patterns. Review and disable those that do not apply:

| Hook | When to disable |
|------|-----------------|
| `check-dto-usage` | Customer uses different DTO patterns |
| `check-layer-separation` | Customer has different architectural layering |
| `check-public-ids` | Customer exposes database IDs |
| `check-immutability` | Customer prefers mutable patterns |
| `check-tanstack-query` | Customer uses a different data fetching library |

**Always keep `check-secrets` active.** To disable a hook, comment it out or remove it from `.claude/hooks/hooks.json`.
