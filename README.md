# Wizardworks Client Agent Templates

Authoring source for the Wizardworks client agent templates. A client agent
is an AI-agent configuration that sits alongside a customer's code
repository, providing AI-assisted development with Wizardworks standards,
automated guardrails and Fae knowledge graph integration.

**Templates are distributed via Fae, not from this repo.** Customers and
consultants download them from the Fae portal; this repository is where the
content is authored and packaged.

## Getting a template (users)

1. Open the Fae portal → your organization → **Agent templates**.
2. Pick a variant (see below) and, optionally, the project you'll work in.
3. Preview the files if you like, then **Download template**.

With a project selected, the bundle arrives ready to use: the Fae connection
(`.mcp.json` / MCP config) is generated for that project, along with a
`fae-template.json` version marker. Without a project you get an
organization-generic bundle — create the project later and use
**Download .mcp.json only** on the same page to complete it.

Each bundle contains a `GETTING-STARTED.md` with the variant-specific steps.
The Claude Code variant also checks Fae for newer template versions at
session start and tells you when to re-download.

## Variants

| Variant | For | Main config | Extras |
|---------|-----|-------------|--------|
| `claude-code` | Claude Code | `CLAUDE.md` + `.claude/` | 10 specialist agents, 10 slash commands, 15 guardrail hooks, 3 skills, update-check hook |
| `codex` | OpenAI Codex | `AGENTS.md` + `rules/` | Codex MCP config for `~/.codex/config.toml`; guardrails as instructions (Codex has no hook system) |
| `generic` | Any AGENTS.md-capable tool | `AGENTS.md` + `rules/` | Tool-neutral MCP connection file |

All variants share the same core: the Wizardworks standards in
`.claude/rules/` (packaged as `rules/` for non-Claude variants) and the Fae
knowledge-graph working contract.

## Repository layout (authors)

```
.claude/            Shared core: rules, agents, commands, hooks, skills, docs
variants/           Project-type variants for CLAUDE.md (greenfield/existing/maintenance)
packaging/          Per-vendor overlays + manifests + build script
  build-packages.mjs
  claude-code/      CLAUDE.md (tokenized), .mcp.json.template, manifest.json
  codex/            AGENTS.md, fae-mcp-config.toml.template, manifest.json
  generic/          AGENTS.md, fae-mcp.json.template, manifest.json
CLAUDE.md           This repo's OWN agent config (Fae's client agent) — NOT packaged
```

The root `CLAUDE.md` configures the agent that works on Fae itself; the
customer-facing `CLAUDE.md` shipped in packages is
`packaging/claude-code/CLAUDE.md` (tokenized).

### Tokens

Files listed as `renderedFiles` in a variant's `manifest.json` get
`{{TOKEN}}` substitution when a user downloads a bundle:
`ORGANIZATION_ID`, `ORGANIZATION_NAME`, `FAE_MCP_URL`, `FAE_API_URL`,
`PROJECT_NAME`, `PROJECT_DISPLAY_NAME` (project-scoped only),
`TEMPLATE_VARIANT`, `TEMPLATE_VERSION`. Files marked `requiresProject` are
omitted entirely from organization-generic downloads.

## Publishing a new version (platform admins)

```bash
# 1. Build the packages
node packaging/build-packages.mjs            # → dist/claude-code.zip, dist/codex.zip, dist/generic.zip

# 2. Publish to Fae (per variant)
curl -X POST "$FAE_API/api/portal/admin/agent-templates/claude-code/versions" \
  -H "X-Admin-Service-Token: $TOKEN" \
  -F "file=@dist/claude-code.zip;type=application/zip" \
  -F "version=1.2.0" \
  -F "changelog=What changed"
```

Versions are immutable — bump the version for every publish. Published
versions become visible on every organization's *Agent templates* page
immediately.

> An automated publish pipeline (build + publish on merge) is planned under
> Epic #1978 / #1979 — until then, publishing is this manual step.

## Learn More

- [Wizardworks Agentic Patterns and Practices](https://github.com/Wizardworks-AB/wizardworks-agentic-patterns-and-practices)
- [Fae Architecture](https://github.com/Wizardworks-AB/fae-architecture)
