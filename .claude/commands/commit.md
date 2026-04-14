---
name: commit
description: Commit with Patterns & Practices validation and auto-documentation
usage: /commit [optional message]
---

# Commit Command

This command validates your changes against Wizardworks Patterns & Practices before committing.

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

Spawn the code-reviewer agent to review changes against Wizardworks standards:

- Patterns & Practices compliance
- Security issues
- Architecture adherence
- Test coverage

Focus on the **diff only** — don't review the entire codebase.

### Step 3: Documentation (if applicable)

For feature-level changes (not typos, not small fixes):

Generate a brief documentation entry:

```markdown
# [Feature/Change Name]

## Vad
[1-2 sentences: what does this change do?]

## Hur
[Brief technical description]

## Filer
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
- 3 files changed: UserService.cs, UserController.cs, UserServiceTests.cs
- Type: New feature (user registration endpoint)

### P&P Review: ✅ PASSED
- CSR pattern: ✅
- Public IDs: ✅
- DTOs: ✅
- Tests: ✅ (92% coverage)
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
   File: UserController.cs:42

2. [MEDIUM] Magic number for token expiry
   File: UserService.cs:78

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
