---
name: deck
description: Build a slide deck — pitch, proposal presentation, status update — as a landscape PDF in the organization's visual identity
argument-hint: <what the deck is for and for whom> [--lang sv|en]
---

# Deck Command

Produces a landscape A4 slide deck — pitch, proposal presentation, steering-group update, "how we
work" — through the Typst library in `skills/brand/`. The full procedure, slide rules and component
reference live in the `deck` skill (`skills/deck/SKILL.md`); this command is the entry point and states
the contract.

## Usage

```bash
/deck pitch for the CRM replacement, for the CIO, Swedish
/deck how we deliver, for a new customer --lang en
/deck steering-group update for sprint 14, from the graph
```

## What This Command Does

1. **Settles the brief**: audience, the decision the deck should produce, language, sent or presented, location — graph first, then the user as a pick-list
2. **Writes the storyline**: slide titles as sentences that tell the story top to bottom; eight to twelve slides for a pitch
3. **Writes the `.typ`**: `docs/<organization>-<project>-<topic>-<yyyy-mm-dd>.typ`, importing `/.claude/skills/brand/lib/deck.typ`; images under `docs/assets/`
4. **Compiles** with `typst compile --root <repo root>` to PNG and looks at every slide, then to PDF
5. **Delivers**: the PDF path, opened; the storyline, figures and ask saved to the graph

## Guardrails

- The deck is never sent to anyone by the agent — that is the user's decision.
- A slide that does not fit loses words, never type size; one idea per slide, stated in the title.
- Every figure comes from the graph or the user. No invented numbers, quotes or logos.
- The visual identity changes in `skills/brand/brand.typ` only (see the `brand` skill). A paginated document is `/document`.
