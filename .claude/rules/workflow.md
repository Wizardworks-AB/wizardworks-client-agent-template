# Wizardworks Development Workflow

## The Wizardworks Way

Every feature, every bug fix, every change follows this workflow:

```
TASK RECEIVED
     ↓
  1. PLAN          /plan [feature]              — Break down requirements, identify risks
  2. DESIGN        architect agent              — Validate architecture, approve design
  3. IMPLEMENT     /tdd-test then /tdd-implement — Write tests FIRST, then code (RED→GREEN→BLUE)
  4. REVIEW        /code-review                 — Verify quality, patterns, standards
  5. SECURE        /security-review             — Check for vulnerabilities
  6. VERIFY        /e2e run                     — Test critical user flows
  7. DOCUMENT      /update-docs                 — Keep documentation current
     ↓
READY TO MERGE
```

**NEVER SKIP STEPS.** Every step exists for a reason. "I'll do it later" = "I'll forget to do it."

## Feature Development

```bash
# Sequential (each depends on previous)
/plan add user authentication      # Break down requirements
architect validate design          # Approve architecture — BEFORE writing tests
/tdd-test user login               # Write failing tests (RED)
/tdd-implement user login          # Make tests pass (GREEN→REFACTOR)

# Parallel (no dependencies — run ALL of these)
/code-review + /security-review + /e2e + /update-docs
```

## Quick Bug Fix

```bash
/tdd-test login timeout issue      # Test that reproduces bug
/tdd-implement login timeout issue # Fix to make test pass
/code-review + /security-review + /e2e + /update-docs  # ALL validation (parallel)
```

## Self-Validation Loop

After ANY implementation, validate AND fix issues found:

```
/tdd-implement
     ↓
/code-review + /security-review + /update-docs (PARALLEL)
     ↓
Issues found? → FIX → Re-run reviews
     ↓
All clean? → DONE
```

Fix issues immediately — don't just report them. Re-run reviews until clean.

## Continuous Improvement

Run `/retrospective` regularly to identify patterns and save learnings:

- **Daily**: End of day — run `/retrospective`, save insights
- **Per feature**: After shipping — reflect on what worked
- **Sprint**: Sprint retrospective — team-wide review
