# {{ORGANIZATION_NAME}} — Client Agent (Codex)

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

## Wizardworks standards — read before writing code

The full standards live in `rules/` and apply to every change:

| File | Contents |
|------|----------|
| `rules/workflow.md` | The Wizardworks development workflow (plan → design → TDD → review → verify → document) |
| `rules/coding-style.md` | Naming conventions, file organization, size limits |
| `rules/testing.md` | TDD is mandatory; 80%+ coverage; test types and edge cases |
| `rules/security.md` | Secret management, injection prevention, auth patterns |
| `rules/git-workflow.md` | Commit format, branching, PR workflow |
| `rules/fae.md` | Fae knowledge graph — MCP tools and when to write to them |
| `docs/tdd-playbook.md` | Worked TDD examples |

Codex has no automated hook system, so the guardrails Claude Code enforces
mechanically are YOUR responsibility here. Before every commit:

- run the build and the tests (`dotnet test` / `pnpm test`) and make them pass;
- search your diff for hardcoded secrets, connection strings and API keys;
- no `console.log`/debug statements, no commented-out code;
- follow TDD — write the failing test first (`rules/testing.md`).

## Fae knowledge graph (MCP server "fae")

This agent is connected to the shared Fae knowledge graph. The essentials
(full contract in `rules/fae.md`):

- Start every session with `briefing(sinceLastSession: true)`.
- Search the graph (`context(query)`) before asking the user anything about
  the project — the graph owns project context.
- Record decisions with `decide(decision, rationale)`, discoveries with
  `remember(...)`, blockers with `block(...)` — immediately, not on request.
- Write to the graph in English; keep identifiers and quotes verbatim.

MCP setup: see `GETTING-STARTED.md` — the rendered `fae-mcp-config.toml`
contains the server entry for your `~/.codex/config.toml`.

## Template

- Variant: `{{TEMPLATE_VARIANT}}` version `{{TEMPLATE_VERSION}}`, downloaded from Fae.
- `fae-template.json` holds the download metadata. Codex has no session hooks,
  so check for template updates yourself now and then: open *Agent templates*
  in the Fae portal and compare the version — or ask the agent to `curl`
  the version endpoint listed in `fae-template.json` (`gatewayBaseUrl` +
  `/api/client/agent-templates/{{TEMPLATE_VARIANT}}/latest`).
