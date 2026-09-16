---
name: commit
description: Commit with Patterns & Practices validation and auto-documentation
argument-hint: [optional message]
---

# Commit Command

This command validates your changes against the project's Patterns & Practices before committing.

## What This Command Does

1. **Review changes** — Run `/code-review` on staged/unstaged changes
2. **Generate documentation** — Create brief feature documentation for significant changes
3. **Decide** — If review passes → commit + push. If issues found → present options.
4. **Commit** — Create commit with descriptive message

## Workflow

```
/commit
     ↓
┌─ 1. Show diff summary (files changed, lines added/removed)
├─ 2. Run code review agent against Patterns & Practices
├─ 3. Generate brief change documentation (if feature-level change)
│
├─ Review PASSED?
│   ├─ YES → Generate commit message, commit, push
│   └─ NO  → Show issues, ask:
│            a) Fix issues first (recommended)
│            b) Commit anyway (with review notes in commit message)
│            c) Cancel
└─ Done
```

## Steps

### Step 1: Analyze Changes

Run `git diff` and `git diff --staged` to understand what changed.

Summarize:
- Files changed
- Nature of changes (new feature, bug fix, refactor, etc.)
- Scope (single file vs multi-file)

### Step 2: Code Review

Spawn the code-reviewer agent to review changes against the project's standards:

- Patterns & Practices compliance
- Security issues
- Architecture adherence
- Tests for the change

Focus on the **diff only** — don't review the entire codebase.

### Step 3: Documentation (if applicable)

For feature-level changes (not typos, not small fixes):

Generate a brief documentation entry:

```markdown
# [Feature/Change Name]

## What
[1-2 sentences: what does this change do?]

## How
[Brief technical description]

## Files
[List of key files changed]
```

Save to `docs/features/` or update existing documentation.

Skip documentation for:
- Typo fixes
- Dependency updates
- Config changes
- Small bug fixes (< 10 lines changed)

### Step 4: Commit

If review passed (or user chose to commit anyway):

1. Generate descriptive commit message based on changes
2. Stage all relevant files (including generated docs)
3. Commit with the message
4. Push to current branch

## Usage

```bash
/commit                           # Review and commit all changes
/commit fix login timeout         # Commit with specific message context
```

## Example Output

```
## Commit Summary

### Changes
- 3 files changed: the user service, its API endpoint, and their tests
- Type: New feature (user registration endpoint)

### P&P Review: ✅ PASSED
- CSR pattern: ✅
- Public IDs: ✅
- DTOs: ✅
- Tests: ✅
- Security: ✅

### Documentation
Generated: docs/features/user-registration.md

### Commit
Message: "Add user registration with email verification"
Branch: feature/user-registration
Pushed: ✅

---

(If review fails)

### P&P Review: ❌ 2 ISSUES FOUND

1. [HIGH] Missing input validation on email field
   File: <the endpoint handling registration>:42

2. [MEDIUM] Magic number for token expiry
   File: <the user service>:78

Options:
a) Fix issues first (recommended)
b) Commit anyway (issues noted in commit message)
c) Cancel
```

## Related

- `/code-review` — Full code review (this command runs a focused version)
- `/security-review` — Dedicated security audit
- `/update-docs` — Full documentation update
- See `rules/git-workflow.md` for commit message standards

**Remember**: Quality commits build quality software.
