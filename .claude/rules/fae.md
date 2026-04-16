# Fae — Persistent Knowledge Graph (MCP)

This agent is connected to the Fae knowledge graph via Remindr MCP. The knowledge graph is a shared, persistent memory across all agents and sessions working on this project.

## Configuration

The MCP server is configured in `.mcp.json` with `X-Tenant-Id` and `X-Default-Project` headers. This means you **do not need to pass `project`** on every tool call — it resolves automatically from the header. Only pass `project` if you need to work with a different project than the default.

## Session Start

Run `briefing(sinceLastSession: true)` at the start of every session to orient yourself — recent decisions, new blockers, what changed since your last session. If the user mentions a specific project, run `status(project)` for deeper detail.

## Auto-Save Triggers — You MUST Save to Fae When Any of These Happen

1. **After every git commit** → `remember("fact", "commit summary", "branch, files changed, what was done and why")`
2. **After making a decision** → `decide(decision, rationale)` — do NOT wait to be asked
3. **After creating a plan** → `remember("plan", title, full plan content)`
4. **After hitting a surprise/gotcha** → `remember("gotcha", title, content)`
5. **After resolving a blocker** → `resolve(nodeId, resolution)`
6. **After completing a significant task** → `remember("fact", "task summary", details)`

This is not optional. If you committed code or made a decision without saving to Fae, you have a bug in your workflow. The next agent session will have no idea what happened.

## During Work — Write Proactively

- Made a decision? → `decide(decision, rationale)`
- Discovered a fact or pattern? → `remember("fact", title, content)`
- Hit a surprise or gotcha? → `remember("gotcha", title, content)`
- Something is blocking progress? → `block(description)`
- Blocker resolved? → `resolve(nodeId, resolution)`

## Relationships Between Nodes

You do **not** need to create relationships manually. They are created automatically:

- **`relatedTo` parameter** — `remember()`, `decide()`, and `block()` accept an optional `relatedTo: string[]` with node IDs. Use this when you know which existing node your new knowledge relates to.
- **AutoLinker** — semantic matching runs automatically on every create and links to related existing nodes.

## Graph-First Rule

Every time you create substantive content (plans, specs, analysis), store the **full content** in a graph node via `remember()`. A file reference like "see plan in X.md" is not memory — it is a broken link waiting to happen.

## Read Tools

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `briefing` | `project?`, `recentHours?` (default 24), `sinceLastSession?` (default false), `timezone?` | Project summary — open blockers, recent decisions, stale items |
| `context` | `query`, `project?` | Semantic search in the knowledge graph |
| `status` | `project?` | Current project state — active decisions, open blockers, recent changes |
| `get` | `nodeId` | Full untruncated node content (use when context() truncates) |
| `list` | `type?`, `status?`, `project?` | List nodes with filters |
| `why` | `query`, `project?` | Trace decision chains — follows led_to, supersedes, contradicts edges |
| `blockers` | `project?` | List all active blockers |

## Write Tools

| Tool | Parameters | Purpose |
|------|-----------|---------|
| `remember` | `type`, `title`, `content`, `project?`, `relatedTo?` (nodeId[]) | Store knowledge. Types: `fact, gotcha, preference, state, entity, plan`. Do NOT use for decisions or blockers — they have dedicated tools. |
| `decide` | `decision`, `rationale`, `project?`, `alternatives?` (string[]), `supersedes?` (nodeId), `relatedTo?` (nodeId[]) | Record a decision with rationale. Auto-detects contradictions. Use `supersedes` when replacing a previous decision. |
| `block` | `description`, `project?`, `urgency?` (`low/medium/high/critical`), `relatedTo?` (nodeId[]) | Register a blocker with urgency level. |
| `resolve` | `nodeId`, `resolution` | Resolve a blocker. Automatically creates a linked fact node with the resolution. |
| `forget` | `nodeId`, `reason?` | Mark knowledge as stale. Also marks linked contradictions as stale. |

## Node Types for `remember()`

`fact` · `gotcha` · `preference` · `state` · `entity` · `plan`

Use `decide()` for decisions and `block()` for blockers — they have dedicated tools with extra logic (contradiction detection, urgency tracking).

## Automatic Intelligence

These features run automatically — you do not trigger them:

- **Deduplication** — before creating any node, embedding similarity is checked. Near-duplicates (>0.84) are rejected with a message showing the existing node.
- **Contradiction detection** — when you use `decide()`, existing decisions are compared. Conflicts (similarity 0.78–0.84) create a `contradiction` node automatically.
- **Auto-linking** — new nodes are linked to semantically related existing nodes.
- **Confidence decay** — old, unreferenced nodes gradually lose confidence over time.

## Rules

- **ALWAYS** run `briefing(sinceLastSession: true)` at the start of every session before doing any work.
- **ALWAYS** use `decide()` for decisions — never `remember("decision", ...)`. The `decide` tool has contradiction detection.
- **ALWAYS** include `rationale` and `alternatives` when using `decide()`.
- **ALWAYS** save gotchas immediately with `remember("gotcha", title, content)`.
- **ALWAYS** document blockers immediately with `block()` — include `urgency`.
- **NEVER** make decisions that contradict existing ones without recording a new `decide()` with `supersedes` pointing to the old decision's nodeId.
- **PREFER** `context(query)` over re-discovering knowledge that may already exist in the graph.
