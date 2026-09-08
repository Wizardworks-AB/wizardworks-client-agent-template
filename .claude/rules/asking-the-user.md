# Asking the User

Applies to **everything** this agent does — every command, every skill, every ad-hoc
request. No exceptions.

## Never bury a question in prose

A question written into a paragraph is easy to miss, easy to answer partially, and
impossible to answer with one keystroke. If you need something from the user, **ask it as
a choice with concrete options**.

**Wrong** — three questions hidden in a report:

> The branch is ready but not pushed. I'd suggest opening a PR rather than merging
> directly, though let me know if you'd prefer otherwise. There's also the stale local
> copy to think about, and the follow-up work item probably needs drafting.

**Right** — the same three, asked so they can be answered:

> **How should this land?**
> 1. Open a draft PR against main *(Recommended)* — nothing merges until you review it
> 2. Merge and push directly — publishes to the dev catalog immediately
> 3. Leave the branch alone — I'll stop here
> 4. Chat about this

## The rules

1. **Every question gets a list of answer options.** Two to four, mutually exclusive,
   each a real thing you will do.
2. **One option is always `Chat about this`** — the escape hatch for "none of these fit",
   "I need to think", or "let's talk it through first". It goes last. Never omit it: the
   user must never be forced to pick a wrong option to say "hang on".
3. **Label each option with what happens if it is chosen**, not just its name. The user
   should not have to ask what an option means.
4. **Recommend one.** Put it first and mark it `(Recommended)`. You have the context; say
   what you would do. A list with no recommendation pushes your judgement onto the user.
5. **Batch your questions.** Ask everything you need in one pass rather than drip-feeding
   — see the human-blocker queue in `commands/feature.md` §B, which exists for this.
6. **Say what is irreversible.** If an option publishes, deploys, merges, pushes, deletes,
   costs money, or is otherwise hard to undo, put that in the option's description.

## How to ask

**In Claude Code**, use the `AskUserQuestion` tool — it renders the options as a picker.
It allows at most four options, so with `Chat about this` reserved you have three
substantive ones; if you have more than three, you are asking more than one question, so
split it. The tool also supplies its own free-text escape, but include the explicit
`Chat about this` option regardless — it tells the user that discussion is a first-class
answer rather than a fallback.

**On runtimes without that tool** (Codex, generic), write a numbered list in your reply,
ending with the same `Chat about this` option, and stop for the answer.

## When not to ask

This rule governs *how* to ask, not *whether* to. Do not manufacture questions for things
you can settle yourself — a convention the codebase already shows, a fact the knowledge
graph holds (search it first, per `rules/fae.md`), a routine judgement call a colleague
would just make. Ask when the answer genuinely changes what you build, and when getting it
wrong would waste real work.

And do not stall on the answer: in a multi-task flow, park the question and keep going on
everything that does not depend on it (`rules/workflow.md`, "Never stall on a human").
