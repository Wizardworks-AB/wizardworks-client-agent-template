---
name: prototype-scan
description: Scan a customer prototype repo for what changed since the last scan, prove it with screenshots, and draft production-language work items for approval
argument-hint: [repo path or name] [--since <sha>] [--base-url <dev server url>]
---

# Prototype Scan Command

Turns prototype iteration (Lovable, Figma Make, v0, …) into production-grade backlog items. The full
procedure lives in the `prototype-scan` skill (`skills/prototype-scan/SKILL.md`) — this command is the
entry point and states the contract.

## Usage

```bash
/prototype-scan                                   # Scan the prototype repo known from the graph / CLAUDE.md
/prototype-scan ~/code/acme-prototype             # Scan a specific local clone
/prototype-scan --since 3f1827a                   # Override the stored scan cursor
/prototype-scan --base-url http://localhost:5173  # Prototype is running here — take screenshots
```

## What This Command Does

1. **Finds the window**: new commits since the last scanned SHA (stored in the knowledge graph)
2. **Clusters the changes**: commits become themes — one `Feature` per theme, `User Story`/`Bug` children for each behavior
3. **Proves them visually**: maps changed files to routes and screenshots each route when a dev server URL is given
4. **Drafts the proposals**: `proposals.json` in `.fae-prototype-scan/<runId>/`, same shape as the platform's Atma scan
5. **Asks for approval**: presents the drafts as a pick-list — nothing is created until you choose
6. **Creates the approved items**: Feature → children (→ optional parent Epic) in your work tracker, screenshots attached
7. **Saves to the graph**: scan cursor, summary with created ids, new glossary terms

## When to Use

- A customer is iterating on a prototype and the production team needs a backlog that reflects what the prototype has validated
- Before a refinement meeting, to arrive with drafted stories and screenshots instead of a commit log

**When NOT to use**: for a refactor-only or dependency-bump window — the skill skips those on its own and reports an empty scan.

## Trust Boundaries

- No work item is created without your approval in the review step.
- Items are tagged `from-prototype; prototype-scan`, never `fae-auto` — you decide what the autonomous chain picks up.
- The prototype repo is read only: no commits, no pushes, no run artifacts written into it.
- Starting the prototype's dev server runs its install scripts on your machine — the command asks first.
