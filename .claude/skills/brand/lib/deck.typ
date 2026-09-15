// ============================================================
// Deck library — landscape A4 slides in presentation style.
// Style: full-bleed slides, a 3 mm gradient bar on top of every
// content slide, a small upper-case kicker over a heavy title,
// content on light grey cards with fixed heights, mark bottom-left
// and slide number bottom-right. The title slide is the gradient.
//
// Import from a deck as
//   #import "/.claude/skills/brand/lib/deck.typ": *
// and compile with --root at the repository root. All document
// components (status-box, report-table, estimate-total, badge …)
// are available here too, re-tuned for slide type sizes.
// ============================================================
#import "document.typ": *
#import "../brand.typ": *

// ── Slide-tuned overrides of shared components ───────────────
#let doc-status-box = status-box
#let status-box(body, variant: "info") = doc-status-box(variant: variant)[#set text(size: 11.5pt); #body]

#let doc-report-table = report-table
#let report-table(headers, rows) = table(
  columns: headers.len(),
  stroke: 0.5pt + ww-border,
  inset: (x: 4mm, y: 3mm),
  align: left + top,
  fill: (col, row) => if row == 0 { ww-black } else if calc.even(row) { ww-zebra } else { white },
  table.header(..headers.map(h => text(fill: white, weight: "semibold", size: 11pt)[#h])),
  ..rows.flatten().map(c => text(size: 11pt)[#c]),
)

// ── Building blocks ──────────────────────────────────────────

// One-sentence lead under the title.
#let lead(body) = text(size: 14pt, fill: ww-fg.lighten(10%))[#body]

// Card: accent bar, bold title, body. Give sibling cards the same height.
#let card(title, body, accent: ww-accent, height: auto) = block(
  width: 100%, height: height, fill: ww-surface, radius: 3mm, inset: (x: 6mm, y: 5mm),
)[
  #block(width: 9mm, height: 1.4mm, fill: accent, radius: 0.7mm)
  #v(2mm)
  #text(size: 14pt, weight: "bold")[#title]
  #v(2mm)
  #text(size: 11.5pt, fill: ww-fg.lighten(12%))[#body]
]

// Numbered card for steps and sequences.
#let step-card(n, title, body, height: auto) = block(
  width: 100%, height: height, fill: ww-surface, radius: 3mm, inset: (x: 6mm, y: 5mm),
)[
  #text(size: 17pt, weight: 900, fill: ww-accent)[#n]
  #v(1.5mm)
  #text(size: 14pt, weight: "bold")[#title]
  #v(2mm)
  #text(size: 11.5pt, fill: ww-fg.lighten(12%))[#body]
]

// Offer / price card: coloured title band, big figure, unit, bullets.
#let offer-card(title, price, unit, body, fill: ww-gradient, height: auto) = block(
  width: 100%, height: height, radius: 3mm, clip: true, stroke: 0.6pt + ww-border,
)[
  #block(width: 100%, fill: fill, inset: (x: 6mm, y: 4mm),
    text(size: 12pt, weight: "bold", fill: white)[#title])
  #block(width: 100%, inset: (x: 6mm, y: 5mm))[
    #text(size: 24pt, weight: 900)[#price]
    #h(2mm)
    #text(size: 10pt, fill: ww-muted)[#unit]
    #v(2.5mm)
    #set text(size: 11.5pt)
    #body
  ]
]

// Big number with a small upper-case label.
#let stat-tile(value, label, note: none, height: auto) = block(
  width: 100%, height: height, fill: ww-surface, radius: 3mm, inset: (x: 6mm, y: 5mm),
)[
  #text(size: 27pt, weight: 900, fill: ww-fg)[#value]
  #v(1mm)
  #text(size: 9pt, weight: "semibold", fill: ww-muted, tracking: 0.6pt)[#upper(label)]
  #if note != none [ #v(1mm) #text(size: 9.5pt, fill: ww-muted)[#note] ]
]

// KPI with an optional delta line.
#let kpi-tile(label, value, delta: none, positive: true) = block(
  width: 100%, fill: white, stroke: 0.6pt + ww-border, radius: 3mm, inset: (x: 5mm, y: 4mm),
)[
  #text(size: 8pt, weight: "semibold", fill: ww-muted, tracking: 0.7pt)[#upper(label)]
  #v(1.2mm)
  #text(size: 18pt, weight: 900)[#value]
  #if delta != none [
    #v(0.8mm)
    #text(size: 9.5pt, weight: "bold", fill: if positive { H(142, 70, 33) } else { ww-muted })[#delta]
  ]
]

// Horizontal process: chips joined by accent arrows. Pass content items.
#let chain(..items) = align(center)[
  #for (i, it) in items.pos().enumerate() {
    if i > 0 { h(2.5mm); text(size: 15pt, weight: 900, fill: ww-accent)[→]; h(2.5mm) }
    box(fill: ww-surface, radius: 10mm, inset: (x: 6mm, y: 4mm))[#text(size: 12pt, weight: "semibold")[#it]]
  }
]

// Equal columns with a gutter — the usual 2–4 cards side by side.
#let columns-of(n, gutter: 6mm, ..cells) = grid(
  columns: (1fr,) * n, column-gutter: gutter, align: top, ..cells
)

// ── Slides ───────────────────────────────────────────────────

// Full-bleed gradient title slide. First slide of every deck.
#let title-slide(title, subtitle: none, meta: none) = block(
  width: 100%, height: 100%, fill: ww-gradient, inset: (x: 18mm, y: 15mm),
)[
  #place(top + left, brand-mark(height: 6.5mm, inverse: true))
  #place(horizon + left, dy: -4mm)[
    #text(size: 37pt, weight: 900, fill: white)[#title]
    #if subtitle != none {
      v(5mm)
      text(size: 14pt, fill: white.transparentize(15%))[#subtitle]
    }
  ]
  #if meta != none {
    place(bottom + left, text(size: 10pt, fill: white.transparentize(25%))[#meta])
  }
]

// Standard content slide: gradient bar, kicker, title, body, mark, number.
// `extra` is placed right of the kicker (a badge, a date).
#let content-slide(kicker: none, title: none, extra: none, body) = {
  pagebreak(weak: true)
  block(width: 100%, height: 100%, spacing: 0mm, {
    rect(width: 100%, height: 3mm, fill: ww-gradient)
    block(width: 100%, height: 100% - 3mm, inset: (x: 15mm, top: 8mm, bottom: 13mm), {
      grid(columns: (100%,), rows: (auto, 1fr, auto, 2fr),
        {
          if kicker != none {
            text(size: 9pt, weight: "bold", fill: ww-accent, tracking: 1.6pt)[#upper(kicker)]
            if extra != none { h(4mm); extra }
            v(1.5mm)
          }
          if title != none {
            text(size: 22pt, weight: 900)[#title]
          }
        },
        [],
        body,
        [],
      )
      place(bottom + left, brand-mark(height: 4mm))
      place(bottom + right, text(size: 8pt, fill: ww-muted)[#context counter(page).display()])
    })
  })
}

// Divider slide: dark, one line. Use between parts of a long deck.
#let section-slide(title, subtitle: none) = {
  pagebreak(weak: true)
  block(width: 100%, height: 100%, fill: ww-black, inset: (x: 18mm, y: 15mm))[
    #place(horizon + left)[
      #block(width: 14mm, height: 2mm, fill: ww-gradient, radius: 1mm)
      #v(6mm)
      #text(size: 30pt, weight: 900, fill: white)[#title]
      #if subtitle != none { v(4mm); text(size: 13pt, fill: white.transparentize(30%))[#subtitle] }
    ]
    #place(bottom + left, brand-mark(height: 4mm, inverse: true))
  ]
}

// Closing slide: the ask or next step, centred, plus contact line.
#let closing-slide(title, body, contact: none) = {
  pagebreak(weak: true)
  block(width: 100%, height: 100%, fill: ww-gradient, inset: (x: 18mm, y: 15mm))[
    #place(top + left, brand-mark(height: 6.5mm, inverse: true))
    #place(horizon + left, dy: -4mm)[
      #text(size: 30pt, weight: 900, fill: white)[#title]
      #v(5mm)
      #block(width: 75%, text(size: 14pt, fill: white.transparentize(10%))[#body])
    ]
    #if contact != none {
      place(bottom + left, text(size: 10pt, fill: white.transparentize(25%))[#contact])
    }
  ]
}

// ── Main template ────────────────────────────────────────────
// #show: deck.with(title: "…", lang: "sv")   — page setup only; slides follow.
#let deck(title: "", lang: "en", body) = {
  set document(title: title)
  [#metadata(brand-name) <brand-name>]
  set page(paper: "a4", flipped: true, margin: 0mm)
  set text(font: brand-font, size: 12.5pt, fill: ww-fg, lang: lang)
  set par(justify: false, leading: 0.62em, spacing: 0.95em)
  set list(marker: text(fill: ww-accent, weight: "bold")[•], indent: 2pt, body-indent: 6pt)
  set enum(numbering: n => text(fill: ww-accent, weight: "bold")[#n.])
  body
}
