---
name: security-review
description: Security review of a change that touches a sensitive surface — scoped to the diff, one bounded round
argument-hint: [file or directory]
---

# Security Review Command

Reviews a change for concrete security exposures. Run it when the change touches
authentication or authorization, secrets, tenant isolation, a migration, a public API
contract, infrastructure, or a new dependency — `/feature` does this for you. For a full
audit of a module or release, use `/harden` instead.

## How to run it — delegate, do not do it inline

**Spawn the `security-reviewer` agent.** It works in its own context and on the model chosen
for the job (`agents/security-reviewer.md`); reviewing inline silently loses both. Hand it the
diff or path and say that it is a diff review, so it stays inside the change.

## Usage

```bash
/security-review                          # Review all recent changes
/security-review src/path/to/file         # Review a specific file
/security-review src/module               # Review a specific directory
```

## What comes back

Findings the reviewer can point at — `file:line`, the exposure, what it yields, the smallest
fix — graded **CRITICAL** (exploitable now), **HIGH** (needs a second condition) or **MEDIUM**
(defence in depth), plus a separate list of **suggestions** that are not findings.

## What to do with it

- **CRITICAL** — stop, fix, re-test, have the reviewer confirm. Look for the same pattern
  elsewhere in the change.
- **HIGH** — fix in this round if it is in the diff; otherwise draft a work item.
- **MEDIUM and suggestions** — work items for `/harden`, presented to the user for approval.
  Not fixed in this round.

One round plus the confirmation of fixes (`rules/simplicity.md`).

## Related

- `/harden` for the full checklist on a module or release
- `rules/security.md` for the standards themselves
