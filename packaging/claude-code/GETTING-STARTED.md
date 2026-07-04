# Getting started — Claude Code agent for {{ORGANIZATION_NAME}}

1. **Unpack** this folder next to (not inside) your code repository:

   ```
   ~/agents/<customer-name>/     ← this folder
   ~/code/<customer-project>/    ← the code repository (separate)
   ```

2. **Fill in `CLAUDE.md`** — the `[FILL IN]` sections: repositories, tech
   stack, domain notes.

3. **Connect to Fae.** If you selected a project when downloading, `.mcp.json`
   is already in place — you are connected. If not: create the project in the
   Fae portal, open *Agent templates*, select the project and use
   *Download .mcp.json only*, then put that file in this folder.

4. **Start working:**

   ```bash
   cd ~/agents/<customer-name>/
   claude
   ```

   The agent signs in to Fae on first use, reads `CLAUDE.md`, briefs itself
   from the knowledge graph, and operates on the code repository you configured.

A session-start hook checks Fae for newer versions of this template and tells
you when it is time to download an update.
