# Diagram style — draw.io

The visual rules for every `.drawio` file the `diagram-drawer` agent produces. They are the
diagram counterpart of the document and deck libraries in `skills/brand/lib/`: the same
typeface, the same near-black, the same greys, and the organization's two accent colours from
`skills/brand/brand.typ`. Fixed on purpose — a diagram from this organization should look like
its documents, and two diagrams drawn a month apart should look like siblings.

## The file

Plain, uncompressed draw.io XML, saved as `.drawio`. Opens in draw.io desktop, app.diagrams.net
and the VS Code draw.io extension. One `<diagram>` page per view; a second page rather than a
second file when two views belong together (overview + detail).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Electron" version="24.0.0">
  <diagram name="System map" id="system-map">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" math="0" shadow="0" defaultFontFamily="Inter">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- EDGES FIRST — they render behind the boxes -->
        <!-- VERTICES AFTER — title, groups, boxes, labels -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

Five rules the checker (`check-drawio.mjs`) enforces:

1. **Root cells** `id="0"` and `id="1" parent="0"` always present.
2. **Edges before vertices, per parent.** Z-order is XML order within a parent: arrows declared after a box are drawn on top of it. Arrows on the layer (`parent="1"`) come before every top-level box. An arrow that starts or ends **inside a filled group** gets the group as its `parent` and is declared right after the group cell, before the group's children — on the layer it would disappear under the group's fill.
3. **`fontFamily=Inter;` in every element's style** *and* `defaultFontFamily="Inter"` on the model. draw.io does not inherit the model font into elements.
4. **`html=1;` in every element's style**, edges included. Without it `<b>`, `<br>` and `&#10;` in a label print as raw text.
5. **Unique, descriptive ids** — `erp`, `pos-sitoo`, `e-erp-pos` — never draw.io's random ids. `fontSize` at least 11 everywhere.

Also: `page="0"` on the model (transparent background, no printed page frame), `shadow="0"`,
`gridSize="10"` and every coordinate a multiple of 10.

## Typeface and text

| Element | Style |
|---------|-------|
| Diagram title | `text;html=1;align=left;verticalAlign=middle;fontFamily=Inter;fontSize=24;fontStyle=1;fontColor=#1A1A1A;` |
| Subtitle / one-line explanation | `text;html=1;align=left;verticalAlign=middle;fontFamily=Inter;fontSize=14;fontColor=#525252;` |
| Box label | `fontSize=14;fontStyle=1;` (bold name), `fontSize=12;` for a second line or a dense detail box |
| Group title | `fontSize=14;fontStyle=1;verticalAlign=top;align=left;spacingTop=4;spacingLeft=12;` |
| Arrow label | `fontSize=11;` or `12`, `fontStyle=1` when the arrow is the point of the diagram |
| Footnote / legend | `fontSize=11;fontStyle=2;fontColor=#737373;` |

A box label is a bold 14 px name over a regular 12 px second line. One cell has one `fontSize`, so the
second line is sized inline — `fontSize=14;` on the cell, no `fontStyle`, and:

```
value="&lt;b&gt;ERP&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 12px&quot;&gt;Business Central&lt;/font&gt;"
```

A one-line box keeps `fontStyle=1;` on the cell and a plain `value`. A small emoji before a name is
allowed as an icon (`👤`, `🗄`, `☁`) — one per box, never more.

Every label in the audience's language. Names of systems and products verbatim.

## Colours

Six roles carry the whole palette. The two accents come from `brand.typ`
(`brand-accent-a-hex`, `brand-accent-b-hex`); the rest are the document library's greys and
status colours, so a diagram sits naturally inside a `/document` or on a `/deck` slide.

| Role | Use for | fillColor | strokeColor | fontColor |
|------|---------|-----------|-------------|-----------|
| **Core** | the system of record, the thing everything connects to | `#1A1A1A` | `#000000` | `#FFFFFF` |
| **Accent A** | what the diagram is *about* — the new thing, the proposal, the agent | *accent A* | accent A darkened ~20 % | `#FFFFFF` |
| **Accent B** | the integration or platform layer between things | *accent B* | accent B darkened ~20 % | `#FFFFFF` |
| **Info** | channels, external SaaS, users, front ends | `#2B8AE6` | `#1A6BC0` | `#FFFFFF` |
| **Amber** | finance, logistics, manual steps, anything waiting on a person | `#F2A60D` | `#C0850A` | `#FFFFFF` |
| **Neutral** | supporting systems, everything without a claim on attention | `#F5F5F5` | `#D4D4D4` | `#1A1A1A` |
| **Problem** | what is broken, at risk or to be removed | `#FECACA` | `#EB4040` | `#1A1A1A` |
| **External** | out of scope, someone else's | `#737373` | `#525252` | `#FFFFFF` |
| **Child** | a box inside a group | `#F0F0F0` | `#D4D4D4` | `#1A1A1A` |

Darkening an accent: multiply each channel by 0.8 and round to the nearest integer —
`#EE2B9C` (238, 43, 156) → (190, 34, 125) → `#BE227D`.
Tinting for a group background: each channel `255 − 0.08 × (255 − channel)`, rounded —
`#EE2B9C` → (254, 238, 247) → `#FEEEF7`. Compute both once per diagram and reuse the values.

A box inside a group is always **Child** — Neutral fill on a Neutral group is fill on the same fill.

Arrows:

| Kind | Style |
|------|-------|
| **Heavy** — the integration the diagram argues for | `strokeColor=<accent A>;fontColor=<accent A dark>;strokeWidth=2;` |
| **Normal** | `strokeColor=#A3A3A3;fontColor=#737373;strokeWidth=1;` |
| **Problem** | `strokeColor=#EB4040;fontColor=#EB4040;strokeWidth=2;dashed=1;` |
| **Inside a group** | `strokeColor=#525252;fontColor=#525252;strokeWidth=1;` |
| **Two-way** | add `startArrow=classic;endArrow=classic;` |

Base edge style, always: `edgeStyle=orthogonalEdgeStyle;html=1;rounded=1;orthogonalLoop=1;jettySize=auto;fontFamily=Inter;fontSize=11;`
Pin the ends when the automatic route crosses a box: `exitX=0.5;exitY=1;entryX=0.5;entryY=0;` (0 = left/top, 1 = right/bottom).

Never more than four colour roles on one diagram besides Neutral. If a legend is needed, the
diagram has too many roles.

## Shapes

| Shape | Style prefix | Use |
|-------|--------------|-----|
| Rounded box | `rounded=1;whiteSpace=wrap;html=1;` | every system, component, step — the default |
| Group | `rounded=1;whiteSpace=wrap;html=1;verticalAlign=top;fontStyle=1;dashed=1;` with a tint fill and an accent stroke, or `#F5F5F5` / `#D4D4D4` | a boundary: a company, a platform, an agent, a network zone |
| Database | `shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;` | data stores only |
| Person | `shape=mxgraph.basic.person` or a rounded Info box with `👤` | users, roles |
| Cloud | `ellipse;shape=cloud;whiteSpace=wrap;html=1;` | a hosted service when the point is *that* it is hosted |
| Decision | `rhombus;whiteSpace=wrap;html=1;` | a branch in a flow |
| Document | `shape=document;whiteSpace=wrap;html=1;` | a file, a report, an order |

No 3D, no shadows, no gradients, no icons from the draw.io libraries — the words carry the
meaning, the colour carries the role.

## Layout

- **One direction per diagram.** Flows run left → right; layered architectures top → bottom (users and channels at the top, systems of record at the bottom). Never both.
- **Grid of 10 px.** Boxes 160–240 wide and 46–60 high; 200 × 50 is the default. Same size for siblings.
- **Gaps ≥ 40 px** between boxes, ≥ 60 when an arrow label runs between them. Inside a group: title band 30 px, padding 20 px — the first child starts at `y="50"`, `x="20"`; the group is 20 px wider and taller than its children's extent.
- **An arrow label sits on its own line** (draw.io centres it; the label's background masks the line). Move it only when it touches another line or a box, and then keep it ≥ 20 px from anything it does not belong to. The move is an offset in the edge geometry, not a change to the boxes:
  ```xml
  <mxGeometry relative="1" as="geometry"><mxPoint x="0" y="-16" as="offset" /></mxGeometry>
  ```
  `x` moves along the line's direction, `y` across it; negative `y` is up on a horizontal line and left on a vertical one. Pin the label to a spot with `<mxPoint x="0.3" as="geometry">`-style `x` in −1…1 on the relative geometry when the midpoint is crowded.
- **At most 12 top-level boxes.** More than that is two diagrams — an overview and a detail page.
- **Title top-left** at (40, 20), subtitle under it at (40, 60); content starts at y = 120. Canvas width 1200 is a good default; 1600 for a wide system map.
- **Read order matches importance.** The core system in the middle or on the spine; the accent box where the eye lands first.
- **Legend only when a colour is not self-evident.** A footnote line at the bottom-left in the footnote style.

Children of a group are positioned relative to the group (`parent="<group-id>"`), so a group
can be moved as one.

## Recurring diagram kinds

| Kind | Shape of it |
|------|-------------|
| **System map** | Core in the middle; Info at the top (channels, users), Amber left/right (finance, logistics), Neutral around; External greyed at the edges. Heavy arrows for the integrations under discussion. |
| **Integration flow** | Left → right, one row per actor as a group lane, steps as boxes, the data on the arrow labels. Problem arrows dashed red. |
| **Target architecture** | Top → bottom layers as groups: Channels / Applications / Integration (Accent B) / Data (Core). The proposed component in Accent A. |
| **Before / after** | Two pages in one file, identical layout, only colours and arrows change. |
| **Agent or process loop** | The loop as a ring of four to six boxes with one Heavy arrow back to the start; the actor as a group around it. |

## Export

`drawio` (draw.io desktop's command line; macOS: `/Applications/draw.io.app/Contents/MacOS/draw.io`) exports without opening a window:

```bash
drawio -x -f png -s 2 -t -o docs/assets/<name>.png docs/<name>.drawio     # 2× PNG, transparent — for /document, /deck, chat
drawio -x -f svg --embed-svg-fonts false -o docs/assets/<name>.svg docs/<name>.drawio
drawio -x -f pdf --crop -o docs/<name>.pdf docs/<name>.drawio
```

In a document or deck: `#align(center)[#image("assets/<name>.png", width: 90%)]` (documents,
by width) or `height: 10cm` (slides, by height). Without the CLI the user exports from draw.io
with File → Export as → PNG, 200 %, transparent background.
