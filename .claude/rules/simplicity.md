# Simplicity

Less code is better code. Simple code is better code. Functionality is what we ship;
everything else has to earn its place.

- **Build what the acceptance criteria require and nothing more.** No abstraction for a
  single caller, no configuration for a single value, no handling of cases that cannot
  occur, no defensive code against callers we control.
- **Prefer deleting to adding.** When a change can be made by removing code, do that. When
  an existing function almost fits, change it rather than adding a parallel one.
- **The obviously high-risk things are still handled** — a secret in code, an injection
  path, a missing authorization check, a cross-tenant read. Those are bugs, not hardening.
- **Everything else is hardening, and hardening is a decision, not a reflex.** It is done
  deliberately with `/harden`, scoped and prioritized, with the user choosing what to
  invest in.
- **Reviewers**: flag additions the criteria did not ask for as *scope creep*, exactly as
  you would flag a missing test. Report bugs, broken criteria and secrets; list anything
  else in one line for `/harden`. Do not propose patterns, layers or safeguards for
  problems the code does not have.
- **Reviews are bounded.** One round, then one confirmation that the fixes landed. What is
  still open after that is a work item, not another round.
