---
name: security-review
description: Run comprehensive security review for vulnerabilities and compliance
argument-hint: [file or directory]
---

# Security Review Command

This command performs a comprehensive security review on your code for vulnerabilities, compliance violations, and security best practices.

## How to run it — delegate, do not do it inline

**Spawn the `security-reviewer` agent.** The sections below describe what that agent covers; they are
the brief you hand it, not a checklist for the main session.

Two reasons this matters. The agent works in its own context, so auditing the change for vulnerabilities costs you almost none
of your own. And it carries its own model in frontmatter (`agents/security-reviewer.md`), chosen for
this job — doing the work inline silently runs it on whatever model your session is on.

## Usage

```bash
/security-review                          # Review all recent changes
/security-review src/path/to/file         # Review specific file
/security-review src/module               # Review specific directory
/security-review <config file>            # Check configuration security
```

## What This Command Does

1. **Spawns Security Reviewer Agent**: Launches specialized security analysis
2. **Secrets Detection**: Scans for hardcoded API keys, passwords, connection strings
3. **Injection Prevention**: Checks for parameterized queries and unsafe SQL/command construction
4. **XSS Prevention**: Verifies output encoding/sanitization
5. **Authentication/Authorization**: Validates protection on sensitive endpoints
6. **Input Validation**: Ensures all user inputs are validated
7. **Dependency Scanning**: Checks for vulnerable packages
8. **Error Handling**: Verifies no sensitive data leaks in errors
9. **Transport/CORS**: Validates HTTPS and CORS configuration
10. **Compliance Checks**: Verifies GDPR/HIPAA readiness if applicable

## Security Review Categories

Apply these idiomatically for your stack (see `rules/<stack>.md` and existing conventions).

### CRITICAL (Halt Development)

Fix immediately before any commit:

- **Hardcoded secrets** — API keys, passwords, or connection strings committed in code or config.
- **Injection vulnerabilities** — SQL/command/query built via string concatenation or interpolation of user input.
- **Exposed internal IDs** — endpoints leaking internal/database IDs where a public identifier is expected.
- **Missing authentication/authorization** — sensitive endpoints (delete, admin, data access) with no access control.
- **XSS** — rendering unsanitized user input as HTML/markup.

### HIGH (Should Fix)

Fix before merging:

- **Missing input validation** — user input accepted without validation at the boundary.
- **Sensitive data in errors** — stack traces or internal details returned to clients.
- **No rate limiting** — public/auth endpoints vulnerable to brute force or abuse.
- **Vulnerable dependencies** — known CVEs or unpatched packages.

### MEDIUM (Consider Improving)

- Overly permissive CORS configuration
- Missing transport security headers (e.g. HSTS)
- Error messages that could aid attackers

## Security Standards

All code must comply with these mandatory standards:

- **Secret management** — source secrets from a secrets manager or environment variables; never hardcode. Rotate any exposed secret immediately.
- **Injection prevention** — use parameterized queries / your ORM's safe query APIs; never build queries from raw user input.
- **XSS prevention** — rely on your framework's default output encoding; sanitize explicitly (allow-list) only when raw markup is unavoidable.
- **Authentication & authorization** — protect sensitive endpoints with the project's auth mechanism and enforce role/permission checks.
- **Input validation** — validate all user input at the boundary (length, format, type, range).

## When to Use This Command

- Before committing code
- After implementing security-related features
- During security-focused refactoring
- After dependency updates
- Whenever handling sensitive data
- When adding new endpoints
- Before each PR
- During incident response

## Security Review Checklist

Before committing:

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] Injection prevention (parameterized queries)
- [ ] XSS prevention (proper output encoding/sanitization)
- [ ] CSRF protection enabled
- [ ] Authentication on protected endpoints
- [ ] Authorization on sensitive operations
- [ ] Rate limiting on public endpoints
- [ ] Error messages don't leak sensitive data
- [ ] Dependencies scanned for vulnerabilities
- [ ] Secrets in a secrets manager or environment variables
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Logging doesn't include sensitive data

## Response to Security Issues

If critical security issues are found:

1. **STOP** — do not commit or deploy
2. **Fix** — address all CRITICAL issues
3. **Review** — look for similar issues elsewhere in the codebase
4. **Verify** — re-run the security review
5. **Notify** — inform the security owner if needed
6. **Document** — update security procedures if the pattern repeats

## Related Commands

- Use `/code-review` for general code quality
- Use `/tdd` to write security-focused tests
- See `rules/security.md` for full security guidelines
- See `agents/code-reviewer.md` for detailed review criteria

**Remember**: Better to be paranoid than breached. When in doubt, ask the security owner.
