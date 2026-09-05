---
name: update-template
description: Update this local Fae agent template to the latest published version
usage: /update-template
---

# Update Template Command

Updates the Fae agent template files in this checkout to the latest version published by Fae, via
the `update_local_agent_template` MCP tool. Only **template-managed** files change — your own code
and customisations are never touched.

## What This Command Does

1. **Read your current version** — open `fae-template.json` at the repo root (the download
   metadata Fae generated into the bundle) and read its `variantKey`, `version` and `stacks`
   (the stack overlays this bundle was downloaded with; treat a missing `stacks` field as `[]`).
   If the file doesn't exist, tell the user this checkout wasn't produced by Fae's template
   download and stop.

2. **Ask Fae for the diff** — call the MCP tool:
   `update_local_agent_template(variant: <variantKey>, currentVersion: <version>, stacks: <stacks>)`
   — `stacks` is required and MUST be the value read from `fae-template.json` (pass `[]` when the
   file has none); passing anything else changes which stack overlays your template keeps.
   (Pass `project` only if you need to override the default from `.mcp.json`.) It returns JSON:
   `{ upToDate, newVersion, changedFiles: [{path, content}], removedPaths: [], summary,
   newMetadataJson, isDowngrade, newlyManagedPaths }`.

3. **If `upToDate` is true** — tell the user they're already on the latest version and stop.
   **If `isDowngrade` is true** — the catalog's latest version is OLDER than yours; show the
   summary and stop. Never apply a downgrade; re-downloading from the portal is the explicit
   rollback path.

4. **Preview + confirm** — show the user the `summary` and the list of `changedFiles` paths and
   `removedPaths`. If `newlyManagedPaths` is non-empty, call those files out separately: they
   existed before but were YOURS to edit, and this update takes them over — the user must
   explicitly approve overwriting each of them (they may hold customisations worth saving first).
   **Wait for explicit confirmation before writing anything.**

5. **Apply (only on confirm), in this order** —
   - For each entry in `changedFiles`: write `content` to `path` (create parent dirs as needed),
     overwriting the existing file.
   - For each path in `removedPaths`: delete that file if it exists.
   - **Last:** overwrite `fae-template.json` with `newMetadataJson` verbatim — never hand-edit it.
     Writing it last means an aborted update never claims the new version.
   - **Touch nothing else.** Any file not in `changedFiles`/`removedPaths` is user-owned — leave it
     exactly as-is. Never write outside the paths the tool returned.

6. **Commit** — if the repository uses git, `git add` the written/removed paths (plus
   `fae-template.json`) and commit them after the user has reviewed the diff. Template files left
   uncommitted exist only in this checkout's working tree: git worktrees — created by `/feature`
   step 0, and used by some agent harnesses for whole sessions — materialize only **tracked**
   files, so an agent working in one silently loses any rule, hook or command that was never
   committed.

7. **Report** — summarise what was written/removed/committed and the new version.

## Guardrails

- **Never** write a path the tool didn't return, and never delete anything outside `removedPaths`.
- If any returned path looks unsafe (absolute, or contains `..`), refuse and report it — do not write it.
- This command changes files on disk: always preview and get confirmation first (step 4).
