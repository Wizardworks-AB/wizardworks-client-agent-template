# {{ORGANIZATION_NAME}} — Client Agent

This is the tool-neutral Wizardworks agent configuration. It uses the
`AGENTS.md` convention, which most coding agents (Codex, Cursor, Copilot
Workspace, and others) read automatically; agents that don't can be pointed
at this file explicitly. If you use Claude Code or Codex, prefer their
dedicated template variants from the Fae portal instead — they include
tool-specific automation this generic one can't carry.

> Placeholders like `{{PROJECT_NAME}}` are filled in by Fae when you download
> this template with a project selected. Anything marked `[FILL IN]` you
> complete yourself.

## Project

- **Customer:** {{ORGANIZATION_NAME}}
- **Project:** {{PROJECT_DISPLAY_NAME}} (`{{PROJECT_NAME}}`)
- **Domain:** [FILL IN: what the product/system does, in two sentences]
- **Code repositories:** [FILL IN: e.g. `~/code/<repo>/` — one line per repo]
- **Tech stack:** [FILL IN: languages, frameworks, cloud]
- **Work tracking:** [FILL IN: Azure DevOps / GitHub Issues / Jira URL]

## Project-Specific Notes

[FILL IN: domain terminology, deviations from Wizardworks standards, key
contacts. Durable team knowledge belongs in the Fae knowledge graph — keep
this section to what the agent needs before it can connect.]

## Wizardworks standards — apply to every change

The full standards live in `rules/`:

| File | Contents |
|------|----------|
| `rules/workflow.md` | Development workflow (plan → design → TDD → review → verify → document) |
| `rules/coding-style.md` | Naming conventions, file organization, size limits |
| `rules/testing.md` | TDD is mandatory; 80%+ coverage; test types and edge cases |
| `rules/security.md` | Secret management, injection prevention, auth patterns |
| `rules/git-workflow.md` | Commit format, branching, PR workflow |
| `rules/fae.md` | Fae knowledge graph — MCP tools and when to write to them |
| `docs/tdd-playbook.md` | Worked TDD examples |

No hooks run automatically in this variant, so enforce the guardrails
yourself: build + tests green before every commit, no secrets in the diff,
no debug statements, tests written before implementation.

## Fae knowledge graph (MCP)

This configuration connects your agent to the shared Fae knowledge graph over
MCP (the open Model Context Protocol — supported by most agent tools). The
connection details are in `fae-mcp.json`; how to register an MCP server
differs per tool, see `GETTING-STARTED.md`.

The working contract (full version in `rules/fae.md`):

- Brief yourself from the graph at session start (`briefing`).
- Search the graph (`context`) before asking the user about the project.
- Record decisions (`decide`), discoveries (`remember`) and blockers
  (`block`) as they happen — the graph is the team's shared memory.
- Write in English; keep identifiers and quotes verbatim.

## Template

- Variant: `{{TEMPLATE_VARIANT}}` version `{{TEMPLATE_VERSION}}`, downloaded from Fae.
- `fae-template.json` holds the download metadata. Check the Fae portal's
  *Agent templates* page occasionally for newer versions, or probe
  `gatewayBaseUrl` + `/api/client/agent-templates/{{TEMPLATE_VARIANT}}/latest`.
