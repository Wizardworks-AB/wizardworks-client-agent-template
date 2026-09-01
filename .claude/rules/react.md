# React / TypeScript Stack Standards

Stack-specific conventions for React/TypeScript front-ends. Loaded when the
**react** stack overlay is selected at download. These extend the
language-agnostic `rules/coding-style.md`, `rules/testing.md`, and
`rules/security.md`. Deeper patterns and worked examples live in the
`frontend-patterns-react` skill.

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| Variables, functions | camelCase | `getOrderById` |
| Components, types, interfaces | PascalCase | `OrderList`, `OrderDto` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Hooks | `use` + PascalCase | `useOrder`, `useDebounce` |

- Components ≤ 200 lines; files ≤ 400 lines. Extract hooks, types, and
  utilities into their own files.

## TypeScript

- `strict` mode on. No `any` — model real types; use `unknown` + narrowing at
  boundaries.
- Handle `null`/`undefined` explicitly before use.

## Immutability (critical)

- Never mutate state or props. Use spreads / immutable updates:
  ```ts
  const updated = { ...order, status: "shipped" };
  const list = [...orders, newOrder];
  ```
- No `push`/`splice`/direct assignment on state.

## Data fetching — TanStack Query

- Use TanStack Query for server state (caching, loading/error, invalidation) —
  not bare `fetch`/`useEffect` in components.
- TanStack Form for forms, TanStack Table for data grids.
- Wrap queries in typed custom hooks (`useOrder(publicId)`).

## Component composition

- Build UIs from small, focused components; avoid one monolithic component.
- Type every component's props; prefer function components.

## Testing

- Vitest + React Testing Library; Playwright for E2E critical flows.
- Test behavior via the DOM (roles/labels), not implementation details.
- Clear mocks between tests to avoid leakage.

## Hygiene

- No stray `console.log` in committed code — use a logging utility.
- Escape by default (React does this); only `dangerouslySetInnerHTML` with
  sanitized input.
