Wizardworks TDD Playbook (Concise)

Purpose
Wizardworks-specific TDD constraints and routing rules.
Reference-only. Not loaded by default.

TDD Constraints (AI work)
- Tests first: Red → Green → Refactor.
- Coverage: 80%+ required for AI workflows (exceptions must be justified).
- Backend: Controller → Service → Repository (no layer skipping).
- Controllers: no business logic.
- DTOs required at API boundaries.
- Never expose DB IDs externally (Public IDs only).
- Security rules apply always (no secrets, validate inputs).

Test Choice
- Start with unit tests for business rules + validation + error paths.
- Add integration tests for API + persistence + DTO contracts.
- Add E2E only for critical user flows (auth, multi-step, cross-page, data integrity).

Routing / Escalation
- planner: unclear requirements
- architect: design/structure decisions
- security-reviewer: auth, data, external APIs
- e2e-runner: critical flows
- code-reviewer: before merge
- refactor-cleaner: cleanup post-green
- doc-updater: merge readiness

Not a tutorial. Not a template library.
End.
