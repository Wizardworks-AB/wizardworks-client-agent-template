---
name: prototype-scan
description: Scan a customer prototype repo (Lovable, Figma Make, v0, …) for what changed since the last scan, prove it with screenshots, and draft production-language work items for the team's backlog. Use when the user wants to turn prototype commits into backlog items, refine a prototype into user stories, or asks "what has the prototype validated since last time". Also invoked as /prototype-scan.
---

# Prototype Scan

Translate prototype iteration into production-grade backlog items. This is the local, human-in-the-loop
version of the platform's scheduled Atma scan: you do the same analysis, but **the user approves every
work item before it is created** (trust boundary — no work item creation without human approval).

You are NOT a changelog generator. A changelog says "what changed". You say "what has the prototype
validated, and what should the production team build because of it".

## Inputs

Resolve these before starting. Search the graph first (`context("prototype scan <repo>")`) — a previous
scan has usually stored them. Ask the user only for what the graph does not have, as a pick-list.

| Input | Where it comes from |
|-------|---------------------|
| **Prototype repo** | Local clone under `~/code/<repo>/` (see `CLAUDE.md` → Code repositories), or `gh repo clone <owner>/<repo>` |
| **Git ref** | Default branch unless the user says otherwise |
| **Scan cursor** | Graph `state` node `Prototype scan cursor — <owner>/<repo>@<ref>` holding the last scanned SHA. Absent on first run |
| **Dev server URL** | Where the prototype runs locally (e.g. `http://localhost:5173`). Optional — without it the scan is text-only |
| **Target board** | Work tracking from `CLAUDE.md` (Azure DevOps project / Jira project key) and, if the team uses one, the parent Epic to file under |

## Workflow

### Step 0 — Sync and window

```bash
git -C <repo> fetch --all --prune
git -C <repo> checkout <ref> && git -C <repo> pull --ff-only
```

Read the cursor from the graph. The scan window is `<sinceSha>..HEAD`; on a first run use the last 50
commits and say so. If the window is empty, tell the user and stop — nothing to scan is a clean result.

Generate a `runId` (`prototype-scan-<repo>-<yyyyMMddHHmmss>`) and create `.fae-prototype-scan/<runId>/`
in the agent directory for this run's artifacts. Never write into the prototype repo.

### Step 1 — Survey the changes

```bash
git -C <repo> log --oneline --stat <sinceSha>..HEAD
git -C <repo> show <sha> --stat        # per commit when the file list is not enough
```

Cluster commits into **logical themes** — coherent slices of product surface a production team can pick
up together ("Backoffice deals management", "Customer billing") — not by author or directory. Each theme
becomes one `Feature`; each concrete behavior inside it becomes a child (`User Story`, or `Bug` when the
driving commits carry `fix:`/`bug:` markers).

- Refactors, version bumps, dependency updates and pure plumbing are **not** prototype-validated behavior — skip them silently.
- A theme past ~5 children or spanning unrelated UI areas is two themes. A lone change is still a `Feature` with one child — never a bare leaf.
- Cap at ~4 themes / ~10 items per scan. More than that means the themes are too small.

If nothing is worth surfacing, say so, advance the cursor (Step 7) and stop. Empty backlogs are good. Spam is forever.

### Step 2 — Discover routes

Read the router config to learn which URL renders which component:

```bash
grep -rEn '<Route\s+path=|createBrowserRouter|useRoutes' <repo>/src --include='*.tsx' --include='*.ts'
```

Skip parameterised routes (`/:id`) and catch-alls (`*`). Trace each theme's touched files back to a
route; shared components appear on several routes — pick the most representative one.

### Step 3 — Screenshots (when a dev server URL is available)

If the prototype is not running, offer to start it (`npm install && npm run dev` in the repo — say that
this executes the prototype's install scripts on the user's machine) or proceed text-only. The user chooses.

For each route from Step 2, capture `<baseUrl><route>` to `.fae-prototype-scan/<runId>/<label>.png`
where `label` is short kebab-case (`admin-deals-edit-controls`). Use the Claude in Chrome tools if
connected, otherwise:

```bash
npx --yes playwright screenshot --viewport-size=1440,900 --wait-for-timeout=1500 "<baseUrl><route>" ".fae-prototype-scan/<runId>/<label>.png"
```

A route that fails to capture is dropped from `screenshotRefs` and from the description's Screenshots list — better no screenshot than a broken reference.

### Step 4 — Write the proposals file

Write `.fae-prototype-scan/<runId>/proposals.json` — same shape the platform scan produces, so a local
run can be replayed or compared against Atma's:

```json
{
  "version": 1,
  "runId": "<runId>",
  "scannedSha": "<HEAD sha>",
  "proposals": [
    {
      "type": "Feature",
      "title": "Backoffice deals management",
      "description": "<h3>What the prototype shows</h3><p>…</p><h3>Source</h3><ul><li>abc1234 — message</li></ul><h3>Screenshots</h3><ul><li>admin-deals-edit-controls</li></ul>",
      "children": [
        {
          "type": "User Story",
          "title": "Backoffice editors can remove deals from a company card",
          "description": "<h3>What the prototype shows</h3>…<h3>Source</h3>…<h3>Screenshots</h3>…",
          "acceptanceCriteria": "<strong>GIVEN</strong> … <strong>WHEN</strong> … <strong>THEN</strong> …<br>…",
          "screenshotRefs": ["admin-deals-edit-controls"]
        }
      ]
    }
  ]
}
```

Per item: **title** in production language, ≤80 chars ("Billing tab with empty state when no invoices
exist", not "feat: add billing component"). **description** in HTML with three `<h3>` sections. **acceptanceCriteria**
in HTML, 3–5 `GIVEN/WHEN/THEN` blocks separated by `<br>` — drafted, not final; required on children. Everything in
**English** — translate prose, keep SHAs and identifiers verbatim.

### Step 5 — Review gate (mandatory)

Present the proposals to the user as a compact table (theme → children, route, commit count) and ask
what to do with 2–4 options, always including "Chat about this":

1. **Create all** as drafted
2. **Create some** — the user names which
3. **Edit first** — the user gives feedback, you revise `proposals.json` and re-present
4. **Chat about this**

Do not create anything until the user picks 1 or 2.

### Step 6 — Create the approved items

Create the Feature first, then each child with a parent link, tagged `from-prototype; prototype-scan`
(never `fae-auto` — humans decide what the autonomous chain picks up). If a parent Epic is configured,
parent every Feature under it the same way.

Azure DevOps (`az` CLI with the `azure-devops` extension, logged in):

```bash
az boards work-item create --org <org-url> --project <project> --type Feature \
  --title "<title>" --description "<html>" --fields "System.Tags=from-prototype; prototype-scan" -o json
az boards work-item create --org <org-url> --project <project> --type "User Story" \
  --title "<title>" --description "<html>" \
  --fields "Microsoft.VSTS.Common.AcceptanceCriteria=<html>" "System.Tags=from-prototype; prototype-scan" -o json
az boards work-item relation add --org <org-url> --id <childId> --relation-type parent --target-id <featureId>
```

Then attach the screenshots each item's `screenshotRefs` name. The CLI has no attachment command, so use
the REST API with a token from the logged-in `az` session (resource id below is Azure DevOps):

```bash
TOKEN=$(az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798 --query accessToken -o tsv)

# 1. Upload — returns {"id": "...", "url": "https://dev.azure.com/<org>/<projectId>/_apis/wit/attachments/<id>"}
ATTACH_URL=$(curl -sS -X POST "<org-url>/<project>/_apis/wit/attachments?fileName=<label>.png&api-version=7.1" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/octet-stream" \
  --data-binary "@.fae-prototype-scan/<runId>/<label>.png" | jq -r .url)

# 2. Link the upload to the work item
curl -sS -X PATCH "<org-url>/_apis/wit/workitems/<id>?api-version=7.1" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json-patch+json" \
  -d "[{\"op\":\"add\",\"path\":\"/relations/-\",\"value\":{\"rel\":\"AttachedFile\",\"url\":\"$ATTACH_URL\",\"attributes\":{\"comment\":\"Prototype screenshot <route>\"}}}]"
```

A failed upload is a warning in the final report, not a reason to stop — the item exists, the label in
its description still says which capture belongs to it.

Jira: create a Story/Bug per child via the REST API with the Feature as an Epic link (or a flat list if
the project has no epics — say which), then attach with `POST /rest/api/3/issue/<key>/attachments`
(`X-Atlassian-Token: no-check`, multipart `file=@<label>.png`).

If no work-item tool is available, stop after `proposals.json` and tell the user what to paste where.

### Step 7 — Save to the graph

Per `rules/fae.md`, this is what makes the scan exist for the next session:

1. Cursor: `remember("state", "Prototype scan cursor — <owner>/<repo>@<ref>", "lastScannedSha: <HEAD sha>, scannedAt: <ISO>, runId: <runId>")` — update the existing node's content, do not create a second cursor.
2. Summary: `remember("fact", "Prototype scan <repo> <date> — <n> items", <themes, created work item ids, skipped commits and why>)`.
3. Any glossary term the prototype introduced: `remember("entity", …)`.

Then report to the user: items created (with ids/links), what was skipped and why, and the new cursor.

## Rules

- Propose only what you can back with a commit cluster; with a dev server, also a screenshot. If you cannot show it, do not write it.
- Never invent routes. No router found → proposals without screenshots, and say so.
- Never create work items without the Step 5 approval. Never tag `fae-auto`.
- Never write run artifacts into the prototype repo, and never commit or push to it.
- Advance the cursor only after the run completed (items created, or the user chose to create none).
