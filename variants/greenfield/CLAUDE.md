# Greenfield Variant

> This is the default template. The root `CLAUDE.md` is designed for greenfield projects and includes Fae integration. No modifications needed beyond filling in the project placeholders.

## When to use

- New projects from scratch
- Full control over architecture and patterns
- Wizardworks tech stack (.NET, React, Azure)
- Connected to Fae knowledge graph

## Setup

1. Use this template on GitHub → creates your client agent repo
2. Clone to `~/agents/[customer-name]/`
3. Fill in the `[PLACEHOLDERS]` in `CLAUDE.md`
4. Connect to Fae: `claude mcp add --transport http remindr <FAE_URL>/mcp`
5. Start working: `cd ~/agents/[customer-name]/ && claude`
