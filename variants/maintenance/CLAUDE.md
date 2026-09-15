# {{ORGANIZATION_NAME}} — Client Agent (Maintenance)

> Placeholders like `{{PROJECT_NAME}}` are filled in by Fae when you download
> this template with a project selected. Anything marked `[FILL IN]` you
> complete yourself.

## Project

- **Customer:** {{ORGANIZATION_NAME}}
- **Project:** {{PROJECT_DISPLAY_NAME}} (`{{PROJECT_NAME}}`)
- **Domain:** [FILL IN: what the product/system does, in two sentences]
- **Code repository:** [FILL IN: e.g. `~/code/<repo>/`]
- **Tech stack:** [FILL IN: the customer’s actual stack]

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

**1. Reproduce** — write a test that reproduces the bug. It should fail now and pass after the fix.

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
| Testing | Tests with the code | Reproduce → Fix → Verify |
| Cycle time | Days/weeks | Hours/days |
| Risk tolerance | Medium | Very low |

### Non-Negotiable

- **Reproduce**: Always write a reproducing test with the fix
- **Minimal changes**: Fix the bug, nothing else
- **No regressions**: Run full test suite before shipping
- **Security**: Same security standards as new development

## Reference

Engineering standards for {{ORGANIZATION_NAME}}, Fae knowledge graph instructions, and workflow guides load automatically from `.claude/rules/` and `.claude/CONSTITUTION.md`. Stack-specific rules and skills come from the stack overlay(s) selected at download and appear as `.claude/rules/<stack>.md`.

## Template

- Variant: `{{TEMPLATE_VARIANT}}` version `{{TEMPLATE_VERSION}}`, downloaded from Fae.
- `fae-template.json` holds the download metadata; a session-start hook checks
  Fae for newer template versions and tells you when to re-download.
