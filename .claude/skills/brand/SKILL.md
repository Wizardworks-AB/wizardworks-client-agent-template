---
name: brand
description: Visual identity and the Typst library behind /document, /deck and /diagram — organization name, logo, accent colours, typeface. Use when the user wants generated documents, decks or diagrams to look like their organization, or when a /document or /deck compile fails on a brand, logo or font problem.
---

# Brand

`/document` and `/deck` render through one Typst library that lives here. The look — type scale, spacing, components, slide scaffold — is fixed and shared. What the organization owns is in **one file**: `brand.typ`.

```
skills/brand/
├── brand.typ          ← the tokens you edit (name, url, two accent colours, logo files, font)
├── install-fonts.sh   ← one-shot Inter install (macOS, Linux); install-fonts.ps1 for Windows
├── lib/document.typ   ← portrait A4 library (do not edit)
├── lib/deck.typ       ← landscape slide library, builds on document.typ (do not edit)
└── logo.svg …         ← your logo files, if you add them
```

Documents import the library by its installed path and are compiled with `--root` at the repository root, so nothing has to be registered on the machine:

```typst
#import "/.claude/skills/brand/lib/document.typ": *    // or lib/deck.typ
```

## Tokens

| Token | Default | Used for |
|-------|---------|----------|
| `brand-name` | the organization name Fae filled in at download | Wordmark in the document footer and on slides when no logo is set |
| `brand-url` | empty (hidden) | Right side of the document footer |
| `brand-accent-a-hex`, `brand-accent-b-hex` | pink → purple (`"#EE2B9C"`, `"#994DE6"`) | The two accents as hex strings. In documents and decks they become the gradient: summary box, phase headers, info badges, slide top bar, title and closing slides; bullet markers and kickers use accent A. `/diagram` reads the same two values for its accent boxes and heavy arrows. The Typst colours `brand-accent-a` / `brand-accent-b` are derived — do not set them directly |
| `brand-logo-file`, `brand-logo-white-file` | `none` (wordmark) | Dark-on-white mark for footers; white mark for the gradient slides |
| `brand-font` | `("Inter", "Arial")` | Body typeface with its fallback |

Everything else — near-black text, grey panels, table header, callout colours — is deliberately not a token. It is what makes every document from the organization read as one family.

## Adding the logo

1. Save the logo as **SVG** in this folder: `logo.svg` (dark, for white backgrounds) and `logo-white.svg` (white, for the gradient). SVG is text, so it travels with the template and scales crisply. If only a PNG exists, wrap it in an SVG rather than editing the library: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 W H"><image width="W" height="H" xlink:href="data:image/png;base64,…"/></svg>`.
2. In `brand.typ`:
   ```typst
   #let brand-logo-file = "logo.svg"
   #let brand-logo-white-file = "logo-white.svg"
   ```
3. Compile any document and check the closing footer and a title slide.

The mark is scaled by height (12 pt in the footer, 6.5 mm on a title slide), so a wide wordmark logo works best. A square emblem also works; it just renders small.

## Changing the colours

Pick two colours from the identity that are dark enough to carry white text, and set them in `brand.typ`:

```typst
#let brand-accent-a-hex = "#0F62FE"
#let brand-accent-b-hex = "#8A3FFC"
```

One colour is fine too — set both to the same value and the gradient becomes flat.

## Fonts

Inter is the reference typeface and is not bundled (font binaries cannot travel through the template update). Install it once per machine with the script that ships here — it fetches the official release and is a no-op when Typst already sees Inter:

```bash
bash .claude/skills/brand/install-fonts.sh                                          # macOS, Linux
powershell -ExecutionPolicy Bypass -File .claude\skills\brand\install-fonts.ps1   # Windows
```

Then `typst fonts | grep -i inter` should list it. Without it, documents fall back to Arial and Typst prints `warning: unknown font family: inter` — the layout still works, the look does not.

## What survives `/update-template`

`brand.typ` is template-managed, but an update only rewrites a file when the **shipped default** changed between the version you have and the new one. Your edits survive every update that leaves the default alone. When the template does ship a new `brand.typ`, `/update-template` lists it under changed files and you re-apply your values — so keep them in the knowledge graph:

```
remember("preference", "Document brand", "brand.typ values: name …, url …, accent-a …, accent-b …, logo files …")
```

Logo files you add here are yours; the template never ships a file named `logo*.svg` in this folder.

## Setting the identity once for the whole organization

If your organization uses Fae's **template customizations** (portal → Agent templates → Customize), put `brand.typ`, `logo.svg` and `logo-white.svg` there under `.claude/skills/brand/`. Every download and every `/update-template` for the organization then carries the identity, and no repository needs the edit above. That is the recommended home for it.
