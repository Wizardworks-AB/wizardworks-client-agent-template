---
name: diagram
description: Draw a system map, integration flow, architecture or process diagram as a draw.io file in the organization's visual identity — drawn by the diagram-drawer agent
argument-hint: <what the diagram should show and for whom> [--lang sv|en]
---

# Diagram Command

Produces a `.drawio` diagram — system map, integration flow, target architecture, before/after,
agent or process loop — in the visual identity shared with `/document` and `/deck`. The full
procedure, the content rules and the delivery live in the `diagram` skill
(`skills/diagram/SKILL.md`); the visual rules in `skills/diagram/STYLE.md`. This command is the
entry point and states the contract.

## Usage

```bash
/diagram system map of the customer's order flow, for the ops director, Swedish
/diagram target architecture with the integration layer we propose --lang en
/diagram how the agent loop works, for the engineering team
```

## What This Command Does

1. **Settles the brief**: the one thing the diagram must show, the reader, the language, the kind — from the graph first (`context()`), then the user as a pick-list
2. **Writes the inventory**: boxes with colour roles, arrows with labels, groups, title — shown to the user before drawing
3. **Spawns the drawer**: the **diagram-drawer** agent (Fable) lays out and writes the XML, runs `check-drawio.mjs`, exports a PNG when draw.io's CLI is on the machine. The main session never writes the XML
4. **Checks the result**: the PNG is looked at; corrections go back to the same agent
5. **Delivers**: `docs/<organization>-<project>-<topic>-<yyyy-mm-dd>.drawio`, how to open it, the PNG; the inventory saved to the graph

## Guardrails

- The diagram is never sent to anyone by the agent — delivery to a customer is the user's decision.
- Every box and arrow comes from the graph or the user; nothing is invented to fill a gap.
- The visual identity is not restyled per diagram. Colours change in `skills/brand/brand.typ` only (see the `brand` skill); the rest is fixed in `skills/diagram/STYLE.md`.
- A paginated document is `/document`; slides are `/deck`. A diagram exported as PNG can be placed in either.
