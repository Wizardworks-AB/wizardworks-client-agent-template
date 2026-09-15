---
name: diagram
description: Draw a system map, integration flow, target architecture or process diagram as a draw.io (.drawio) file in the organization's visual identity, drawn by the diagram-drawer subagent. Use when the user asks for a diagram, a system map, an architecture picture, a flow chart, "a picture of how it fits together", or a draw.io file. Also invoked as /diagram. For a document use /document, for slides /deck.
---

# Diagram

A draw.io diagram the user can open, edit and export: system maps, integration flows, target
architectures, before/after pictures, agent and process loops. The look is fixed in `STYLE.md`
(typeface, palette, shapes, layout) and takes the two accent colours from
`skills/brand/brand.typ`, so a diagram matches the organization's documents and slides.

**The drawing is done by the `diagram-drawer` subagent** (`agents/diagram-drawer.md`), not by the
main session. It runs on its own model, chosen for long, exact XML, and it keeps the hundreds of
lines of markup out of your conversation. Your job is the brief, the content inventory and the
delivery; the agent's job is the file.

## Process

1. **Brief.** Settle what the diagram must make visible (the one thing a reader should see in five seconds), who reads it, in which language, and which kind it is (`STYLE.md` → *Recurring diagram kinds*). Search the graph first — `context("<system> integrations")`, `context("<project> architecture")` — the systems, owners and integrations are usually there. Ask the user only for what the graph lacks, as a pick-list per `rules/asking-the-user.md`.
2. **Inventory.** Write the content as a list in the conversation before anything is drawn:
   - **Boxes** — name, one-line role, colour role from `STYLE.md` (Core / Accent A / Accent B / Info / Amber / Neutral / Problem / External); groups and what sits inside them.
   - **Arrows** — from, to, label (the data or the trigger), kind (Heavy / Normal / Problem / two-way).
   - **Title and subtitle**, and the direction (left → right or top → bottom).
   At most 12 top-level boxes; more is two pages. Show the inventory to the user when the diagram is not trivial — a wrong box is cheap to fix here and expensive after layout.
3. **Spawn the drawer.** Spawn the **diagram-drawer** agent with: the inventory verbatim, the language, the kind, the output path, and the instruction to read `.claude/skills/diagram/STYLE.md` and `.claude/skills/brand/brand.typ` first. Output path: `docs/<organization>-<project>-<topic>-<yyyy-mm-dd>.drawio` at the repository root unless `CLAUDE.md` or the user says otherwise; lowercase, hyphens, no diacritics. Do not write or edit the XML yourself — if the result needs a change, send the change to the same agent.
4. **Check the report.** The agent returns the path, the checker result (`node .claude/skills/diagram/check-drawio.mjs <file>` must print `OK`) and, when `drawio` is on the machine, a PNG export. Open the PNG and look: does the five-second message land, is anything overlapping, is the direction consistent, are labels in the right language? One round of corrections through the agent is normal; a third means the inventory was wrong — go back to step 2.
5. **Deliver.** Give the user the `.drawio` path and how to open it (draw.io desktop, app.diagrams.net → Open from device, or the VS Code draw.io extension), plus the PNG path if one was exported. Then save the diagram to the graph — the inventory, not just the path: `remember("fact", "Diagram — <title> (<date>)", <title, kind, the boxes and arrows as text, what it shows, the path>)`. A diagram that proposes an architecture is a decision: `decide(...)` it.

Never send the diagram anywhere. Handing it to a customer is the user's call.

## Using the diagram in a document or deck

Export a PNG (`STYLE.md` → *Export*) into `docs/assets/` and place it with
`#align(center)[#image("assets/<name>.png", width: 90%)]` in a `/document`, or
`height: 10cm` on a `/deck` slide. Keep the `.drawio` next to it — it is the editable source.

## Rules of thumb for the inventory

- **One message per diagram.** If the sentence "this diagram shows that …" needs an *and*, it is two diagrams.
- **Colour is meaning, not decoration.** Accent A marks what the diagram argues for; everything the reader already knows is Neutral. At most four roles besides Neutral.
- **Arrows carry data or triggers**, labelled with what moves ("orders, hourly", "webhook on payment"). An unlabelled arrow is a guess.
- **Names verbatim** — the system names the customer uses, not generic ones.
- **The reader's language** for every label; the file name in ASCII.
- **Every box and arrow traceable** to the graph or the user. A system you are not sure exists is a question, not a box.

## Checklist before delivering

- [ ] `check-drawio.mjs` prints `OK` for the file
- [ ] File named `<organization>-<project>-<topic>-<yyyy-mm-dd>.drawio` under `docs/`
- [ ] The PNG (if exported) was looked at: no overlap, one direction, labels readable at 100 %
- [ ] Accent colours are the ones in `brand.typ`; no colour role without a reason
- [ ] Every label in the audience's language
- [ ] Saved to the graph with the inventory, not just the path
