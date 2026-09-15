---
name: deck
description: Build a slide deck — pitch, proposal presentation, steering-group update, "how we work" — as a landscape PDF in the organization's visual identity, via Typst. Use when the user asks for slides, a deck, a presentation or a PowerPoint. Also invoked as /deck. For a paginated document use /document.
---

# Deck

Landscape A4 slides in presentation style: a full-bleed gradient title slide, then content slides with a 3 mm gradient bar on top, a small upper-case kicker over a heavy title, content on light grey cards of equal height, the organization's mark bottom-left and the slide number bottom-right. Dark divider slides between parts, a gradient closing slide with the ask. Everything is fixed except the words and the brand tokens.

The library and the brand tokens live in `skills/brand/` (see its `SKILL.md` for logo, colours, name). Setup — Typst and the Inter font — is the same as for `/document`; see `skills/document/SKILL.md`.

## Process

1. **Brief.** Audience, the one decision the deck should produce, language, the occasion (sent as PDF or presented live — a sent deck carries more words per slide), and where it goes. `context("<topic>")` first; the numbers and claims are usually in the graph. Ask only for what the graph lacks, as a pick-list.
2. **Storyline before slides.** Write the slide titles as a list of sentences — read top to bottom they must tell the whole story. Eight to twelve slides for a pitch or proposal, up to twenty with divider slides for a longer session. Show the list when the deck is more than a handful of slides, then build.
3. **Write the `.typ`.** One file plus an `assets/` folder for images, in `docs/` at the repository root unless `CLAUDE.md` or the user says otherwise. Name: `<organization>-<project>-<topic>-<yyyy-mm-dd>.typ`.
4. **Compile and look at every slide.** PNG first — you can read the images:
   ```bash
   ROOT=$(git rev-parse --show-toplevel)
   typst compile --root "$ROOT" --format png --ppi 72 docs/<name>.typ <scratch>/<name>-{p}.png
   typst compile --root "$ROOT" docs/<name>.typ docs/<name>.pdf
   ```
   While building, `typst watch --root "$ROOT" docs/<name>.typ docs/<name>.pdf` recompiles on every save. `--root` is required — the import path starts at the repository root. No errors, no warnings. Open each PNG: nothing runs past a card's bottom edge, nothing collides with the footer, sibling cards have the same height, no slide has more than one idea. A slide that does not fit loses words, never type size.
5. **Deliver.** PDF path, open it, and save the deck to the graph with its content — the storyline, the numbers, the ask, the path: `remember("fact", "Deck — <title> (<date>)", …)`. A deck that states a price or a proposal is a decision: `decide(...)`.

Never send the deck anywhere. That is the user's call.

## Slide rules

- **One idea per slide, stated in the title.** The title is a sentence that makes the point ("Scoped projects at a fixed price per sprint"), not a topic ("Projects"). The kicker is the topic.
- **Lead, then evidence.** An optional one-sentence `lead` under the title, then the cards, numbers, table or process that back it. No paragraphs on slides.
- **Three cards, or four steps.** More than three `card`s in a row and the words shrink; use `step-card` for up to four numbered steps. Give siblings the same `height:` so the row lines up, and vary the accent (`ww-accent`, `ww-accent-2`, `ww-black`) left to right.
- **Under forty words per card**, under twenty-five in a lead, under eight in a title. Bold the first phrase of a bullet.
- **Numbers as `stat-tile`, never in prose.** Processes as `chain`. Comparisons as `report-table` with at most four columns and five rows.
- **One `status-box` per slide at most**, at the bottom, for the takeaway. `estimate-total` for the sentence to remember.
- **Images** are placed with `#align(center)[#image("assets/x.png", height: 10cm)]` — set `height`, not `width`, so the image never pushes the footer. Assets sit next to the `.typ`. An architecture or flow picture comes from `/diagram`, exported as PNG.
- **Always** a `title-slide` first and a `closing-slide` last. `section-slide` only when the deck has parts.
- **The audience's language throughout**; `lang: "sv"` or `"en"` on the deck.
- **Every figure traceable** to the graph or the user. No invented numbers, logos or quotes.

## Skeleton

```typst
#import "/.claude/skills/brand/lib/deck.typ": *
#show: deck.with(title: "How we deliver", lang: "en")

#title-slide([How Acme delivers], subtitle: [Development, operations and a shared memory], meta: [Acme · September 2026])

#content-slide(kicker: "Overview", title: [Three ways to work with us])[
  #lead[Continuous development, scoped projects and long-term operations.]
  #v(4mm)
  #columns-of(3,
    offer-card([Engineer], [75 000], [per month], [Continuous development and maintenance.], height: 60mm),
    offer-card([Project], [Fixed price], [per sprint], [Scoped, invoiced on approval.], fill: ww-accent-2, height: 60mm),
    offer-card([SLA], [10 000], [per month], [Monitoring and reviews.], fill: ww-black, height: 60mm),
  )
  #v(4mm)
  #status-box(variant: "ok")[*The platform is included.* The memory belongs to the customer.]
]

#content-slide(kicker: "Project", title: [Scoped projects at a fixed price per sprint])[
  #lead[Bounded deliveries with a clear scope. Payment on approval.]
  #v(6mm)
  #chain([Scope agreed], [Sprint at fixed price], [Delivery approved], [Invoice])
  #v(7mm)
  #columns-of(3,
    card([One scope per sprint], [Fixed content both parties commit to.], height: 50mm),
    card([Fixed price], [Known in advance.], accent: ww-accent-2, height: 50mm),
    card([Invoice on approval], [Sent when the delivery is approved.], accent: ww-black, height: 50mm),
  )
]

#closing-slide([One meeting, one decision], [Nominate one engagement for a pilot.], contact: [jane\@acme.example · acme.example])
```

## Slides and components

| Element | Syntax |
|---------|--------|
| Title slide (gradient, first) | `#title-slide([Title], subtitle: [...], meta: [Org · Month year])` |
| Content slide | `#content-slide(kicker: "Topic", title: [The point], extra: badge[NEW])[ body ]` |
| Divider slide (dark) | `#section-slide([Part two], subtitle: [...])` |
| Closing slide (gradient, last) | `#closing-slide([The ask], [one or two sentences], contact: [...])` |
| Lead sentence | `#lead[...]` |
| Equal columns | `#columns-of(3, gutter: 6mm, a, b, c)` |
| Card | `#card([Title], [Body], accent: ww-accent-2, height: 50mm)` |
| Numbered step | `#step-card("1", [Title], [Body], height: 54mm)` |
| Offer / price card | `#offer-card([Title], [75 000], [per month], [body], fill: ww-black, height: 60mm)` |
| Big number | `#stat-tile("3–4", "developers", note: [...], height: 44mm)` |
| KPI with delta | `#kpi-tile("Revenue", "1.2 M", delta: "+12 %", positive: true)` |
| Process | `#chain([A], [B], [C])` |
| Table | `#report-table(("H1", "H2"), ((r1c1, r1c2), …))` — cells as content `[...]` |
| Callout | `#status-box(variant: "ok")[...]` — `ok \| info \| warning \| danger` |
| Highlight | `#estimate-total[*The sentence to remember.*]` |
| Badge | `#badge(variant: "info")[NEW]` |
| Image | `#align(center)[#image("assets/x.png", height: 10cm)]` |
| Space | `#v(4mm)` |

Two-column text: `#columns-of(2, gutter: 8mm, [ #text(size: 13pt, weight: "bold")[Heading] #v(2mm) - bullet ], [ … ])`.

Colours: `ww-accent`, `ww-accent-2`, `ww-black`, `ww-muted`, `ww-surface`, `ww-border`, `ww-gradient`.

## Checklist before delivering

- [ ] `typst compile` — no errors, no warnings
- [ ] Slide titles read as the story, top to bottom
- [ ] Every PNG looked at: nothing overflows a card or touches the footer
- [ ] Sibling cards share a height; at most three cards or four steps per row
- [ ] Title slide first, closing slide with the ask last
- [ ] Mark bottom-left and slide number bottom-right on every content slide
- [ ] Gradients render on the top bar, title and closing slides
- [ ] Table cells with formatting written as content `[...]`, not strings
- [ ] Audience's language throughout
- [ ] Every number traceable to the graph or the user
- [ ] Saved to the graph with the storyline and the ask, not just the path
