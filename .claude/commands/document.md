---
name: document
description: Write a paginated A4 document — report, memo, proposal, estimate — as a PDF in the organization's visual identity
argument-hint: <what the document is and for whom> [--lang sv|en]
---

# Document Command

Produces a portrait A4 PDF — report, memo, proposal, estimate, whitepaper, decision basis — through the
Typst library in `skills/brand/`. The full procedure, writing rules and component reference live in the
`document` skill (`skills/document/SKILL.md`); this command is the entry point and states the contract.

## Usage

```bash
/document proposal for an order-flow review, to the ops director, Swedish
/document steering-group memo on the Q3 integration status --lang en
/document estimate for the warehouse module, from the roadmap in the graph
```

## What This Command Does

1. **Settles the brief**: purpose, reader, language, from/to, date, location — from the graph first (`context()`), then the user as a pick-list
2. **Outlines**: at most seven sections; summary first, *Next step* and *About / contact* last
3. **Writes the `.typ`**: `docs/<organization>-<project>-<topic>-<yyyy-mm-dd>.typ`, importing `/.claude/skills/brand/lib/document.typ`
4. **Compiles** with `typst compile --root <repo root>` to PDF, and to PNG for its own page-by-page review
5. **Delivers**: the PDF path, opened; the summary, key figures and recommendation saved to the graph

## Guardrails

- The document is never sent to anyone by the agent — delivery to a customer is the user's decision.
- Every number, name and date comes from the graph or the user; assumptions are marked as assumptions.
- The visual identity is not restyled per document. Logo, colours and name change in `skills/brand/brand.typ` only (see the `brand` skill).
- Slides are a different artefact: use `/deck`.
