# Wizardworks Client Agent Template

A GitHub template for creating client agent repositories. Each client agent is a Claude Code configuration that sits alongside a customer's code repository, providing AI-assisted development with automated guardrails and Fae knowledge graph integration.

## Quick Start

### 1. Create your agent repo

Click **"Use this template"** on GitHub to create a new repo (e.g., `acme-agent`).

### 2. Clone locally

```bash
git clone https://github.com/Wizardworks-AB/<your-agent-repo>.git ~/agents/<customer-name>/
```

### 3. Configure

Edit `CLAUDE.md` and fill in the placeholders:

```markdown
## Project
- **Customer:** Acme Corp
- **Domain:** E-commerce platform for industrial supplies
- **Code repository:** ~/code/acme-project/
- **Tech stack:** .NET 10, React 19, Azure
- **Fae URL:** https://remindr.wizardworks.se
```

Add project-specific notes: domain terminology, tech deviations, key contacts.

### 4. Connect to Fae

```bash
claude mcp add --transport http remindr <FAE_URL>/mcp
```

Authenticate with your Entra ID work account when prompted.

### 5. Start working

```bash
cd ~/agents/<customer-name>/
claude
```

The agent reads `CLAUDE.md`, connects to the Fae knowledge graph, and operates on the code repository specified in the config.

## Directory Structure

```
~/agents/<customer-name>/          ← This repo (agent config)
~/code/<customer-project>/         ← Customer code repo (separate)
```

The agent repo and code repo are siblings. Agent configuration, decisions, and Wizardworks IP stay separate from customer code.

## What's Included

| Component | Description |
|-----------|-------------|
| `CLAUDE.md` | Main agent configuration with Fae integration |
| `.claude/agents/` | 10 specialist agent definitions (architect, TDD, security, etc.) |
| `.claude/commands/` | 10 slash commands (`/plan`, `/tdd`, `/code-review`, `/commit`, etc.) |
| `.claude/hooks/` | 14 automated guardrails (secrets detection, layer separation, etc.) |
| `.claude/rules/` | 4 standard documents (coding style, testing, security, git workflow) |
| `.claude/skills/` | 3 pattern libraries (.NET, React, Infrastructure as Code) |
| `.claude/contexts/` | 3 execution modes (dev, research, review) |
| `variants/` | Alternative CLAUDE.md files for existing codebases and maintenance projects |

## Variants

The default `CLAUDE.md` is for **greenfield** projects. For other project types, replace `CLAUDE.md` with the appropriate variant:

| Variant | When to use |
|---------|-------------|
| `variants/greenfield/` | New projects (default — use root CLAUDE.md as-is) |
| `variants/existing-codebase/` | Working in a customer's existing codebase |
| `variants/maintenance/` | Bug-fix and support projects |

## Fae Integration

The template includes built-in instructions for the Fae knowledge graph (Remindr MCP). The agent will:

- Run `briefing()` at session start to orient itself
- Search `context(query)` before implementation to leverage existing knowledge
- Record decisions with `decide()` for traceability
- Save insights with `remember()` for future sessions
- Track blockers with `block()` / `resolve()`
- Communicate with other agents via `send()` / `inbox()`

## Learn More

- [Wizardworks Agentic Patterns and Practices](https://github.com/Wizardworks-AB/wizardworks-agentic-patterns-and-practices) — Full methodology documentation
- [Fae Architecture](https://github.com/Wizardworks-AB/fae-architecture) — Platform architecture
- [Remindr](https://github.com/Wizardworks-AB/remindr) — Knowledge graph MCP server
