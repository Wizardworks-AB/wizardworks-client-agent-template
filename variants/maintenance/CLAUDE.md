# [CUSTOMER_NAME] — Client Agent (Maintenance)

## Project

- **Customer:** [CUSTOMER_NAME]
- **Domain:** [DOMAIN_DESCRIPTION]
- **Code repository:** ~/code/[PROJECT_NAME]/
- **Tech stack:** [TECH_STACK]
- **Fae URL:** [FAE_REMINDR_URL]

## Project-Specific Notes

Add any project-specific context here:
- Known issues and tech debt
- SLA and response time requirements
- Key contacts for escalation
- Environment details (staging, production URLs)

---

# Wizardworks Development Standard — Maintenance

This is how Wizardworks handles maintenance and support projects.

**Key principle: Small changes, fast cycles, zero regressions.**

---

## The Workflow

Maintenance work is bug-focused with fast turnaround:

```
BUG/TASK RECEIVED
     ↓
┌─────────────────────────────────────────────────────────────────┐
│  1. TRIAGE        Assess severity, impact, urgency              │
├─────────────────────────────────────────────────────────────────┤
│  2. REPRODUCE     Write a failing test that proves the bug      │
├─────────────────────────────────────────────────────────────────┤
│  3. FIX           Minimal change to make the test pass          │
├─────────────────────────────────────────────────────────────────┤
│  4. REVIEW        /code-review — verify no regressions          │
├─────────────────────────────────────────────────────────────────┤
│  5. SHIP          /commit — validate, document, deploy          │
└─────────────────────────────────────────────────────────────────┘
     ↓
DEPLOYED
```

---

## Triage

Classify incoming issues:

| Severity | Response | Example |
|----------|----------|---------|
| **Critical** | Immediate hotfix | System down, data loss, security breach |
| **High** | Same day | Core feature broken, many users affected |
| **Medium** | Within sprint | Minor feature broken, workaround exists |
| **Low** | Backlog | Cosmetic issue, minor inconvenience |

```
User: Triage this bug report:
      [paste from customer/support]

      Classify severity, identify root cause area, suggest fix approach.
```

---

## Bug Fix Workflow

### 1. Reproduce

```
User: /tdd Write a test that reproduces this bug:
      [bug description]
```

The test should:
- Fail with the current code (proves the bug exists)
- Pass after the fix (proves the fix works)
- Be specific enough to catch regressions

### 2. Fix

```
User: Fix this bug with minimal changes. Don't refactor surrounding code.
```

**Maintenance rule:** Fix the bug, nothing more.
- No "while I'm here" improvements
- No refactoring adjacent code
- No upgrading dependencies
- Minimal diff = minimal risk

### 3. Review

```
User: /code-review — focus on regressions
```

### 4. Ship

```
User: /commit
```

---

## Proactive Monitoring

For maintenance projects with monitoring access:

### Regular Health Checks

```
User: Review the latest error logs and identify:
      1. New errors since last check
      2. Increasing error trends
      3. Performance degradation
      4. Potential issues before they become bugs
```

### Reporting

Generate regular status reports:

```
User: Generate maintenance report for this period:
      - Bugs fixed
      - Open issues
      - System health
      - Recommendations
```

---

## Key Differences from Feature Development

| Aspect | Feature Development | Maintenance |
|--------|-------------------|-------------|
| Scope | Full feature lifecycle | Bug fixes, patches |
| Planning | Extensive (`/plan`) | Minimal (triage) |
| Changes | Large, architectural | Small, surgical |
| Testing | Full TDD cycle | Reproduce → Fix → Verify |
| Documentation | Feature docs | Bug fix notes |
| Cycle time | Days/weeks | Hours/days |
| Risk tolerance | Medium | Very low |

---

## Non-Negotiable Standards

Even in maintenance:

- **Test first**: Always write a reproducing test before fixing
- **Minimal changes**: Fix the bug, nothing else
- **No regressions**: Run full test suite before shipping
- **Security**: Same security standards as new development
- **Documentation**: Brief note on what was fixed and why

---

## Reference

| Document | Purpose |
|----------|---------|
| [.claude/CONSTITUTION.md](.claude/CONSTITUTION.md) | Engineering principles |
| [.claude/DOC.md](.claude/DOC.md) | Complete usage guide |

---

## Fae Knowledge Graph (Remindr MCP)

This agent is connected to the Fae knowledge graph via Remindr MCP. The knowledge graph is a shared, persistent memory across all agents and sessions working on this project.

> For full tool reference with all parameters, see the greenfield CLAUDE.md. This section highlights the maintenance-specific session flow.

### Session Flow

1. **Session start** → `briefing(sinceLastSession: true)` — Orient yourself. Check recent bugs, resolutions, active blockers, unread messages.
2. **Check messages** → `inbox()` then `read_thread(threadId)` — Check for updates from other agents.
3. **Before fixing** → `context(query)` — Search for related bugs, previous fixes, and known gotchas. The same issue may have been seen before.
4. **After fixing** → `decide(decision, rationale, alternatives)` — Document fix approach, what was wrong, and why this fix was chosen over alternatives.
5. **Gotchas** → `remember("gotcha", title, content)` — Save non-obvious findings for future debugging sessions.
6. **Blockers** → `block(description, urgency)` / `resolve(nodeId, resolution)` — Track immediately with urgency level.
7. **Communication** → `send(to, subject, content)` — Coordinate with other agents. Use `"*"` for broadcast.
8. **Session end** → `remember("state", title, content)` — Persist session state.

### Rules

- **ALWAYS** run `briefing(sinceLastSession: true)` at session start.
- **ALWAYS** search `context("similar bug")` before fixing — the same issue may have been seen before.
- **ALWAYS** document fixes with `decide()` including `rationale` and `alternatives` — decisions without reasoning are useless for future sessions.
- **ALWAYS** save gotchas with `remember("gotcha", ...)` that could help future debugging.
- **ALWAYS** check `inbox()` at session start.
- **PREFER** `propose(content)` when observing patterns (e.g., recurring bugs) but unsure how to classify them.

---

*The Wizardworks Way — Reliable Maintenance*
