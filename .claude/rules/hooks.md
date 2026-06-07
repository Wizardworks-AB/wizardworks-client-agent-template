# Automated Hooks

16 hooks run automatically as the agent works (writing code, committing, or discussing operations). They are defined in `.claude/hooks/hooks.json`.

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

These prompt you to keep the shared Fae knowledge graph current (see `.claude/rules/fae.md`):

- **Save Commit to Knowledge Graph** — after a `git commit`, prompts `remember("fact", …)` (auto-save trigger 1).
- **Record Operational Event** — when you mention a deploy/rollback/incident/outage, nudges `record_episode(…)` (and `record_outcome` if it's the result of a past decision) instead of a generic fact.

The **session-start `briefing(sinceLastSession: true)`** reminder is intentionally NOT a hook — this hook runner has no session-lifecycle event, and firing on every message would be noise. It's enforced by the "Session Start" section and the first rule in `.claude/rules/fae.md`.

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
