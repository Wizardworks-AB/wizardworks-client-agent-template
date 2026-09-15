---
name: e2e
description: Run end-to-end tests for critical user flows
argument-hint: [test name or feature]
---

# E2E Testing Command

This command manages end-to-end testing. E2E tests validate complete user journeys across your full application stack. Use whatever E2E framework this project has adopted (see the stack overlay `rules/<stack>.md` and existing test conventions) — Playwright, Cypress, Selenium, or an API-driven harness for non-UI systems.

## How to run it — delegate, do not do it inline

**Spawn the `e2e-runner` agent.** The sections below describe what that agent covers; they are
the brief you hand it, not a checklist for the main session.

Two reasons this matters. The agent works in its own context, so driving the flows and reading the output costs you almost none
of your own. And it carries its own model in frontmatter (`agents/e2e-runner.md`), chosen for
this job — doing the work inline silently runs it on whatever model your session is on.

## Usage

```bash
/e2e                                      # Run all E2E tests
/e2e <feature-name>                       # Run a specific test
/e2e --headed                             # Run with browser visible (UI frameworks)
/e2e --debug                              # Run in debug mode
/e2e --update-snapshots                   # Update visual regression snapshots
```

## What This Command Does

1. **Runs the E2E suite**: Drives the app the way a real user would
2. **Navigates the application**: Simulates real user interactions (or real API sequences)
3. **Validates Results**: Checks UI state and/or data
4. **Captures Evidence**: Screenshots, traces, and logs on failure
5. **Generates Reports**: Produces a readable test report
6. **Visual Regression**: Detects unintended UI changes (where applicable)

## Writing E2E Tests

Follow the existing E2E conventions in the codebase. Regardless of framework, good E2E tests share these traits:

### 1. Use Stable Selectors

Prefer semantic or test-id selectors over brittle CSS/XPath. Add test identifiers to components where needed so tests don't break on styling changes.

### 2. Wait for Conditions, Not Fixed Delays

Wait for an element/state/response to appear rather than sleeping for a fixed duration — fixed waits are the main source of flakiness.

### 3. Handle Async Operations

Wait for the network/app to settle after an action, and assert on the resulting state before proceeding.

### 4. Manage Authentication

Set up an authenticated session (seeded token, storage state, or a login step in setup) so protected flows can be exercised.

### 5. Control Test Data

Seed or mock backing data/APIs so tests are deterministic and isolated.

## Critical User Flows to Test

Every application should cover these flows:

- **Authentication**: login and logout
- **Create / Read / Update / Delete**: the core CRUD journeys
- **Error handling**: validation errors, server errors, network failures
- **Search / filter / pagination**: where applicable
- **Accessibility basics**: keyboard navigation and focus handling

## Configuration

Keep E2E configuration in the project's chosen config file. Typical settings:

- Base URL for the app under test
- Retries in CI, parallel workers
- Trace/screenshot/video capture on failure
- A web-server step that starts the app before the run
- Target browsers/environments

## Running E2E Tests

Use the project's scripts (defined in the build tool / package manifest). Common variants:

- Run the full suite
- Run a single test by name/pattern
- Headed / debug mode (UI frameworks)
- Update snapshots

In CI, run the suite and upload the report/artifacts on completion.

## E2E Test Checklist

Essential coverage:

- [ ] User can authenticate
- [ ] User can navigate main features
- [ ] Create works end-to-end
- [ ] Read/display works correctly
- [ ] Update works end-to-end
- [ ] Delete works end-to-end
- [ ] Error messages display correctly
- [ ] Form validation works
- [ ] Search/filter works
- [ ] Pagination works (if applicable)
- [ ] API errors handled gracefully
- [ ] Network timeouts handled gracefully
- [ ] Responsiveness works (if applicable)
- [ ] Accessibility basics verified

## When to Use This Command

- After major feature implementation
- Before release
- After critical bug fixes
- During regression testing
- Before deploying to production
- When testing cross-browser compatibility

## Related Commands

- Use `/code-review` before committing
- Use `/security-review` for auth/security flows
- See `rules/testing.md` for full testing requirements

**Remember**: E2E tests are your safety net before production. Run them thoroughly.
