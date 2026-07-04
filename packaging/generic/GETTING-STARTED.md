# Getting started — agent configuration for {{ORGANIZATION_NAME}}

1. **Unpack** this folder next to (not inside) your code repository:

   ```
   ~/agents/<customer-name>/     ← this folder
   ~/code/<customer-project>/    ← the code repository (separate)
   ```

2. **Fill in `AGENTS.md`** — the `[FILL IN]` sections: repositories, tech
   stack, domain notes. Most agent tools read `AGENTS.md` automatically;
   otherwise point your tool at it as its instruction file.

3. **Connect to Fae.** If you selected a project when downloading, this folder
   contains `fae-mcp.json` with the MCP server details (HTTP URL + two
   headers). Register that server in your agent tool — every tool has its own
   way (Claude Code: `.mcp.json`; Codex: `~/.codex/config.toml`; others: see
   their MCP documentation). If you didn't select a project: create one in the
   Fae portal, open *Agent templates*, select it, and download the connection
   file from there.

4. **Start your agent** in this folder and begin working. Session one should
   start with a `briefing` call against the Fae knowledge graph.
