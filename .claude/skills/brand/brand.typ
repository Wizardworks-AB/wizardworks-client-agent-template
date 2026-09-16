// ============================================================
// Brand tokens for /document, /deck and /diagram.
//
// This is the ONE file to edit when the documents should carry
// your organization's identity. Everything else (layout, type
// scale, components) lives in lib/ and is shared by both skills.
//
// Wizardworks organization customization (Fae portal > Agent
// templates > Files). The authoritative values also live in the
// knowledge graph (preference "Wizardworks document brand tokens").
// ============================================================

// Wordmark shown where no logo is set (document footer, slide footer).
#let brand-name = "Wizardworks"

// Web address in the document footer. Empty string hides it.
#let brand-url = "wizardworks.se"

// Accent gradient: start and end colour. Used for the summary
// box, phase headers, info badges, the slide top bar, the title
// slide, and by /diagram for the accent boxes and heavy arrows.
// Hex strings, so tools outside Typst (draw.io) read the
// same values; the Typst colours are derived below.
#let brand-accent-a-hex = "#E6298B"
#let brand-accent-b-hex = "#8C52CC"

// Logo files, relative to this folder. The dark version is
// used on white; the white version on the gradient title slide.
#let brand-logo-file = "logo.svg"
#let brand-logo-white-file = "logo-white.svg"

// Body typeface. Inter is the reference; the fallbacks keep the
// document sans-serif on a machine without it (see SKILL.md).
#let brand-font = ("Inter", "Arial")

// -- Derived: do not edit below --------------------------------
#let brand-accent-a = rgb(brand-accent-a-hex)
#let brand-accent-b = rgb(brand-accent-b-hex)
#let brand-logo = if brand-logo-file != none { read(brand-logo-file, encoding: none) } else { none }
#let brand-logo-white = if brand-logo-white-file != none { read(brand-logo-white-file, encoding: none) } else { none }
