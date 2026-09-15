# Testing Requirements

Every change ships with the tests that prove it. Code without tests is not done. There is no
coverage percentage to hit — a test earns its place by catching a real regression, not by
lifting a number.

Framework-specific setup, runners, assertion libraries and tooling live in the stack overlay
you selected at download — see `rules/<stack>.md`.

## Test where it carries its weight

- **Integration tests are the default.** Test the change across a real boundary — the endpoint
  with a real request, the query against a real (local or disposable) database, the handler
  with a real message. One integration test that drives the feature the way it is used beats
  a dozen unit tests of its parts.
- **End-to-end tests for the critical user flows.** Sign-in, the main create/read/update paths,
  payment, anything whose failure a user notices first. Not for every screen.
- **Unit tests only where the logic is intricate** — parsers, calculations, state machines,
  date and money arithmetic. Not for plumbing, mappers or code that only forwards calls.
- **A bug gets a reproducing test** at the level where it was observed, and the test stays as
  the regression guard.

## Tests and code go together

Write the test and the code in whichever order gets you to working software fastest — the
order is not the point. What matters:

- **The test exercises the behavior an acceptance criterion describes**, not the
  implementation. If the internals could be rewritten and the test would still pass for the
  same behavior, it is a good test.
- **The test fails when the behavior is broken.** Prove it once — revert or comment out the
  change and watch it go red. A test that passes against the old code tests nothing.
- **Run the whole suite** after every task, not only the new test.

## Writing them

- **Arrange → Act → Assert**, one behavior per test, no shared mutable state, no ordering
  dependencies.
- **Test doubles only for what you do not control** — third-party services, clocks, the
  network. Your own database and your own services are part of the boundary you are testing;
  mock them and the integration test proves nothing.
- **Cover the error path** the criterion implies — the invalid input, the missing record, the
  dependency that fails — not every theoretically possible edge.
- **Names say what broke**: `GetById returns null when not found`, not `Test1`.

**Remember**: tests are part of the change, not a phase after it. Test the boundary the user
touches; leave the percentage alone.
