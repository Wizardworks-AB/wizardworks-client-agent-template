# Writing for a Person

Applies to everything a person reads from this agent: an answer in the conversation, a PR
description, a work item draft, a plan, a findings list, a status report. Their attention is
the scarce resource, not your output. `rules/asking-the-user.md` covers the questions; this
covers the rest of the message.

1. **The first sentence is the answer.** What was found, what was built, what you recommend.
   A reader who stops there has the conclusion.
2. **A title or a heading asserts something.** "The list endpoint runs one query per row",
   not "Performance". Read the headings alone: they should tell the story.
3. **Findings, not footsteps.** Delete every sentence whose job is to say where you were in
   the investigation ("I first checked…, then…"). The order of the work is not the order of
   the text.
4. **What the reader must act on comes before what they would only verify.** Decisions,
   blockers and anything irreversible first; evidence and detail after.
5. **Questions stand in one block, never inside the report.** Ask them as a choice with
   options; the report follows for whoever wants it. On Claude Code the ask gate enforces
   this (`rules/hooks.md`).

Where the template already fixes a shape, keep to it rather than inventing one: a review
finding (`agents/code-reviewer.md`), an implementer report (`agents/implementer.md`), a work
item draft (`commands/feature.md`, step 4), a plan (`agents/planner.md`), a document or a
deck (`skills/document`, `skills/deck`).

Not for reference material — runbooks, API docs, step-by-step guides — or for a deliberate
timeline such as an incident report, a meeting transcript or a changelog. There, sequence is
the content. Knowledge-graph nodes keep every detail (`rules/fae.md`); brevity here is for
people.
