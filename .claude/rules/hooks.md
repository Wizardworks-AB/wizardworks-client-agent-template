# Automated Hooks

Guardrail hooks run automatically on every file write/edit. The wiring lives in `.claude/settings.json` (the only hook config Claude Code reads): `PreToolUse` runs `hooks/scripts/dispatch.js pre` (BLOCKS writes containing hardcoded secrets before they reach disk) and `PostToolUse` runs `dispatch.js post` (runs the applicable checks and feeds findings back for immediate fixing). `.claude/hooks/hooks.json` documents the universal ruleset; the dispatcher executes it. Requires Node 18+; fails open.

Native hooks wired at `SessionStart`:

- **Agent Template Update Check** — when this configuration was downloaded from the Fae portal (a `fae-template.json` metadata file exists), it asks Fae whether a newer template version has been published and prints a notice. It runs again, at most once an hour, whenever the agent uses an MCP tool (`PostToolUse` on `mcp__.*` — in practice, whenever it talks to the Fae knowledge graph), reading the version from disk at that moment, so a long session hears about a new template without a restart. Fail-quiet: in an authoring checkout or without network it does nothing.
- **Worklog reminder** — if your last session ended with unsummarized work, prints a one-line nudge to run `/report-worklog`. Fail-quiet.

See **Worklog (time reporting)** below for the full worklog hook set.

## Universal (every download)

### Blocking (Will Stop You)
- **Check for Hardcoded Secrets** — No API keys, passwords, tokens in code. **Never disable this.**

### Warning (Will Tell You)
- **Worktree Guard** — warns once per session when source is written in the **main checkout** while HEAD is a default branch (`main`/`master`/`trunk`/`develop`). Feature work belongs in its own git worktree on a feature branch: the shared checkout is used by concurrent agent sessions, and uncommitted work there gets lost. The warning also reminds you to commit applied-but-untracked template files first — a worktree materializes only *tracked* files. It keeps its state in your repo's own `.git`, never in a shared temp directory. **Advisory only — it never blocks a write**, and because `.claude/hooks/**` is template-managed it cannot be durably switched off. Exempt: `.git/` and `node_modules/`, the agent template itself (`.claude/**`, `fae-template.json`), and documentation by extension (`.md`, `.mdx`, `.txt`, `.rst`) plus root `README`/`CHANGELOG`/`LICENSE`.

Beside the guard, and not a hook: **`worktree-local-config.js`** — run by `/feature` right after `git worktree add`, it copies the gitignored local configuration the app needs (the universal set, each selected stack's `localConfig` list in `hooks/stacks/<stack>.json`, and your `.claude/local-config.json`) from the main checkout into the new worktree. Only files git already ignores; nothing is ever added to git. The table in `rules/git-workflow.md` lists the set.

### The flow hooks — the cheap parts of `/feature`, enforced
Four scripts share one state file in your repo's own `.git`, per session (`flow-state.js`). They enforce only what costs nothing to do and loses everything when skipped; which agent runs, and when, is left to the flow — only *that* an agent does the writing is enforced.

- **`flow-mode.js`** (UserPromptSubmit) — puts the session into the flow when you type `/feature`, and out again on **`/feature-off`**.
- **`flow-track.js`** (PostToolUse) — records what actually happened: source files written (and whether any is on the security-sensitive surface), agents spawned, `TodoWrite` called, and test runs.
- **`flow-guard.js`** (PreToolUse on writes and on Bash) — **inside `/feature`, a source file cannot be written** in the main checkout on a default branch (worktree first), before the task list exists (`TodoWrite`), or **by the main session**: source in the flow is written by the implementer agent, and a hook event raised inside a subagent carries `agent_type` while the main session's does not. The same rule covers shell commands that visibly edit source — `sed -i`, a script heredoc that rewrites files, `cat > file`, `git apply` — while reads, test runs, git, documentation and scratch output pass. Documentation is never blocked. Outside the flow the guard is inert.
- **`flow-gate.js`** (Stop) — in any session, you cannot end a turn having changed source without a **code-reviewer** (or **architect**) having run, nor with a security-sensitive path changed and no **security-reviewer**; inside `/feature`, nor with source written after the last test run. Two independent loop guards: it honours `stop_hook_active`, and it blocks at most twice per session regardless. One or two extra turns, never a trap.

Sensitive paths are auth, secrets/credentials, migrations, infrastructure, dependency manifests and tenant isolation — the surface list in `rules/workflow.md`. Everything fails open on error.

### The ask gate — questions as choices, enforced

- **`ask-gate.js`** (Stop) — in any session, you cannot end a turn whose own text asks the user something in running prose without an **`AskUserQuestion`** call in that turn (`rules/asking-the-user.md`). It reads the ending turn from the transcript — the assistant's text since the last human message, code blocks and URLs ignored — and sends the agent back to ask as a choice with options, with the report kept apart (`rules/writing.md`). Same loop guards as the workflow gate: it honours `stop_hook_active` and blocks at most twice per session, so a rhetorical question costs one extra turn, never a trap. Fails open without a transcript or outside a git repository.

What this does **not** enforce, because a hook cannot see it: that the acceptance criteria are *good*, that the tests are meaningful, that a review's findings were acted on, or that the main session refrains from *reading* source — a read costs context but changes nothing, so it stays a rule (`commands/feature.md`) rather than a block. Those remain the agent's and the reviewers' job. A subagent's tool calls share the parent's session id, so its writes and test runs count towards the same flow state.

These are the only universal checks. Workflow disciplines that used to be phrased as "reminder hooks" — tests, security review, code review — are enforced by the rules files (`rules/testing.md`, `rules/workflow.md`, `rules/security.md`) and the agents, not by hook execution.

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
