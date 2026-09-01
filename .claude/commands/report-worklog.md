---
name: report-worklog
description: Summarize the work done so far this session and log it to your worklog (time reporting)
usage: /report-worklog
---

# Report Worklog Command

Explicitly capture what this session's work was about into your **worklog** — the activity stream
that feeds your time reporting (Timekeeper), separate from the knowledge graph. Use it whenever you
want to make sure the current stretch of work is logged: before wrapping up, before `/clear`, before
quitting, or any time you've just finished something worth recording.

The platform already records WHEN you worked (passive session windows from MCP traffic, which survive
crash, compaction and `/clear`). This command adds the WHAT — the summary half — on demand, so you
don't have to wait for the periodic nudge.

## What This Command Does

1. **Summarize the session** — in 1–3 sentences of English, state what this session's work was
   about (what you built, fixed, investigated, or decided) — the whole session so far, not just the
   last step. Latest summary wins for the current window.
2. **Call `record_worklog`** — invoke the `record_worklog` MCP tool on the Fae server with that
   `summary`. This attaches the summary to your current worklog window (or opens one if a silence
   just closed the previous window).
3. **Confirm** — report back the one-line summary you logged.

## Rules

- Write the summary in **English** (the worklog, like the graph, is English).
- Keep it to **1–3 sentences** describing the WORK, not a play-by-play of tool calls.
- This is the worklog, **not** the knowledge graph — do **not** use `remember`/`decide` here, and do
  **not** duplicate the summary into the graph. See the "Worklog — Time Reporting Is Separate From
  Knowledge" section in the Fae rules.
- If the Fae MCP server isn't connected (no worklog tool available), say so and do nothing else.

## Workflow

```
/report-worklog
     ↓
┌─ 1. Summarize the session's work (1–3 English sentences)
├─ 2. record_worklog(summary: "…")
└─ 3. Confirm what was logged
```
