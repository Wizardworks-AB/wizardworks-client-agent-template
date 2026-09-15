---
name: document
description: Write a paginated A4 document — report, memo, proposal, estimate, whitepaper, decision basis — as a PDF in the organization's visual identity, via Typst. Use when the user asks for a document, a report, a proposal, a memo, "something I can send", or a PDF. Also invoked as /document. For slides use /deck.
---

# Document

A portrait A4 document with real pages: masthead, a grey info box (date, purpose, from, to), an optional contents box, the summary on the accent gradient, then sections. Page numbers on every page but the first; the organization's mark once, in the closing footer. Typst paginates deterministically — no browser, no print dialog, one binary and one library.

The library and the brand tokens live in `skills/brand/` (see its `SKILL.md` to change logo, colours or name). This skill is about writing the document.

## Setup (once per machine)

```bash
brew install typst                    # macOS          winget install -e --id Typst.Typst   # Windows
bash .claude/skills/brand/install-fonts.sh                                             # Inter (macOS, Linux)
powershell -ExecutionPolicy Bypass -File .claude\skills\brand\install-fonts.ps1      # Inter (Windows)
```

Verify: `typst --version` and `typst fonts | grep -i inter`. If Inter is missing the document still compiles, in Arial, with a warning — install the font before delivering.

## Process

1. **Brief.** Settle six things before writing: what the document is for (the decision it should enable), who reads it, in which language, who it is from and to, the date, and where it goes. Search the graph first — `context("<topic>")` — the numbers, names and decisions the document needs are usually there. Ask the user only for what the graph does not have, as a pick-list per `rules/asking-the-user.md`.
2. **Outline.** At most seven sections. The summary states the recommendation and the price or ask in the reader's words. The last two sections are always *Next step* and *About / contact*. Show the outline in the conversation when the document is longer than a memo, then write.
3. **Write the `.typ`.** One file, next to any assets it uses. Location: `docs/` at the repository root unless `CLAUDE.md` or the user says otherwise. Name: `<organization>-<project>-<topic>-<yyyy-mm-dd>.typ`, lowercase, hyphens, no diacritics.
4. **Compile and look.** PDF for delivery, PNG for your own review — you can read the PNGs:
   ```bash
   ROOT=$(git rev-parse --show-toplevel)
   typst compile --root "$ROOT" docs/<name>.typ docs/<name>.pdf
   typst compile --root "$ROOT" --format png --ppi 72 docs/<name>.typ <scratch>/<name>-{p}.png
   ```
   While writing, `typst watch --root "$ROOT" docs/<name>.typ docs/<name>.pdf` recompiles on every save with the PDF open in a viewer. `--root` is required: the import path starts at the repository root. Compile must finish with no errors and no warnings. Open every PNG and check: no heading orphaned at the bottom of a page, no half-empty page before the end, no table split mid-row, no box overflowing the margin, labels in the right language.
5. **Deliver.** Give the user the PDF path and open it (`open <pdf>` on macOS). Then save the document to the graph — not a file reference but the content that matters: `remember("fact", "Document — <title> (<date>)", <the summary, the key numbers, the recommendation and the path>)`. A proposal that names a price is also a decision: `decide(...)` it.

Never send the document anywhere. Handing it to a customer is the user's call.

## Writing rules

- **Title is a name, not a sentence** — two to five words in the masthead; the subtitle says what kind of document it is and for whom.
- **Summary first, in the reader's words**: what we propose, what it costs, what they get, what happens next. Under 120 words, on the gradient box.
- **One idea per section**, `=` headings that state the idea ("The review", "What you get", "Next step"). `==` for the parts of a section. Never `===` in a document under ten pages.
- **Bullets carry a bold lead-in**: `- *The stock figure lags.* WMS and shop disagree…`. Numbered lists for sequences only.
- **Tables for comparisons and deliverables** — at most four columns, header row states the question each column answers. Cells that need bold or a badge are written as content `[...]`, not strings.
- **One highlight per document**: the price, the total or the ask goes in `estimate-total`. Not twice.
- **Callouts sparingly**: at most one `status-box` per section. `ok` for the next step and reassurances, `info` for how something works, `warning` for assumptions, `danger` for blockers.
- **Numbers come from the graph or the user.** Never invent a figure, a date or a reference. Mark an assumption as one.
- **The reader's language, throughout**, including labels (`lang: "sv"` or `"en"` — both label sets are built in; other languages via `labels:`).

## Skeleton

```typst
#import "/.claude/skills/brand/lib/document.typ": *

#show: report.with(
  meta: (
    title: "Order flow review",
    subtitle: "Proposal — mapping the order-to-invoice process",
    date: "14 September 2026",
    purpose: "Basis for a decision on a first step",
    from: "Jane Doe / Acme",
    to: "Ops leadership, Customer AB",
  ),
  lang: "en",                         // "sv" for Swedish labels and hyphenation
  toc: ("The challenge", "The review", "Pricing", "Next step"),   // optional
  summary: [ *Summary.* What we propose, what it costs, what you get, what happens next. ],
  // summary-break: true,   // summary on its own page (after the contents box)
  // body-break: true,      // first section on a new page
  // section-breaks: true,  // every = heading starts a new page
)

= The challenge
Body text. A paragraph is three to five sentences.

- *Re-keying is the norm.* Every web order is typed twice.

== What you get
#report-table(
  ("Deliverable", "Content"),
  (
    ([*System map*], "Every system and integration, with owners and dependencies"),
    ([*Priority list*], "What to do in which order, with an expected effect and a size"),
  ),
)

#estimate-total[*Review: 50 000 at a fixed price* · four to six weeks]

= Next step
#status-box(variant: "ok")[*The next step is the meeting you wanted to set up.* It costs nothing.]
```

All `meta` fields except `title` are optional; when none of date/purpose/from/to is given the info box is not rendered.

Two Typst traps: a `#pagebreak()` written inside the `report.with(...)` argument list does nothing — breaks around the front matter are the `summary-break` / `body-break` / `section-breaks` options, and every other break belongs in the body after the `#show` line. And a table cell given as a string renders literally, `"*Total*"` prints the asterisks; write `[*Total*]` when a cell needs bold, a badge or a risk word.

## Components

Headings are Typst markup; everything else is a function called with `#`.

| Component | Syntax |
|-----------|--------|
| Section heading (with rule) | `= Heading` |
| Sub-heading | `== Heading`, `=== Heading` |
| Phase header (gradient bar) | `#phase-header(label: "Phase 1 — 4 weeks")[Title]` |
| Callout | `#status-box(variant: "ok")[...]` — `ok \| info \| warning \| danger` |
| Badge (pill) | `#badge(variant: "info")[TEXT]` — `ok \| info \| warning \| danger` |
| Table | `#report-table(("H1", "H2"), ((r1c1, r1c2), (r2c1, r2c2)))` |
| Card grid | `#grid(columns: (1fr, 1fr, 1fr), column-gutter: 5mm, card([Title], [Body], height: 40mm), …)` — `accent: ww-accent-2` or `ww-black` to vary |
| Code block | `#code-block[```python …```]` |
| Inline code | `#inline-code[order.status]` |
| Risk word | `#risk(level: "high")[High]` — `high \| medium \| low` |
| Highlight (the price, the ask) | `#estimate-total[*Total: 480 000* · …]` (alias `highlight`) |
| ASCII / monospace panel | `#diagram-box[```…```]` |
| Image | `#align(center)[#image("assets/diagram.png", width: 90%)]` — assets next to the `.typ`; a system map or flow comes from `/diagram`, exported as PNG |
| Page break | `#pagebreak()` / `#pagebreak(weak: true)` |
| Space | `#v(1em)` |
| Keep together | `#block(breakable: false)[ … ]` |

Colours available in the document: `ww-accent`, `ww-accent-2`, `ww-black`, `ww-muted`, `ww-surface`, `ww-border`, `ww-gradient`.

## Checklist before delivering

- [ ] `typst compile` — no errors, no warnings
- [ ] File named `<organization>-<project>-<topic>-<yyyy-mm-dd>.pdf`
- [ ] Summary states the recommendation and the price or ask
- [ ] Every PNG page looked at: no orphaned heading, no overflowing box, no split table row
- [ ] Page numbers on every page except the first; the mark and url in the closing footer
- [ ] Gradients render (summary box, phase headers, info badges) — a flat colour means the brand tokens failed to load
- [ ] Table cells with formatting written as content `[...]`, not strings
- [ ] Labels and hyphenation in the reader's language
- [ ] Every number traceable to the graph or the user
- [ ] Saved to the graph with the content, not just the path
