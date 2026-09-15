# Coding Style Standards

**MANDATORY**: All contributors and AI agents must follow these coding standards rigorously.

These are the universal, language-agnostic principles for this project. Language-specific naming conventions, size limits, and code examples live in the stack overlay you selected at download — see `rules/<stack>.md`.

## Universal Principles

### 1. Readability First
- Code is read more than written
- Clear, descriptive variable and function names
- Self-documenting code preferred over comments
- Consistent formatting throughout the codebase

### 2. KISS (Keep It Simple, Stupid)
- Simplest solution that works
- Avoid over-engineering
- No premature optimization
- Easy to understand > clever code

### 3. DRY (Don't Repeat Yourself)
- Extract common logic into functions/methods
- Create reusable components
- Share utilities across modules
- Avoid copy-paste programming

### 4. YAGNI (You Aren't Gonna Need It)
- Don't build features before they're needed
- Add complexity only when required
- Start simple, refactor when needed

## Naming

- Use names that reveal intent — a reader should understand *what* and *why* without decoding.
- Be consistent with the conventions your language and this project already use. The stack overlay documents the concrete casing rules (e.g. PascalCase vs camelCase, prefixes, suffixes) — follow them exactly.
- Avoid vague names (`x`, `temp`, `data`, `flag`), abbreviations, and single letters outside tight loops.
- Async operations, collections, booleans, and constants should read naturally at the call site.

## File & Code Organization

- **One primary unit per file** (one class/module/component), file name matching the unit.
- **Organize by feature, not by type** — group everything for a feature together rather than splitting into top-level `controllers/`, `services/`, `models/` folders.
- Keep related code close; keep unrelated code apart.

## Function & Method Discipline

- **Small, focused functions** — one responsibility each. If it needs "and" to describe it, split it.
- **Use early returns** to reduce nesting. Guard clauses over deeply nested conditionals.
- **Limit nesting** to about 4 levels — beyond that, extract a function.
- Prefer pure functions and clear inputs/outputs over hidden side effects.

Concrete line/size limits per language live in the stack overlay. As general guidance: functions stay short (dozens, not hundreds, of lines) and files stay focused (split when they grow large).

## Immutability (as a principle)

- Prefer immutable data. Produce new values rather than mutating shared state in place.
- Avoid mutating inputs, shared collections, or object arguments — copy/derive instead.
- This makes reasoning, concurrency, and change-tracking safer. See the stack overlay for the idiomatic patterns in your language.

## Asynchrony & Concurrency

- Use your language's async idioms consistently; don't block on async work.
- Don't fire-and-forget in ways that swallow errors.
- Handle concurrent access explicitly where shared state exists.

The overlay documents the concrete async patterns and pitfalls for your stack.

## Error Handling

- **Handle errors deliberately.** Never silently swallow them.
- Catch what you can act on; let unexpected failures propagate rather than hiding them.
- Log with enough context to diagnose, then rethrow or translate into a meaningful error.
- Don't catch broadly just to log and continue — that hides bugs.
- Never leak sensitive detail (stack traces, connection strings, secrets) to callers or users.

## Comments & Documentation

- **Explain WHY, not WHAT.** The code already says what it does; comments capture intent, trade-offs, and non-obvious reasons.
- Don't state the obvious or narrate each line.
- Document public APIs (their contract, parameters, return values, and failure modes) using your language's standard doc-comment format — see the stack overlay.
- Remove commented-out code; version control remembers it.

## Code Smells to Avoid

| Smell | Fix |
|-------|-----|
| Long functions | Extract smaller, focused functions |
| Deep nesting | Early returns, extract methods |
| Magic numbers | Named constants with meaning |
| Duplicated code | Extract to a shared function/module |
| Unclear names | Rename to reveal intent |
| Broad exception swallowing | Handle specifically or let it propagate |

## Code Quality Checklist

Before marking work complete:

- [ ] Code is readable and well-named
- [ ] Naming follows the project/stack conventions
- [ ] Functions are small and single-purpose
- [ ] Nesting is shallow (early returns used)
- [ ] No duplicated code
- [ ] Immutability preferred; no unintended mutation of shared state
- [ ] Async patterns used correctly (no blocking, no swallowed errors)
- [ ] Proper error handling with meaningful context
- [ ] No hardcoded values (use configuration)
- [ ] No debug/print statements left in (use proper logging)
- [ ] No commented-out code
- [ ] Files and functions within the size limits in the stack overlay
- [ ] Public APIs documented
- [ ] Tests written at the right level (see `rules/testing.md`)

**Remember**: Code quality is non-negotiable. Clean, maintainable code enables rapid development and confident refactoring.
