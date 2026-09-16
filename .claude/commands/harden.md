---
name: harden
description: Deliberate hardening pass on a module, a diff or a release — the architect and the security reviewer with their full checklists; findings become prioritized work items you approve, not an inline fix loop
argument-hint: [module | path | work item id | release]
---

# Harden

`/feature` builds the functionality. This command is where the robustness work lives — run
it when *you* decide it is worth spending on: before a release, on a module that has grown,
on a change `/feature` flagged as touching a sensitive surface, or after an incident.

It is separate on purpose. Hardening every change while it was being built made
functionality too expensive, and much of what came out was technology for its own sake.
Here the checklists are as thorough as you like, and the output is a prioritized list *you*
decide on — not a loop the agent runs until nothing is left to say.

## Usage

```bash
/harden src/Billing            # a module
/harden #3021                  # the diff on a work item's branch
/harden release                # everything changed since the last tag
```

## What runs

Spawn both in parallel, scoped to the target:

- **security-reviewer** — the full checklist: secrets, injection, authentication and
  authorization, tenant isolation, input validation, dependency audit, and transport, headers
  and CORS for anything exposed.
- **architect** — layering, boundary contracts, stable identifiers, error handling, N+1 and
  other performance hot spots, and the maintainability of the changed area.

`rules/simplicity.md` applies to the findings too: a finding names a concrete failure or
exposure in the code in front of the reviewer, not a pattern that is merely absent. "No
caching layer" is not a finding; "the list endpoint runs one query per row" is.

## What you get back

One consolidated list, de-duplicated across the two reviewers. Each item: severity
(CRITICAL / HIGH / MEDIUM), `file:line`, what fails or is exposed, and the smallest fix.

Then:

- **CRITICAL** — exploitable now: a secret in code, an injection path, an authorization
  bypass, a cross-tenant read. Fix immediately in a worktree, test, `/code-review`, draft PR.
- **HIGH / MEDIUM** — drafted as work items in the shape `commands/feature.md` step 4 gives
  (an outcome for a title, why now and what is in and out, GIVEN / WHEN / THEN criteria), plus
  severity and parent, and presented as a choice with options (`rules/asking-the-user.md`).
  Created only after approval. Nothing else is changed in this run.

Record decisions (`decide`), gotchas, and a summary of the run in the knowledge graph
(`rules/fae.md`). Never put a secret in a finding or a node — reference where it lives.

## Notes

- Never override agent models (`rules/agents-and-commands.md`).
- Trust boundaries apply: fixes go on a branch as a draft PR; no merge, deploy, or work-item
  creation without approval.
