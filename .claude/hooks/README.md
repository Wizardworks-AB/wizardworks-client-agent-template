# Hooks System

Automated enforcement of engineering standards through Claude Code hooks. A
universal core (secret-blocking) plus stack-specific guardrails that ship only
when you select that stack overlay at download.

## How the hooks run

Nothing to install — the wiring ships in this template's `.claude/settings.json`
(the only file Claude Code reads for hooks) and works out of the box:

| Event | What happens |
|-------|--------------|
| `SessionStart` | `check-template-update.js` asks Fae whether a newer template version exists |
| `PreToolUse` (Write/Edit) | `dispatch.js pre` scans the PENDING content for hardcoded secrets and **blocks the write** (exit 2) on a critical hit — the secret never lands on disk |
| `PostToolUse` (Write/Edit) | `dispatch.js post` runs the applicable checks and feeds any findings back to the agent (exit 2) so it fixes them immediately |

`hooks.json` documents the universal ruleset; `scripts/dispatch.js` executes it
using the native Claude Code hook contract. The dispatcher fails open: a broken
hook must never make the agent unable to write files. Requires Node 18+ on PATH
(below that the hooks silently no-op).

## Universal checks (every download)

- **check-secrets** — blocks writes containing API keys, passwords, tokens, or
  connection strings. **CRITICAL, never disable.** Runs on every file.
- **check-worktree** — warns (never blocks) when source is written in the main
  checkout while HEAD is a default branch, because feature work belongs in a
  dedicated git worktree. Warns once per session; state lives in the repo's own
  `.git`. Exempts `.git/`, `node_modules/`, the agent template itself, and
  documentation by extension.

Those are the only universal checks. Workflow reminders (test coverage, TDD-first,
security/code review, Fae knowledge-graph triggers) are enforced by the rules
files — see `rules/testing.md`, `rules/workflow.md`, `rules/security.md`, and
`rules/fae.md` — not by hook execution.

## Stack overlay guardrails

Each stack you select at download drops a fragment at `stacks/<stack>.json`
listing `{ script, match }` checks. `dispatch.js post` discovers every fragment
present and runs the checks whose `match` regex tests the written file's path.
A stack-neutral download has no `stacks/` fragments — only the universal checks
run.

| Stack | Checks (scripts in `scripts/`) |
|-------|--------------------------------|
| **dotnet** | `check-public-ids`, `check-dto-usage`, `check-layer-separation`, `check-async-await` |
| **react** | `check-immutability`, `check-tanstack-query`, `check-console-log` |
| **azure** | (guidance only — see `rules/azure.md`; no executable checks) |

### Fragment format

```json
{
  "stack": "dotnet",
  "checks": [
    { "script": "check-dto-usage.js", "match": "Controller" }
  ]
}
```

Each `script` is a Node file in `scripts/`; `match` is a JS regex tested against
the file path. A check-script prints findings to stderr and exits non-zero to
signal a problem; `dispatch.js` feeds that back to the agent.

## Customizing

- **Disable one stack check** — remove its entry from `stacks/<stack>.json`.
- **Disable a whole stack's checks** — delete that fragment.
- **Add a project check** — drop a script in `scripts/` and reference it from a
  fragment (or a new one). Keep it fast and fail-open.

**Always keep `check-secrets` active.**

## Testing a check

```bash
node scripts/check-secrets.js path/to/file
# Stack-overlay checks land in the same folder when their stack is selected, e.g.:
node scripts/check-dto-usage.js path/to/SomethingController.cs   # dotnet overlay
```
