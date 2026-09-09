---
name: code-review
description: Review the current change against its acceptance criteria and the project's conventions — one bounded round
argument-hint: [file or directory]
---

# Code Review Command

Reviews your recent changes — the diff by default, or a path — for what is broken.

## How to run it — delegate, do not do it inline

**Spawn the `code-reviewer` agent.** It works in its own context and on the model chosen for
the job (`agents/code-reviewer.md`); reviewing inline silently loses both. Hand it the
acceptance criteria for the change and the path or diff to review.

## Usage

```bash
/code-review                          # Review all recent changes (git diff)
/code-review src/path/to/file         # Review a specific file
/code-review src/module               # Review a specific directory
```

## What comes back

Findings the reviewer can point at in the diff — **BUG**, **SECRET**, **CONVENTION**,
**SCOPE CREEP** — each with file, issue and the smallest fix, plus a short **For /harden**
list of things that are not wrong but could be more robust. Verdict: approve when there is
no BUG and no SECRET.

## What to do with it

Fix the findings, re-run the tests, and ask the reviewer to confirm the fixes landed. That
confirmation is the last round (`rules/simplicity.md`): anything still open is a bug you fix
now or a work item for `/harden`. The "For /harden" list is not fixed here.

## Related

- `/tdd` to make sure tests exist before the review
- `/harden` for the deliberate robustness pass
- `rules/coding-style.md`, `rules/simplicity.md`
