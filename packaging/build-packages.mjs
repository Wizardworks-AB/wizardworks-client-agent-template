#!/usr/bin/env node

/**
 * Builds the distributable agent-template packages (Epic #1978, #1982).
 *
 * Shared core + vendor overlay:
 *   - claude-code: the full .claude/ tree + project-type variants, plus the
 *     claude-code overlay (genericized CLAUDE.md, .mcp.json template).
 *   - codex:       .claude/rules + tdd-playbook as plain markdown, plus the
 *     codex overlay (AGENTS.md, Codex MCP config template). No hooks/agents/
 *     commands — Codex has no equivalent mechanism.
 *   - generic:     same shared rules, plus a vendor-neutral AGENTS.md and a
 *     generic MCP config template.
 *
 * Every package gets its overlay's manifest.json as fae-template.manifest.json
 * (declares which files Fae token-renders at download).
 *
 * Usage:  node packaging/build-packages.mjs [variant ...]
 * Output: dist/<variant>.zip
 */

import { execSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(REPO_ROOT, "dist");

/** Copy helpers — exclude local-only state from every package. */
const EXCLUDES = new Set(["settings.local.json", ".DS_Store"]);
function copy(from, to, extraExcludes = []) {
  const excludes = new Set([...EXCLUDES, ...extraExcludes]);
  cpSync(join(REPO_ROOT, from), to, {
    recursive: true,
    filter: (src) => !excludes.has(src.split("/").pop()),
  });
}

// Claude Code-specific rule files — they describe hooks.json, slash commands
// and subagents that only exist in the claude-code variant.
const CLAUDE_ONLY_RULES = ["hooks.md", "agents-and-commands.md"];

const VARIANTS = {
  "claude-code": (stage) => {
    copy(".claude", join(stage, ".claude"));
    copy("variants", join(stage, "variants"));
    copy(".gitignore", join(stage, ".gitignore"));
    copy("packaging/claude-code", stage); // CLAUDE.md, .mcp.json.template, manifest, getting started
  },
  codex: (stage) => {
    copy(".claude/rules", join(stage, "rules"), CLAUDE_ONLY_RULES);
    copy(".claude/docs", join(stage, "docs"));
    copy("packaging/codex", stage); // AGENTS.md, config template, manifest, getting started
  },
  generic: (stage) => {
    copy(".claude/rules", join(stage, "rules"), CLAUDE_ONLY_RULES);
    copy(".claude/docs", join(stage, "docs"));
    copy("packaging/generic", stage); // AGENTS.md, mcp template, manifest, getting started
  },
};

const requested = process.argv.slice(2);
const names = requested.length > 0 ? requested : Object.keys(VARIANTS);

mkdirSync(DIST, { recursive: true });

for (const name of names) {
  const assemble = VARIANTS[name];
  if (!assemble) {
    console.error(`Unknown variant '${name}'. Known: ${Object.keys(VARIANTS).join(", ")}`);
    process.exit(1);
  }

  const stage = join(DIST, `stage-${name}`);
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(stage, { recursive: true });

  assemble(stage);

  // The overlay ships manifest.json; the package format wants
  // fae-template.manifest.json at the zip root.
  execSync(`mv manifest.json fae-template.manifest.json`, { cwd: stage });

  const zipPath = join(DIST, `${name}.zip`);
  rmSync(zipPath, { force: true });
  execSync(`zip -qr ${JSON.stringify(zipPath)} . -x '.DS_Store'`, { cwd: stage });
  rmSync(stage, { recursive: true, force: true });

  console.log(`built dist/${name}.zip`);
}

if (!existsSync(join(REPO_ROOT, ".gitignore"))) {
  console.warn("warning: repo .gitignore missing — packages may include junk");
}
