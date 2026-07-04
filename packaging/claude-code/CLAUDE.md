# {{ORGANIZATION_NAME}} — Client Agent

> Placeholders like `{{PROJECT_NAME}}` are filled in by Fae when you download
> this template with a project selected. Anything marked `[FILL IN]` you
> complete yourself — it is knowledge only your team has.

## Project

- **Customer:** {{ORGANIZATION_NAME}}
- **Project:** {{PROJECT_DISPLAY_NAME}} (`{{PROJECT_NAME}}`)
- **Domain:** [FILL IN: what the product/system does, in two sentences]
- **Code repositories:** [FILL IN: e.g. `~/code/<repo>/` — one line per repo with a short description]
- **Tech stack:** [FILL IN: languages, frameworks, cloud]
- **Work tracking:** [FILL IN: Azure DevOps / GitHub Issues / Jira URL]

## Project-Specific Notes

[FILL IN: domain terminology, tech deviations from Wizardworks standards,
key contacts, gotchas newcomers hit. Grow this section as the agent learns —
but remember: durable team knowledge belongs in the Fae knowledge graph,
this file is for what the agent needs before it can even connect.]

## Template Variants

This is the **greenfield** configuration. For other project types, replace
this file's working style with the matching variant from `variants/`:

- `variants/existing-codebase/` — follow customer patterns, gradual improvement
- `variants/maintenance/` — bug-focused, fast cycles, minimal changes

## Reference

All Wizardworks standards, workflows, and tool guides are in `.claude/rules/`
and `.claude/CONSTITUTION.md`. They load automatically in every session.

| Location | Contents |
|----------|----------|
| `.claude/CONSTITUTION.md` | Engineering principles, architectural standards, technology stack |
| `.claude/rules/workflow.md` | Development workflow |
| `.claude/rules/agents-and-commands.md` | 10 specialist agents, slash commands |
| `.claude/rules/fae.md` | Fae knowledge graph — MCP tools |
| `.claude/rules/hooks.md` | Automated quality hooks |
| `.claude/rules/coding-style.md` | Naming conventions, file organization |
| `.claude/rules/testing.md` | TDD workflow, coverage requirements |
| `.claude/rules/security.md` | Security guidelines, secret management |
| `.claude/rules/git-workflow.md` | Commits, branches, PRs |

## Template

- Variant: `{{TEMPLATE_VARIANT}}` version `{{TEMPLATE_VERSION}}`, downloaded from Fae.
- `fae-template.json` holds the download metadata; a session-start hook checks
  Fae for newer template versions and tells you when to re-download.
