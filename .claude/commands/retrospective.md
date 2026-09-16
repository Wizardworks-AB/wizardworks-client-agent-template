---
name: retrospective
description: Run /insight and save learnings to memory for continuous improvement

---

# Retrospective Command

This command runs a structured retrospective on the current session, identifies patterns, and saves learnings to memory.

## What This Command Does

1. **Analyze session** — Review what was done in the current session
2. **Identify patterns** — Find recurring mistakes, successful approaches, and improvements
3. **Save to memory** — Persist learnings so they carry forward to future sessions
4. **Suggest improvements** — Recommend changes to workflow, CLAUDE.md, or rules

## Workflow

```
/retrospective
     ↓
┌─ 1. Summarize what was done this session
├─ 2. Identify patterns:
│      - What went well?
│      - What went wrong? (repeated mistakes, wasted effort)
│      - What could be improved?
├─ 3. Save insights to memory
├─ 4. Suggest actionable improvements
└─ Done
```

## Steps

### Step 1: Session Summary

State what the session produced and what it cost, in two or three sentences — the outcome
and the one thing that shaped it, not the sequence of events (`rules/writing.md`). The
patterns in step 2 carry the detail.

### Step 2: Pattern Analysis

Look for:

**Recurring mistakes:**
- Same type of error repeated multiple times
- Patterns that hooks/reviews consistently catch
- Misunderstandings of requirements

**Successful approaches:**
- Workflows that worked well
- Prompts that gave good results
- Patterns worth repeating

**Wasted effort:**
- Work that had to be redone
- Approaches that failed before finding the right one
- Missing context that caused confusion

### Step 3: Save to Memory

Save actionable insights using Claude Code's memory system:

```
Key insight: [what we learned]
Context: [when this applies]
Action: [what to do differently]
```

Focus on insights that will prevent future mistakes or accelerate future work.

### Step 4: Suggest Improvements

Recommend concrete changes:
- Updates to CLAUDE.md (new instructions, warnings)
- New rules or hook adjustments
- Process improvements
- Documentation gaps to fill

## When to Use

| Scenario | Frequency |
|----------|-----------|
| End of workday | Daily |
| After a complex feature | Per feature |
| Sprint retrospective | Every sprint |
| After a production incident | Immediately |
| After onboarding to new codebase | Once |

## Example Output

```
## Session Retrospective

### Summary
User registration shipped in three hours, one of which went to two mistakes the rules
already warn about: async tests without `await`, and editing a migration instead of
adding one.

### Patterns Identified

#### Async controller tests failed twice for a missing `await`
Both failures were in tests, not in the code under test.
→ Saved to memory: "Always await async calls in controller tests"

#### Building the form before the endpoint gave faster feedback
Mock data in the component surfaced two field-name mismatches before the API existed.
→ Saved to memory: "Frontend mockdata first, then wire up backend"

#### Editing an existing migration cost twenty minutes
The edited migration had already been applied locally, so it had to be reverted and redone as a new one.
→ Saved to memory: "Never modify existing migrations, always create new"

### Suggested Improvements
1. Add async test example to rules/testing.md
2. Document frontend-first approach in New-Feature workflow
3. Add migration warning to CLAUDE.md
```

## Related

- `/insight` — Claude Code's built-in insight command (complementary)
- See [Development Lifecycle](docs/Development-Lifecycle.md) for where retrospectives fit in the process

**Remember**: Every mistake is an opportunity — but only if you capture the learning.
