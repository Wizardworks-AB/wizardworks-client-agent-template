---
name: retrospective
description: Run /insight and save learnings to memory for continuous improvement
usage: /retrospective
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

Review the conversation history and summarize:
- Features implemented
- Bugs fixed
- Issues encountered
- Time spent on different activities

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
- Implemented user registration (3 hours)
- Fixed 2 test failures related to async timing
- Encountered EF Core migration issue, resolved by regenerating

### Patterns Identified

#### Recurring: Async test timing
Tests failed twice due to missing `await`. This is a common pattern with
async controller tests.
→ Saved to memory: "Always await async calls in controller tests"

#### Successful: Frontend-first approach
Building the form component before the API endpoint gave faster feedback.
→ Saved to memory: "Frontend mockdata first, then wire up backend"

#### Wasted effort: Wrong migration approach
Tried to modify existing migration instead of creating new one. Wasted 20 min.
→ Saved to memory: "Never modify existing EF migrations, always create new"

### Suggested Improvements
1. Add async test example to TDD playbook
2. Document frontend-first approach in New-Feature workflow
3. Add EF migration warning to CLAUDE.md
```

## Related

- `/insight` — Claude Code's built-in insight command (complementary)
- See [Development Lifecycle](docs/Development-Lifecycle.md) for where retrospectives fit in the process

**Remember**: Every mistake is an opportunity — but only if you capture the learning.
