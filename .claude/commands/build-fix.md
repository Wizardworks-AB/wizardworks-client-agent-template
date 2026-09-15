---
name: build-fix
description: Fix build errors and deployment issues
argument-hint: [error message or type]
---

# Build Fix Command

This command helps diagnose and fix build errors, deployment failures, and infrastructure issues in this project.

## How to run it — delegate, do not do it inline

**Spawn the `build-error-resolver` agent.** The sections below describe what that agent covers; they are
the brief you hand it, not a checklist for the main session.

Two reasons this matters. The agent works in its own context, so reading the build output and hunting the cause costs you almost none
of your own. And it carries its own model in frontmatter (`agents/build-error-resolver.md`), chosen for
this job — doing the work inline silently runs it on whatever model your session is on.

## Usage

```bash
/build-fix                                    # Analyze and fix current build errors
/build-fix dependency restore failed          # Fix package/dependency restoration issue
/build-fix docker build failed                # Fix Docker build problem
/build-fix deployment failed                  # Fix infrastructure deployment
/build-fix migration pending                  # Fix database migration
```

## What This Command Does

1. **Spawns Build Agent**: Launches the build specialist
2. **Error Analysis**: Identifies root cause of build failures
3. **Solution Generation**: Suggests fixes with examples
4. **Verification**: Helps validate the fix works
5. **Prevention**: Recommends process improvements
6. **CI/CD Debugging**: Troubleshoots pipeline failures

## Diagnostic Approach

Follow the stack overlay (`rules/<stack>.md`) and existing codebase conventions to run the right commands for your stack. The general loop is the same regardless of language:

1. **Reproduce** — run your stack's build/restore locally to see the full error (not just the CI summary).
2. **Read the first error** — later errors are often cascades of the first; fix the earliest one first.
3. **Isolate** — clean caches / reinstall dependencies / rebuild from scratch to rule out stale artifacts.
4. **Fix and re-run** — apply the minimal change, then re-run build + tests to confirm.

## Common Error Categories

### Dependency / Package Restore Failures

Symptoms: unresolved packages, version conflicts, registry timeouts.

**Fix approach**:
- Clear the package cache and reinstall from a clean state.
- Verify the correct registry/feed is configured.
- Pin or update the offending package version.
- Commit the lock file so builds are reproducible.

### Compilation / Type Errors

Symptoms: unresolved types, missing modules, path/import errors.

**Fix approach**:
- Check imports and module path aliases against the project's config.
- Verify the referenced symbol/module actually exists and is exported.
- Confirm project references and build order.
- Run a full clean build to surface the complete error list.

### Docker Build Errors

Symptoms: base image not found, file not found in build context, cache issues.

**Fix approach**:
- Verify the base image name/tag exists and is reachable.
- Ensure required files are copied and not excluded by `.dockerignore`.
- Use multi-stage builds to keep images small and reproducible.
- Rebuild with `--no-cache` when stale layers are suspected.

### Database Migration Issues

Symptoms: pending migrations, ordering conflicts, connection errors.

**Fix approach**:
- List migration status with your ORM/migration tool.
- Apply pending migrations, or remove and regenerate a problematic one.
- Verify the connection string is sourced from secure config (secrets manager / environment variables), never hardcoded.

### Deployment / Infrastructure Errors

Symptoms: auth failures, template validation errors, registry push failures.

**Fix approach**:
- Re-authenticate to your cloud provider and confirm the active subscription/project.
- Validate infrastructure-as-code templates before applying.
- Authenticate to your container registry, then tag and push with an explicit, immutable tag (never `latest` for deploys).

## Build Process Checklist

Ensure these pass before deployment (adapt commands to your stack):

- [ ] Build succeeds without warnings
- [ ] All tests pass
- [ ] Docker image builds and starts successfully
- [ ] No secrets exposed in the image
- [ ] Infrastructure-as-code templates validate
- [ ] Linting/type checks pass
- [ ] No dependency vulnerabilities

## Preventing Build Failures

- **Lock dependencies** — commit lock files for reproducible builds.
- **Pin toolchain versions** — pin the language/SDK version used by CI.
- **Cache dependencies in CI** — speeds builds and reduces flaky network failures.
- **Use `.dockerignore`** — keep build contexts small and free of secrets.
- **Add retries** — for network-dependent steps (restore, registry push).

## When to Use This Command

- Build fails locally
- CI/CD pipeline fails
- Docker build errors
- Deployment failures
- Database migration issues
- Container registry problems
- Infrastructure deployment errors

## Related Commands

- Use `/code-review` to prevent issues
- Use `/security-review` to catch vulnerabilities
- See `rules/testing.md` for test requirements
- See `agents/code-reviewer.md` for review criteria

**Remember**: A broken build blocks the team. Fix it immediately.
