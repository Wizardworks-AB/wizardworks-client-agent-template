# Getting started — Codex agent for {{ORGANIZATION_NAME}}

1. **Unpack** this folder next to (not inside) your code repository:

   ```
   ~/agents/<customer-name>/     ← this folder
   ~/code/<customer-project>/    ← the code repository (separate)
   ```

2. **Fill in `AGENTS.md`** — the `[FILL IN]` sections: repositories, tech
   stack, domain notes. Codex reads `AGENTS.md` automatically.

3. **Connect to Fae.** If you selected a project when downloading, this folder
   contains `fae-mcp-config.toml` — append its contents to
   `~/.codex/config.toml`. If not: create the project in the Fae portal, open
   *Agent templates*, select the project and variant Codex, and download the
   config file from there.

4. **Start working:**

   ```bash
   cd ~/agents/<customer-name>/
   codex
   ```

Codex has no session hooks, so re-check the Fae portal's *Agent templates*
page occasionally for newer template versions.
