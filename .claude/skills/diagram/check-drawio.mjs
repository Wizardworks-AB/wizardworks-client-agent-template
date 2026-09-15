#!/usr/bin/env node
/**
 * check-drawio.mjs — lint a .drawio file against the rules in STYLE.md.
 *
 * Usage:  node .claude/skills/diagram/check-drawio.mjs <file.drawio> [more files]
 * Exit 0 when every page of every file passes; exit 1 with one line per finding.
 *
 * draw.io renders the XML forgivingly, so the mistakes this catches are not
 * visible as errors — they show up as HTML tags printed as text, arrows drawn
 * on top of boxes, a wrong typeface, or a file that is fine in one viewer and
 * broken in the next. The checks are the ones a human would do by opening the
 * file in draw.io and looking; run this before that, not instead of it.
 *
 * No dependencies: the XML is read with regular expressions, which is enough
 * for the flat <mxCell> list draw.io writes and keeps the script runnable on
 * any machine that has Node.
 */

import { readFileSync } from 'node:fs';

const MIN_FONT_SIZE = 11;          // anything smaller is unreadable when exported
const MIN_VERTEX_FONT_SIZE = 14;   // top-level boxes; smaller is a warning, not an error

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) out[m[1]] = m[2];
  return out;
}

function styleMap(style) {
  const out = {};
  for (const part of (style || '').split(';')) {
    if (!part) continue;
    const i = part.indexOf('=');
    if (i === -1) out[part] = '1';
    else out[part.slice(0, i)] = part.slice(i + 1);
  }
  return out;
}

/**
 * Check one <diagram> page. Returns a list of findings (strings); a finding
 * that starts with "warn: " is advice, everything else fails the check.
 */
export function checkPage(xml, pageName = 'page') {
  const findings = [];
  const where = (msg) => findings.push(`${pageName}: ${msg}`);
  const warn = (msg) => findings.push(`warn: ${pageName}: ${msg}`);

  const model = xml.match(/<mxGraphModel\b[^>]*>/);
  if (!model) {
    where('no <mxGraphModel> — the page is compressed or empty; save it uncompressed (File → Properties → Compressed off) or write plain XML');
    return findings;
  }
  const modelAttrs = attrs(model[0]);
  const defaultFont = modelAttrs.defaultFontFamily;
  if (!defaultFont) where('mxGraphModel has no defaultFontFamily — set it to the diagram typeface');
  if (modelAttrs.page !== '0') where('mxGraphModel should have page="0" (transparent background, no printed page frame)');

  const cells = [...xml.matchAll(/<mxCell\b[^>]*>/g)].map((m, index) => ({ index, tag: m[0], a: attrs(m[0]) }));
  if (cells.length === 0) { where('no <mxCell> elements'); return findings; }

  const byId = new Map();
  for (const c of cells) {
    if (c.a.id === undefined) { where(`cell #${c.index} has no id`); continue; }
    if (byId.has(c.a.id)) where(`duplicate id "${c.a.id}"`);
    byId.set(c.a.id, c);
  }
  if (!byId.has('0')) where('missing root cell <mxCell id="0" />');
  const layer = byId.get('1');
  if (!layer || layer.a.parent !== '0') where('missing layer cell <mxCell id="1" parent="0" />');

  const content = cells.filter((c) => c.a.id !== '0' && c.a.id !== '1');
  const edges = content.filter((c) => c.a.edge === '1');
  const vertices = content.filter((c) => c.a.vertex === '1');
  // Z-order is XML order *within a parent*: an edge must precede every vertex
  // that shares its parent. Edges on the layer (parent="1") therefore come
  // before all top-level boxes; an edge that ends inside a filled group has
  // the group as parent and sits right after the group, before its children —
  // on the layer it would be painted over by the group's fill.
  const firstVertexByParent = new Map();
  for (const v of vertices) if (!firstVertexByParent.has(v.a.parent)) firstVertexByParent.set(v.a.parent, v);
  const lateEdges = edges.filter((e) => {
    const v = firstVertexByParent.get(e.a.parent);
    return v && e.index > v.index;
  });
  if (lateEdges.length) {
    const e = lateEdges[0];
    where(`${lateEdges.length} edge(s) declared after a box with the same parent — edges come first so they render behind the boxes (first offender "${e.a.id}", parent "${e.a.parent}")`);
  }

  for (const c of content) {
    const id = c.a.id;
    if (c.a.edge !== '1' && c.a.vertex !== '1') { where(`"${id}" is neither vertex="1" nor edge="1"`); continue; }
    if (c.a.parent === undefined || !byId.has(c.a.parent)) where(`"${id}" has parent "${c.a.parent}", which does not exist`);
    const st = styleMap(c.a.style);
    if (!c.a.style) { where(`"${id}" has no style attribute`); continue; }
    if (!st.fontFamily) where(`"${id}" has no fontFamily in its style — the typeface must be set on every element, not only on the model`);
    else if (defaultFont && st.fontFamily !== defaultFont) where(`"${id}" uses fontFamily=${st.fontFamily}, the model says ${defaultFont}`);
    if (st.html !== '1') where(`"${id}" lacks html=1 — HTML in its label would print as raw tags`);
    if (!st.fontSize) where(`"${id}" has no fontSize`);
    else {
      const size = Number(st.fontSize);
      if (!(size >= MIN_FONT_SIZE)) where(`"${id}" has fontSize=${st.fontSize}; minimum is ${MIN_FONT_SIZE}`);
      else if (c.a.vertex === '1' && c.a.parent === '1' && !st.text && size < MIN_VERTEX_FONT_SIZE) {
        warn(`"${id}" is a top-level box with fontSize=${st.fontSize}; boxes read best at ${MIN_VERTEX_FONT_SIZE} or more (12 is fine for dense detail boxes)`);
      }
    }
    if (c.a.edge === '1') {
      for (const end of ['source', 'target']) {
        if (c.a[end] === undefined) where(`edge "${id}" has no ${end} — connect every arrow to a box`);
        else if (!byId.has(c.a[end])) where(`edge "${id}" ${end}="${c.a[end]}" does not exist`);
      }
    }
    if (c.a.vertex === '1' && !c.tag.endsWith('/>')) {
      // Geometry follows inside the element; check it is there.
      const after = xml.slice(xml.indexOf(c.tag) + c.tag.length, xml.indexOf(c.tag) + c.tag.length + 400);
      if (!/<mxGeometry\b/.test(after)) where(`vertex "${id}" has no <mxGeometry>`);
    }
  }
  return findings;
}

/** Check a whole file: every <diagram> page. */
export function checkFile(path) {
  const xml = readFileSync(path, 'utf8');
  if (!/<mxfile\b/.test(xml)) return [`${path}: not a draw.io file (no <mxfile>)`];
  const pages = [...xml.matchAll(/<diagram\b([^>]*)>([\s\S]*?)<\/diagram>/g)];
  if (pages.length === 0) return [`${path}: no <diagram> pages`];
  const findings = [];
  for (const [, tagAttrs, body] of pages) {
    const name = attrs(`<diagram ${tagAttrs}>`).name || 'page';
    findings.push(...checkPage(body, `${path} · ${name}`));
  }
  return findings;
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href
  || (process.argv[1] || '').endsWith('check-drawio.mjs');
if (isMain) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('usage: node check-drawio.mjs <file.drawio> [...]');
    process.exit(2);
  }
  let failed = false;
  for (const file of files) {
    const all = checkFile(file);
    const warnings = all.filter((f) => f.startsWith('warn: '));
    const findings = all.filter((f) => !f.startsWith('warn: '));
    for (const w of warnings) console.log(`WARN ${w.slice(6)}`);
    if (findings.length === 0) {
      const xml = readFileSync(file, 'utf8');
      const edges = (xml.match(/<mxCell\b[^>]*\bedge="1"/g) || []).length;
      const vertices = (xml.match(/<mxCell\b[^>]*\bvertex="1"/g) || []).length;
      console.log(`OK  ${file} — ${vertices} elements, ${edges} arrows`);
    } else {
      failed = true;
      for (const f of findings) console.log(`ERR ${f}`);
    }
  }
  process.exit(failed ? 1 : 0);
}
