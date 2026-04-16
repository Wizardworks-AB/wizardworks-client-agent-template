# [CUSTOMER_NAME] — Client Agent (Maintenance)

## Project

- **Customer:** [CUSTOMER_NAME]
- **Domain:** [DOMAIN_DESCRIPTION]
- **Code repository:** ~/code/[PROJECT_NAME]/
- **Tech stack:** [TECH_STACK]

## Project-Specific Notes

Add any project-specific context here:
- Known issues and tech debt
- SLA and response time requirements
- Key contacts for escalation
- Environment details (staging, production URLs)

---

## Maintenance — Key Principle

**Small changes, fast cycles, zero regressions.**

### The Workflow

Maintenance work is bug-focused with fast turnaround:

```
BUG/TASK RECEIVED
     ↓
  1. TRIAGE        Assess severity, impact, urgency
  2. REPRODUCE     Write a failing test that proves the bug
  3. FIX           Minimal change to make the test pass
  4. REVIEW        /code-review — verify no regressions
  5. SHIP          /commit — validate, document, deploy
     ↓
DEPLOYED
```

### Triage

Classify incoming issues:

| Severity | Response | Example |
|----------|----------|---------|
| **Critical** | Immediate hotfix | System down, data loss, security breach |
| **High** | Same day | Core feature broken, many users affected |
| **Medium** | Within sprint | Minor feature broken, workaround exists |
| **Low** | Backlog | Cosmetic issue, minor inconvenience |

### Bug Fix Workflow

**1. Reproduce** — `/tdd` write a test that reproduces the bug. It should fail now and pass after the fix.

**2. Fix** — Minimal changes only.
- No "while I'm here" improvements
- No refactoring adjacent code
- No upgrading dependencies
- Minimal diff = minimal risk

**3. Review** — `/code-review` with focus on regressions.

**4. Ship** — `/commit`

### Proactive Monitoring

For projects with monitoring access:
- Review error logs for new errors and increasing trends
- Check performance degradation
- Generate periodic maintenance reports (bugs fixed, open issues, health, recommendations)

### Key Differences from Feature Development

| Aspect | Feature Development | Maintenance |
|--------|-------------------|-------------|
| Scope | Full feature lifecycle | Bug fixes, patches |
| Planning | Extensive (`/plan`) | Minimal (triage) |
| Changes | Large, architectural | Small, surgical |
| Testing | Full TDD cycle | Reproduce → Fix → Verify |
| Cycle time | Days/weeks | Hours/days |
| Risk tolerance | Medium | Very low |

### Non-Negotiable

- **Test first**: Always write a reproducing test before fixing
- **Minimal changes**: Fix the bug, nothing else
- **No regressions**: Run full test suite before shipping
- **Security**: Same security standards as new development

## Reference

All Wizardworks standards, Fae knowledge graph instructions, and workflow guides load automatically from `.claude/rules/` and `.claude/CONSTITUTION.md`.
