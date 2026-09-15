// ============================================================
// Document library — portrait A4 reports, memos, proposals.
// Style: white page, near-black text, one accent gradient, a
// dark table header with zebra rows, page numbers on every page
// except the first, logo (or wordmark) once in the closing footer.
//
// Brand tokens come from ../brand.typ. Import from a document as
//   #import "/.claude/skills/brand/lib/document.typ": *
// and compile with --root at the repository root.
// ============================================================
#import "../brand.typ": *

// ── Design tokens ────────────────────────────────────────────
#let H(h, s, l) = color.hsl(h * 1deg, s * 1%, l * 1%)

#let ww-fg       = H(0, 0, 8)     // body text, near-black
#let ww-black    = H(0, 0, 10)    // table header, highlight box
#let ww-accent   = brand-accent-a
#let ww-accent-2 = brand-accent-b
#let ww-muted    = H(0, 0, 45)
#let ww-border   = H(0, 0, 88)
#let ww-surface  = H(0, 0, 96)    // light grey panels
#let ww-zebra    = H(0, 0, 97)
#let ww-code-bg  = H(220, 15, 15)
#let ww-code-fg  = H(210, 20, 88)

#let ww-gradient = gradient.linear(ww-accent, ww-accent-2, angle: 135deg)
#let ww-mono     = "DejaVu Sans Mono"   // bundled with Typst — renders everywhere

// Backwards-compatible aliases (Wizardworks documents used these names).
#let ww-pink   = ww-accent
#let ww-purple = ww-accent-2

#let ww-status-styles = (
  ok:      (border: H(142, 70, 40), bg: H(142, 60, 96), fg: H(142, 55, 22)),
  warning: (border: H(45, 90, 50),  bg: H(45, 90, 95),  fg: H(38, 70, 25)),
  danger:  (border: H(0, 84, 60),   bg: H(0, 84, 96),   fg: H(0, 60, 32)),
  info:    (border: ww-accent,      bg: ww-accent.lighten(88%), fg: ww-accent.darken(45%)),
)
#let ww-badge-styles = (
  ok:      (bg: H(142, 55, 90), fg: H(142, 55, 25)),
  warning: (bg: H(45, 90, 88),  fg: H(38, 70, 28)),
  danger:  (bg: H(0, 80, 92),   fg: H(0, 60, 35)),
  info:    (bg: ww-gradient,    fg: white),
)

// Labels per language. Override any key with `labels: (…)`.
#let ww-labels = (
  sv: (contents: "Innehåll", date: "Datum", purpose: "Syfte", from: "Från", to: "Till"),
  en: (contents: "Contents", date: "Date", purpose: "Purpose", from: "From", to: "To"),
)

// ── Logo / wordmark ──────────────────────────────────────────
// Dark-on-white mark. `height` is the cap height of the mark.
#let brand-mark(height: 12pt, inverse: false) = {
  let bytes = if inverse { brand-logo-white } else { brand-logo }
  if bytes != none {
    image(bytes, format: "svg", height: height)
  } else {
    text(size: height * 0.95, weight: 900, fill: if inverse { white } else { ww-fg }, tracking: -0.02em)[#brand-name]
  }
}

// ── Components ───────────────────────────────────────────────

// Gradient bar with an optional small label — marks a phase or a step.
#let phase-header(body, label: none) = block(
  width: 100%, fill: ww-gradient, inset: (x: 14pt, y: 10pt),
  radius: 8pt, above: 1.6em, below: 0.9em,
)[
  #set text(fill: white, weight: "semibold", size: 11pt)
  #if label != none [#text(size: 9pt, weight: "regular", fill: white.transparentize(25%))[#label] #h(6pt)]
  #body
]

// Callout with a coloured left border. variant: ok | warning | danger | info
#let status-box(body, variant: "info") = {
  let s = ww-status-styles.at(variant)
  block(
    width: 100%, fill: s.bg, stroke: (left: 4pt + s.border),
    inset: (x: 14pt, y: 10pt), radius: (right: 8pt), above: 0.9em, below: 0.9em,
  )[#set text(fill: s.fg, size: 9.5pt); #body]
}

// Small pill. variant: ok | info | warning | danger
#let badge(body, variant: "info") = {
  let s = ww-badge-styles.at(variant)
  box(fill: s.bg, inset: (x: 6pt, y: 2pt), radius: 3pt, baseline: 2pt)[
    #text(fill: s.fg, size: 8pt, weight: "bold")[#body]
  ]
}

// Table: dark header, zebra rows, rows never split across pages.
// headers: array of strings/content; rows: array of arrays.
#let report-table(headers, rows) = table(
  columns: headers.len(),
  stroke: 0.5pt + ww-border,
  inset: (x: 9pt, y: 6pt),
  align: left + top,
  fill: (col, row) => if row == 0 { ww-black } else if calc.even(row) { ww-zebra } else { white },
  table.header(..headers.map(h => text(fill: white, weight: "semibold", size: 9.5pt)[#h])),
  ..rows.flatten().map(c => text(size: 9.5pt)[#c]),
)

// Dark code block. Pass a ```-raw block.
#let code-block(body) = block(
  width: 100%, fill: ww-code-bg, inset: 12pt, radius: 8pt, above: 0.9em, below: 0.9em,
)[#set text(fill: ww-code-fg, font: ww-mono, size: 9pt); #body]

#let inline-code(body) = box(fill: ww-surface, inset: (x: 3pt, y: 1pt), radius: 2pt, baseline: 1.5pt)[
  #text(font: ww-mono, size: 9pt, fill: ww-fg)[#body]
]

// Coloured bold text for a risk level. level: high | medium | low
#let risk(body, level: "medium") = text(
  fill: (high: H(0, 70, 45), medium: H(28, 90, 48), low: H(142, 60, 35)).at(level),
  weight: "bold",
)[#body]

// Near-black highlight box — the total, the ask, the one sentence to remember.
#let estimate-total(body) = block(
  width: 100%, fill: ww-black, inset: 16pt, radius: 12pt, above: 1.4em, below: 1.4em,
)[#set text(fill: white); #body]
#let highlight = estimate-total

// Grey panel for ASCII diagrams. Pass a ```-raw block.
#let diagram-box(body) = block(
  width: 100%, fill: ww-surface, stroke: 1.5pt + ww-border,
  inset: 14pt, radius: 8pt, above: 1.1em, below: 1.1em,
)[#set text(font: ww-mono, size: 8.5pt); #body]

// Card with a short accent bar — for side-by-side options in a grid.
#let card(title, body, accent: ww-accent, height: auto) = block(
  width: 100%, height: height, fill: ww-surface, radius: 3mm, inset: 5mm,
)[
  #block(width: 9mm, height: 1.4mm, fill: accent, radius: 0.7mm)
  #v(2mm)
  #text(weight: "bold", size: 11.5pt)[#title]
  #v(2mm)
  #set text(size: 9.5pt)
  #body
]

// ── Internal parts of report() ───────────────────────────────
#let ww-header-info(meta, L) = {
  let fields = ("date", "purpose", "from", "to").map(k => meta.at(k, default: none))
  if fields.all(v => v == none) { return }
  let row(lbl, val) = if val != none [
    #text(weight: "bold")[#lbl:] #val #linebreak()
  ]
  block(
    width: 100%, fill: ww-surface, stroke: 0.5pt + ww-border,
    inset: (x: 16pt, y: 12pt), radius: 8pt, below: 1.6em,
  )[
    #set text(size: 9.5pt)
    #row(L.date, meta.at("date", default: none))
    #row(L.purpose, meta.at("purpose", default: none))
    #row(L.from, meta.at("from", default: none))
    #row(L.to, meta.at("to", default: none))
  ]
}

#let ww-toc-box(toc, L) = block(
  width: 100%, fill: ww-surface, stroke: 0.5pt + ww-border,
  inset: (x: 16pt, y: 14pt), radius: 8pt, below: 1.6em,
)[
  #text(weight: "bold")[#L.contents]
  #v(6pt)
  #set text(size: 9.5pt, fill: ww-fg.transparentize(15%))
  #for (i, item) in toc.enumerate() [
    #{i + 1}. #item #linebreak()
  ]
]

#let ww-summary-box(body) = block(
  width: 100%, fill: ww-gradient, inset: 18pt, radius: 12pt, below: 1.8em,
)[#set text(fill: white); #body]

// ── Main template ────────────────────────────────────────────
// #show: report.with(meta: (title: …, subtitle: …, date: …, purpose: …, from: …, to: …),
//                    lang: "sv", toc: ("Section", …), summary: [ … ])
#let report(
  meta: (:),
  lang: "en",
  toc: (),
  summary: none,
  labels: (:),
  summary-break: false,  // page break BEFORE the summary
  body-break: false,     // page break BEFORE the first section
  section-breaks: false, // every level-1 heading starts a new page
  body,
) = {
  let L = ww-labels.at(lang, default: ww-labels.en) + labels

  set document(title: meta.at("title", default: ""))
  [#metadata(brand-name) <brand-name>]  // queryable: typst query <file> '<brand-name>' --field value
  set page(
    paper: "a4",
    margin: 15mm,
    footer: context {
      let n = counter(page).get().first()
      if n > 1 {
        set text(size: 8pt, fill: ww-muted)
        align(right)[#n]
      }
    },
  )
  set text(font: brand-font, size: 10.5pt, fill: ww-fg, lang: lang)
  set par(justify: false, leading: 0.7em, spacing: 0.9em)
  set list(marker: text(fill: ww-accent, weight: "bold")[•])

  show heading.where(level: 1): it => {
    if section-breaks { pagebreak(weak: true) }
    block(width: 100%, above: 1.7em, below: 0.7em)[
      #set text(size: 17pt, weight: "bold", fill: ww-fg)
      #it.body
      #v(6pt, weak: true)
      #line(length: 100%, stroke: 0.6pt + ww-border)
    ]
  }
  show heading.where(level: 2): it => block(above: 1.2em, below: 0.4em)[
    #set text(size: 12.5pt, weight: "semibold", fill: ww-fg); #it.body
  ]
  show heading.where(level: 3): it => block(above: 1em, below: 0.3em)[
    #set text(size: 11pt, weight: "semibold", fill: ww-fg); #it.body
  ]

  // Masthead
  if meta.at("title", default: none) != none {
    block(below: 1.4em)[
      #set text(fill: ww-fg)
      #text(size: 26pt, weight: 900)[#meta.title]
      #if meta.at("subtitle", default: none) != none {
        v(3pt)
        text(size: 12.5pt, fill: ww-muted)[#meta.subtitle]
      }
    ]
  }

  ww-header-info(meta, L)
  if toc.len() > 0 { ww-toc-box(toc, L) }
  if summary != none {
    if summary-break { pagebreak(weak: true) }
    ww-summary-box(summary)
  }

  if body-break { pagebreak(weak: true) }
  body

  // Closing footer — mark + url, once, at the very end.
  v(2.5em)
  line(length: 100%, stroke: 0.5pt + ww-border)
  v(8pt)
  grid(
    columns: (1fr, auto),
    align: (left + horizon, right + horizon),
    brand-mark(height: 12pt),
    text(size: 8.5pt, fill: ww-muted)[#brand-url],
  )
}
