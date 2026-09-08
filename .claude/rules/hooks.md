# Automated Hooks

Guardrail hooks run automatically on every file write/edit. The wiring lives in `.claude/settings.json` (the only hook config Claude Code reads): `PreToolUse` runs `hooks/scripts/dispatch.js pre` (BLOCKS writes containing hardcoded secrets before they reach disk) and `PostToolUse` runs `dispatch.js post` (runs the applicable checks and feeds findings back for immediate fixing). `.claude/hooks/hooks.json` documents the universal ruleset; the dispatcher executes it. Requires Node 18+; fails open.

Native hooks wired at `SessionStart`:

- **Agent Template Update Check** — when this configuration was downloaded from the Fae portal (a `fae-template.json` metadata file exists), it asks Fae whether a newer template version has been published and prints a notice. Fail-quiet: in an authoring checkout or without network it does nothing.
- **Worklog reminder** — if your last session ended with unsummarized work, prints a one-line nudge to run `/report-worklog`. Fail-quiet.

See **Worklog (time reporting)** below for the full worklog hook set.

## Universal (every download)

### Blocking (Will Stop You)
- **Check for Hardcoded Secrets** — No API keys, passwords, tokens in code. **Never disable this.**

### Warning (Will Tell You)
- **Worktree Guard** — warns once per session when source is written in the **main checkout** while HEAD is a default branch (`main`/`master`/`trunk`/`develop`). Feature work belongs in its own git worktree on a feature branch: the shared checkout is used by concurrent agent sessions, and uncommitted work there gets lost. The warning also reminds you to commit applied-but-untracked template files first — a worktree materializes only *tracked* files, so an uncommitted template silently disappears in it. It keeps its state in your repo's own `.git`, never in a shared temp directory. **Advisory only — it never blocks a write**, and because `.claude/hooks/**` is template-managed it cannot be durably switched off; treat the warning as information and carry on if the write is intentional. Exempt: `.git/` and `node_modules/`, the agent template itself (`.claude/**`, `fae-template.json` — `/update-template` commits those on the default branch by design), and documentation by extension (`.md`, `.mdx`, `.txt`, `.rst`) plus root `README`/`CHANGELOG`/`LICENSE`. A source file merely *named* like a doc (`License.cs`) is still guarded.

### The rigid flow — `/feature` and `/feature-fast` are enforced, not suggested
Four scripts share one state file in your repo's own `.git`, per session (`flow-state.js`):

- **`flow-mode.js`** (UserPromptSubmit) — puts the session into a flow when you type `/feature` or `/feature-fast`, and out again on **`/feature-off`**. Rigid is not the same as inescapable; the escape belongs to you.
- **`flow-track.js`** (PostToolUse) — records what actually happened: source files written (and whether any is on the security-sensitive surface), agents spawned, `TodoWrite` called, scope and acceptance criteria recorded with `remember(type: "plan")`, and test runs.
- **`flow-guard.js`** (PreToolUse on writes) — **inside a flow, a source file cannot be written until the prerequisites are met.** Checked in flow order, first failure blocks the write and tells the agent what to do: not in the main checkout on a default branch (worktree); *fast lane:* the path is not on the surface list — otherwise blocked with an instruction to escalate to `/feature`; the task list exists (`TodoWrite`); scope and acceptance criteria are recorded; *full lane:* the **planner** agent ran and the **architect** reviewed the plan. Documentation is never blocked. Outside a flow the guard is inert.
- **`flow-gate.js`** (Stop) — you cannot end a turn having changed source without a **code-reviewer** (or **architect**) having run, nor with a security-sensitive path changed and no **security-reviewer**, nor — inside a flow — with source written after the last test run. Two independent loop guards: it honours `stop_hook_active`, and it blocks at most twice per session regardless. One or two extra turns, never a trap.

Sensitive paths are auth, secrets/credentials, migrations, infrastructure, dependency manifests and tenant isolation — the same surface list `/feature-fast` uses. Everything fails open on error.

What this does **not** enforce, because a hook cannot see it: that the acceptance criteria are *good*, that the plan is *right*, or that tests were written *before* code. Those remain the agent's and the reviewers' job. Known limit: a write made by a subagent may carry its own session id rather than the parent's, in which case the guard does not see it as part of the flow.

These are the only universal checks. Workflow disciplines that used to be phrased as "reminder hooks" — test coverage, TDD-first, security review, code review — are enforced by the rules files (`rules/testing.md`, `rules/workflow.md`, `rules/security.md`) and the agents, not by hook execution.

## Stack overlay guardrails

Stack-specific checks ship **only when you select that stack overlay at download**. Each selected stack drops a fragment at `.claude/hooks/stacks/<stack>.json` that the dispatcher discovers automatically; a stack-neutral download runs only the universal secret scan above.

- **dotnet** — Database ID Exposure (use Public IDs), DTO Usage in controllers, Layer Separation (Controller-Service-Repository), Async/Await patterns.
- **react** — Immutability (no state mutation), TanStack Query for data fetching, no stray `console.log`.
- **azure** — Infrastructure-as-Code and secret-manager guidance (via `rules/azure.md`; no executable file checks).

## Knowledge Graph (Fae)

The hook dispatcher only fires on `Write`/`Edit` tool use — it has no `git commit`/Bash, user-message, or session-lifecycle trigger. All Fae knowledge-graph behaviors are therefore enforced by `.claude/rules/fae.md` rules rather than hooks, including:

- **post-commit `remember("fact", …)`** → auto-save trigger 1 in `fae.md`.
- **deploy/rollback/incident mentions → `record_episode(…)`** → auto-save trigger 7 in `fae.md`.
- **session-start `briefing(sinceLastSession: true)`** → the "Session Start" section + first rule in `fae.md`.

## Worklog (time reporting)

The worklog is your time-reporting activity stream — separate from the knowledge graph (see the "Worklog" section in `rules/fae.md`). The platform records WHEN you worked passively (every authenticated Fae MCP call touches your current session window, surviving crash/compaction/`/clear`); these hooks add the WHAT (summaries) and make sure a session's tail isn't lost:

- **Stop** → `worklog-nudge.js` — after ~45 min of unsummarized work, nudges the agent to call `record_worklog`.
- **PostToolUse** (`record_worklog`) → `worklog-track.js recorded` — resets the nudge clock.
- **PreCompact** → `worklog-track.js compact` — forces the next Stop nudge so the summary is captured before compaction folds the detail away.
- **SessionEnd** → `worklog-track.js end` — on `/clear` or exit, if a nudge went unanswered, flags a reminder for next start (a hook can't write the worklog itself — no MCP token, and no agent turn after exit).
- **SessionStart** → `worklog-track.js remind` — surfaces that reminder once.

You can also log on demand at any time with **`/report-worklog`** — the deterministic way to capture the current session's summary (e.g. right before you `/clear` or quit).

## Adjusting Hooks for Your Codebase

A stack overlay's guardrails may not fit an existing codebase. To disable one, remove its entry from that stack's `.claude/hooks/stacks/<stack>.json`, or delete the fragment to disable the whole stack's checks. **Always keep `check-secrets` active.**
