// ============================================================
// Brand tokens for /document, /deck and /diagram.
//
// This is the ONE file to edit when the documents should carry
// your organization's identity. Everything else (layout, type
// scale, components) lives in lib/ and is shared by both skills.
//
// Fae fills Wizardworks when the template is downloaded.
// The template only rewrites this file on update if the shipped
// default itself changed — keep a copy of your values in the
// knowledge graph (remember("preference", "Document brand", …))
// so they can be restored if that happens.
// ============================================================

// Wordmark shown where no logo is set (document footer, slide footer).
#let brand-name = "Wizardworks"

// Web address in the document footer. Empty string hides it.
#let brand-url = "wizardworks.se"

// Accent gradient: start and end colour. Used for the summary
// box, phase headers, info badges, the slide top bar, the title
// slide — and by /diagram for the accent boxes and heavy arrows.
// Two colours from your identity, dark enough for white text on
// top. Hex strings, so tools outside Typst (draw.io) read the
// same values; the Typst colours are derived below.
#let brand-accent-a-hex = "#E6298B"
#let brand-accent-b-hex = "#8C52CC"

// Logo files, relative to this folder. Set to a filename to use
// them, e.g. "logo.svg" and "logo-white.svg". The dark version is
// used on white; the white version on the gradient title slide.
// SVG is preferred (crisp at any size, text-safe in the template).
#let brand-logo-file = "logo.svg"
#let brand-logo-white-file = "logo-white.svg"

// Body typeface. Inter is the reference; the fallbacks keep the
// document sans-serif on a machine without it (see SKILL.md).
#let brand-font = ("Inter", "Arial")

// ── Derived — do not edit below ──────────────────────────────
#let brand-accent-a = rgb(brand-accent-a-hex)
#let brand-accent-b = rgb(brand-accent-b-hex)
#let brand-logo = if brand-logo-file != none { read(brand-logo-file, encoding: none) } else { none }
#let brand-logo-white = if brand-logo-white-file != none { read(brand-logo-white-file, encoding: none) } else { none }
