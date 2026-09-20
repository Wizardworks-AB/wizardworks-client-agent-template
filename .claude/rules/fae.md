# Fae — Persistent Knowledge Graph (MCP)

This agent is connected to the Fae knowledge graph via Remindr MCP. The knowledge graph is a shared, persistent memory across all agents and sessions working on this project.

## Configuration

The MCP server is configured in the MCP config file your variant ships — `.mcp.json` (claude-code), `fae-mcp-config.toml` (codex), or `fae-mcp.json` (generic) — with `X-Organization-Id` and `X-Default-Project` headers. This means you **do not need to pass `project`** on every tool call — it resolves automatically from the header. Only pass `project` if you need to work with a different project than the default.

## Session Start

Run `briefing(sinceLastSession: true)` at the start of every session to orient yourself — recent decisions, new blockers, what changed since your last session. If the user mentions a specific project, run `status(project)` for deeper detail.

## The Graph Owns Context

The knowledge graph is the authoritative source of project context — decisions, infrastructure, conventions, history. You do not. Before asking the user **anything** about the project, search the graph first.

If a user request references something you don't know — a system, a decision, a name, a process, a past incident — your first move is `context(query)`, not a clarifying question. Only escalate to the user for information the graph genuinely does not have.

**Wrong**: User asks about prod pipelines → "I don't have tools for that, where do pipelines run?"
**Right**: User asks about prod pipelines → `context("prod pipelines containers")` → answer, or ask only about the specific gap the graph didn't cover.

## Graph Language — Always English

All communication with the graph is in English, in both directions — what you write (`remember`, `decide`, `block`, `resolve`) and what you query (`context`, `why`, `list` filters). Translate the user's Swedish (or any other language) into English before calling a graph tool, and translate graph content back into the conversation language when presenting it to the user.

**Exception — verbatim fragments stay in original form**: proper nouns, product/project names, identifiers, filenames, error output, and direct quotes. Translate the narration around them, not the fragments themselves.

**Why**: the codebase is English (per `CLAUDE.md`), embedding-based search, deduplication, and contradiction detection work best with a single language, and the graph is shared across agents and future readers who may not read Swedish.

### Migration — Opportunistic Swedish → English Cleanup

Existing Swedish nodes will produce worse retrieval and won't dedup against new English nodes. Do **not** run a bulk migration — translate opportunistically instead:

- When you `get()` or `context()` a node and notice it's in Swedish, translate it to English on your next natural write to that node (e.g. when you supersede a decision, resolve a blocker, or add a related fact).
- When using `forget()` or `resolve()` on a Swedish node, the replacement/resolution content you write must be in English.
- Never translate verbatim fragments inside a node (quotes, identifiers, error output) — only the narration.
- Do not invent edits just to translate. Touch nodes only when you have a real reason to write to them.

## Auto-Save Triggers — You MUST Save to Fae When Any of These Happen

1. **After every git commit** → `remember("fact", "commit summary", "branch, files changed, what was done and why")`
2. **After making a decision** → `decide(decision, rationale)` — do NOT wait to be asked
3. **After creating a plan** → `remember("plan", title, full plan content)`
4. **After hitting a surprise/gotcha** → `remember("gotcha", title, content)`
5. **After resolving a blocker** → `resolve(nodeId, resolution)`
6. **After completing a significant task** → `remember("fact", "task summary", details)`
7. **After a deploy / rollback / incident / meeting** → `record_episode(title, content, occurredAt)` — a time-stamped event, not a generic fact. For a meeting, `occurredAt` is the meeting's start time: Timekeeper dates the node by it, so notes written the day after still land on the meeting day
8. **After observing the outcome of a decision or plan** → `record_outcome(decisionOrPlanNodeId, content, direction)` where direction is `positive` or `negative`
9. **When you are guessing, not stating a known fact** → `hypothesize(title, content, initialConfidence)` instead of `remember("fact", ...)`; later `confirm_hypothesis` / `refute_hypothesis` with evidence
10. **When a question is raised with no answer yet** → `ask_question(question, context?)`; `answer_question` once it is resolved
11. **When starting a larger goal** → `set_goal(title, content)` (sub-goals link via `part_of`; the plan/decision that achieves it links via `achieves_goal`)

This is not optional. If you committed code or made a decision without saving to Fae, you have a bug in your workflow. The next agent session will have no idea what happened.

## During Work — Write Proactively

- Made a decision? → `decide(decision, rationale)`
- Discovered a fact or pattern? → `remember("fact", title, content)`
- Hit a surprise or gotcha? → `remember("gotcha", title, content)`
- Something is blocking progress? → `block(description)`
- Blocker resolved? → `resolve(nodeId, resolution)`

## Worklog — Time Reporting Is Separate From Knowledge

`record_worklog(summary)` feeds the USER'S TIME REPORTING (Timekeeper), not the knowledge graph. The platform already tracks WHEN you worked (session windows from your MCP traffic — automatic, survives crash/compaction//clear); the summary adds WHAT the session's work was about, in your words.

- Call `record_worklog` with 1-3 English sentences when a work session wraps up, before context compaction, and after long stretches of work. The latest call replaces the previous summary for the current window — always summarize the WHOLE session so far.
- A Stop-hook reminds you when too long has passed unsummarized; complying resets the reminder. You (or the user) can also log on demand any time with the `/report-worklog` command — do this before `/clear` or quitting so the session's tail isn't lost.
- Do NOT route knowledge through the worklog (use `remember`/`decide`/`propose`) and do NOT write activity noise into the graph to "improve time reports" — the two streams are separate by design.
- Known limitation: session windows are derived from your MCP traffic, so long stretches of purely local work under-count. When that happens, call `record_worklog` with explicit `startedAt`/`endedAt` for the stretch — Timekeeper flags such days as "low coverage — review" in the report's audit trail.
- **Unattended runs are not the person's time.** When this harness runs without a person at the keyboard — a loop, a scheduled job, a CI run — its MCP connection must carry the header `X-Fae-Caller: agent`. The Claude Code template's `.mcp.json` reads it from the `FAE_CALLER` environment variable (`FAE_CALLER=agent claude -p …`); on other runtimes add the header to the connection used for such runs. That time shows on the person's "My worklog" as agent time and is never drafted into their time report. Fae's own platform agents need nothing: they carry no person and never reach the worklog.

## Relationships Between Nodes

You do **not** need to create relationships manually. They are created automatically:

- **`relatedTo` parameter** — `remember()`, `decide()`, and `block()` accept an optional `relatedTo: string[]` with node IDs. Use this when you know which existing node your new knowledge relates to.
- **AutoLinker** — semantic matching runs automatically on every create and links to related existing nodes.

## Graph-First Rule

Every time you create substantive content (plans, specs, analysis), store the **full content** in a graph node via `remember()`. A file reference like "see plan in X.md" is not memory — it is a broken link waiting to happen.

**The title is the conclusion, not the topic.** It is what semantic search matches on and all a briefing shows. "Timekeeper drafted-hours inflation: node-timestamp sessions extend the anchor" is retrievable; "Issue #3105" or "agent" is not. This applies to every write tool. The content keeps everything — verbatim errors, ids, `file:line`, what was ruled out and why; the brevity in `rules/writing.md` is for people, and the graph has no attention budget.

## Read Tools

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `briefing` | `project?`, `recentHours?` (default 24), `sinceLastSession?` (default false), `timezone?` | Project summary — open blockers, recent decisions, stale items |
| `context` | `query`, `project?`, `preferSummaries?`, `includeExpired?` | Semantic search. `preferSummaries` substitutes community-summary nodes for their members; `includeExpired` includes expired edges |
| `status` | `project?` | Current project state — active decisions, open blockers, recent changes |
| `get` | `nodeId` | Full untruncated node content (use when context() truncates, or to drill into a community node's members) |
| `list` | `type?`, `status?`, `project?` | List nodes with filters |
| `why` | `query`, `project?` | Trace causal/decision chains — follows achieves_goal, caused, led_to, supersedes, validates, refutes edges |
| `blockers` | `project?` | List all active blockers |
| `goals` | `project?`, `parentGoalId?` | List goals; hierarchical via `part_of` edges |
| `open_questions` | `project?` | List unanswered (`status: active`) question nodes |

## Write Tools

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `remember` | `type`, `title`, `content`, `project?`, `relatedTo?` (nodeId[]) | Store knowledge. Types: `fact, gotcha, preference, state, entity, plan`. Do NOT use for decisions or blockers — they have dedicated tools. |
| `decide` | `decision`, `rationale`, `project?`, `alternatives?` (string[]), `supersedes?` (nodeId), `relatedTo?` (nodeId[]) | Record a decision with rationale. Auto-detects contradictions. Use `supersedes` when replacing a previous decision. |
| `block` | `description`, `project?`, `urgency?` (`low/medium/high/critical`), `relatedTo?` (nodeId[]) | Register a blocker with urgency level. |
| `resolve` | `nodeId`, `resolution` | Resolve a blocker. Automatically creates a linked fact node with the resolution. |
| `forget` | `nodeId`, `reason?` | Mark knowledge as stale. Also marks linked contradictions as stale. |
| `record_episode` | `title`, `content`, `occurredAt`, `project?`, `relatedTo?`, `caused?` | Record a time-stamped event (deploy, release, incident). |
| `record_outcome` | `decisionOrPlanNodeId`, `content`, `direction` (`positive`/`negative`), `observedAt?`, `project?` | Record the realized outcome of a decision/plan. Negative outcomes auto-check against confirmed hypotheses. |
| `set_goal` | `title`, `content`, `parentGoalId?`, `project?` | Create a goal node (sub-goals via `part_of`). |
| `hypothesize` | `title`, `content`, `initialConfidence?` (0–1), `predicts?`, `project?` | Record a hypothesis (a guess, not a fact). |
| `confirm_hypothesis` / `refute_hypothesis` | `nodeId`, `evidence` | Resolve a hypothesis with an evidence node + `validates`/`refutes` edge. |
| `ask_question` | `question`, `context?`, `project?` | Record an open question. |
| `answer_question` | `questionId`, `answeringNodeId` | Answer a question (`answered_by` edge). |
| `expire_edge` | `edgeId`, `reason?` | End a relationship's validity (temporal close) — NOT a delete; history is preserved. |
| `add_source` | `nodeId`, `type` (`url/commit/file/document`), `repository?`, `path?`, `ref?`, `url?`, `label?` | Attach a source reference (provenance) to a node. Metadata only — never file content. |
| `request_attachment_upload` | `nodeId`, `fileName`, `contentType`, `label?` | Get a single-use upload URL for attaching an actual file (PDF, transcript, image) to a node. |

## File Attachments — Never Through Tool Calls

To attach a file to a node, **never** read the file into context or base64-encode it into a tool call — tool arguments are model output, so a 1 MB file costs hundreds of thousands of tokens. Instead:

1. Call `request_attachment_upload(nodeId, fileName, contentType)` — it validates your access and returns a single-use upload URL (expires in 15 minutes).
2. Run the returned curl command from your shell: `curl -sS --fail-with-body -T "<path-to-file>" "<url>"`. The file streams directly to private storage and is registered as an attachment source on the node.
3. If the upload fails, request a new URL — each one is single-use.

## Node Types for `remember()`

`fact` · `gotcha` · `preference` · `state` · `entity` · `plan`

Use `decide()` for decisions and `block()` for blockers — they have dedicated tools with extra logic (contradiction detection, urgency tracking).

### Dedicated tools — do NOT use `remember()` for these

Some knowledge has a dedicated tool with extra logic; `remember("fact", ...)` is the wrong choice for it:

| Instead of `remember("fact", ...)` for… | Use | Example |
|------|-----|---------|
| A time-stamped event | `record_episode` | "Production deploy at 14:32 UTC" → `record_episode` |
| Meeting notes | `record_episode` with `occurredAt` = meeting start | "Meeting — Niklas/Daniel sync" written the day after → `record_episode(..., occurredAt: "2026-09-14T13:00:00+02:00")`, never `remember("fact")` |
| A realized result of a decision/plan | `record_outcome` | "Migration caused a 3× latency increase" → `record_outcome(direction: negative)` |
| A goal / objective | `set_goal` | "Ship multi-region by Q3" → `set_goal` |
| A guess / unproven belief | `hypothesize` | "I think the bottleneck is the auth round-trip" → `hypothesize`, not a fact |
| An open question | `ask_question` | "Why does the nightly job retry 3×?" → `ask_question` |

## Automatic Intelligence

These features run automatically — you do not trigger them:

- **Deduplication** — before creating any node, embedding similarity is checked. Near-duplicates (>0.84) are rejected with a message showing the existing node.
- **Contradiction detection** — when you use `decide()`, existing decisions are compared. Conflicts (similarity 0.78–0.84) create a `contradiction` node automatically.
- **Auto-linking** — new nodes are linked to semantically related existing nodes.
- **Confidence decay** — old, unreferenced nodes gradually lose confidence over time.

## Edges Have Time

Edges carry temporal validity (`valid_from` / `valid_until`). **Default queries return only currently-active edges** — so what you read is the graph's *current* state, not its whole history.

- When a relationship ends (a contributor leaves, a dependency is dropped, a convention is replaced), call `expire_edge(edgeId)` — **do NOT delete it**. Expiring preserves history; deleting destroys it.
- To see historical state, pass `asOf: <ISO-8601>` (the graph as it was at that moment) or `includeExpired: true` to the read tools that support them.
- Superseded nodes' stale `led_to`/`caused` edges are expired automatically by the server; you rarely expire those by hand.

## Rules

- **ALWAYS** run `briefing(sinceLastSession: true)` at the start of every session before doing any work.
- **ALWAYS** use `decide()` for decisions — never `remember("decision", ...)`. The `decide` tool has contradiction detection.
- **ALWAYS** include `rationale` and `alternatives` when using `decide()`.
- **ALWAYS** save gotchas immediately with `remember("gotcha", title, content)`.
- **ALWAYS** title a node with its conclusion, never its topic — the title is the retrieval interface.
- **ALWAYS** document blockers immediately with `block()` — include `urgency`.
- **ALWAYS** search the graph with `context()` before asking the user any question about the project. The graph owns context; assume it knows before assuming it doesn't.
- **NEVER** write secrets or personal data into the graph — no credentials, tokens, API keys, connection strings, or PII. The graph is a shared, hosted service: everything written to it is persisted, embedded and searchable by every future session. When a blocker was cleared by a credential, record that it was supplied and where it is stored (a secret-manager reference), never the value.
- **ALWAYS** communicate with the graph in English — both writes (`remember`, `decide`, `block`, `resolve`) and reads (`context`, `why`). Keep verbatim fragments (names, identifiers, quotes) in original form.
- **NEVER** make decisions that contradict existing ones without recording a new `decide()` with `supersedes` pointing to the old decision's nodeId.
- **NEVER** base64-encode a file through a tool call. Attach files with `request_attachment_upload` + the returned curl command (see File Attachments above).
- **PREFER** `context(query)` over re-discovering knowledge that may already exist in the graph.
