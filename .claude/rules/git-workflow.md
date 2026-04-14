# Wizardworks Git Workflow

**MANDATORY**: All Wizardworks developers and AI agents must follow this Git workflow.

## Commit Message Format

```
<type>: <description>

<optional body>

<optional footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **refactor**: Code refactoring (no functional changes)
- **docs**: Documentation changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, config)
- **perf**: Performance improvements
- **ci**: CI/CD pipeline changes
- **build**: Build system changes

### Examples

```bash
# ✅ GOOD: Clear, descriptive commits
feat: add public ID generation to Magic service

fix: resolve null reference exception in GetByPublicIdAsync

refactor: extract DTO mapping to separate class

test: add unit tests for MagicService CreateAsync method

docs: update API documentation for Magic endpoints

# ❌ BAD: Vague commits
fix: bug
update: changes
wip: stuff
```

### Detailed Commit Example

```
feat: implement semantic search for magic items

Add TanStack Query hooks for magic search with debouncing.
Integrate with OpenAI embeddings API for semantic similarity.
Include fallback to substring search when vector search unavailable.

- Add useMagicSearch hook with 500ms debounce
- Create searchMagic API endpoint
- Add error handling and loading states
- Write unit tests for search functionality

Closes #123
```

## Branch Naming Convention

```bash
# Format: <type>/<short-description>

# ✅ GOOD examples
feature/add-magic-search
fix/null-reference-magic-service
refactor/extract-dto-mapping
test/magic-controller-integration
docs/update-api-documentation

# ❌ BAD examples
my-branch
update
fix-stuff
temp-branch
```

## Branching Strategy

### Main Branches

- **main**: Production-ready code
- **develop**: Integration branch for features (if using GitFlow)

### Feature Branches

```bash
# Create feature branch from develop (or main)
git checkout -b feature/add-magic-search develop

# Work on feature
git add .
git commit -m "feat: add search endpoint"

# Push feature branch
git push -u origin feature/add-magic-search

# Create pull request
# After approval, merge to develop
```

### Hotfix Branches

```bash
# Create hotfix branch from main
git checkout -b hotfix/fix-critical-bug main

# Fix the bug
git add .
git commit -m "fix: resolve critical null reference"

# Merge to both main and develop
git checkout main
git merge hotfix/fix-critical-bug
git checkout develop
git merge hotfix/fix-critical-bug
```

## Pull Request Workflow

When creating PRs:

1. **Analyze Full Commit History**
   ```bash
   # See all changes since branching
   git diff develop...HEAD
   git log develop..HEAD
   ```

2. **Draft Comprehensive PR Summary**
   ```markdown
   ## Summary
   - Add semantic search functionality for magic items
   - Integrate OpenAI embeddings API
   - Add TanStack Query hooks with debouncing

   ## Changes
   - New endpoint: `GET /api/magic/search?q={query}`
   - New hook: `useMagicSearch` with 500ms debounce
   - Updated MagicService with search method
   - Added unit and integration tests

   ## Test Plan
   - [ ] Unit tests pass (80%+ coverage)
   - [ ] Integration tests pass
   - [ ] Manual testing of search functionality
   - [ ] Tested with various search queries
   - [ ] Tested error scenarios (API unavailable, etc.)

   ## Breaking Changes
   None

   ## Dependencies
   - Added OpenAI SDK package

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```

3. **Include Test Plan with TODOs**
4. **Push with `-u` flag if new branch**
   ```bash
   git push -u origin feature/add-magic-search
   ```

## Pre-Commit Checklist

Before committing:

- [ ] Code compiles/builds successfully
- [ ] All tests pass
- [ ] New tests written (TDD)
- [ ] 80%+ test coverage maintained
- [ ] No console.log or debug statements
- [ ] No commented-out code
- [ ] No hardcoded secrets
- [ ] Code follows Wizardworks style guide
- [ ] Public IDs used (not database IDs)
- [ ] DTOs used for API boundaries
- [ ] Linter passes

### Run Pre-Commit Checks

**For .NET:**
```bash
# Build
dotnet build

# Run tests
dotnet test

# Format code
dotnet format

# Check for security issues
dotnet list package --vulnerable
```

**For TypeScript:**
```bash
# Build
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm type-check

# Format
pnpm format
```

## Feature Implementation Workflow

### 1. Plan First
- Use **architect** agent for design decisions
- Break down into smaller tasks
- Identify dependencies and risks

### 2. TDD Approach (Mandatory)
1. Use **tdd-guide** agent
2. Write test first (RED)
3. Run test - it should FAIL
4. Write minimal implementation (GREEN)
5. Run test - it should PASS
6. Refactor (IMPROVE)
7. Verify 80%+ coverage

### 3. Code Review
- Use **code-reviewer** agent immediately after writing code
- Address CRITICAL and HIGH issues
- Fix MEDIUM issues when possible

### 4. Commit & Push
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add magic search endpoint with tests"

# Push to remote
git push
```

### 5. Create Pull Request
```bash
# Using GitHub CLI
gh pr create --title "Add magic search functionality" \
             --body "$(cat <<EOF
## Summary
- Add semantic search for magic items
- Integrate OpenAI embeddings

## Test Plan
- [x] Unit tests (85% coverage)
- [x] Integration tests pass
- [x] Manual testing completed

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

# Or create manually in GitHub/Azure DevOps
```

## Git Best Practices

### Commit Frequency

```bash
# ✅ GOOD: Atomic commits
git commit -m "feat: add MagicService CreateAsync method"
git commit -m "test: add unit tests for CreateAsync"
git commit -m "docs: update Magic API documentation"

# ❌ BAD: One massive commit
git commit -m "add everything"
```

### Commit Size

- Keep commits focused and atomic
- One logical change per commit
- If commit message needs "and", probably should be 2 commits

### Rebase vs Merge

**For feature branches:**
```bash
# Keep feature branch up-to-date with rebase
git checkout feature/add-search
git fetch origin
git rebase origin/develop

# Resolve conflicts
# Continue rebase
git rebase --continue

# Force push (only on your feature branch)
git push --force-with-lease
```

**For merging to main/develop:**
```bash
# Use merge (preserves history)
git checkout develop
git merge --no-ff feature/add-search
git push
```

### Stashing Changes

```bash
# Stash uncommitted changes
git stash save "WIP: magic search implementation"

# List stashes
git stash list

# Apply stash
git stash apply stash@{0}

# Drop stash
git stash drop stash@{0}
```

## Working with Remote

### Sync with Remote

```bash
# Fetch changes
git fetch origin

# Pull changes (fetch + merge)
git pull origin develop

# Pull with rebase
git pull --rebase origin develop
```

### Clean Up Branches

```bash
# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature

# Prune deleted remote branches
git fetch --prune
```

## Handling Merge Conflicts

```bash
# During merge/rebase, conflicts occur
git status  # See conflicted files

# Resolve conflicts in files
# Look for conflict markers:
# <<<<<<< HEAD
# Current changes
# =======
# Incoming changes
# >>>>>>> feature-branch

# After resolving
git add resolved-file.cs

# Continue merge/rebase
git merge --continue
# or
git rebase --continue
```

## Git Hooks (Recommended)

### Pre-Commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Running pre-commit checks..."

# Run tests
dotnet test
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi

# Check for secrets
if git diff --cached | grep -E "sk-proj-|password|secret"; then
  echo "Possible secret detected. Commit aborted."
  exit 1
fi

echo "Pre-commit checks passed."
exit 0
```

### Pre-Push Hook

```bash
# .git/hooks/pre-push
#!/bin/bash

echo "Running pre-push checks..."

# Run build
dotnet build
if [ $? -ne 0 ]; then
  echo "Build failed. Push aborted."
  exit 1
fi

# Run tests
dotnet test
if [ $? -ne 0 ]; then
  echo "Tests failed. Push aborted."
  exit 1
fi

echo "Pre-push checks passed."
exit 0
```

## Git Configuration

### User Setup

```bash
# Set user name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@wizardworks.com"

# Set default branch name
git config --global init.defaultBranch main

# Enable credential caching
git config --global credential.helper cache
```

### Aliases

```bash
# Useful aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --graph --oneline --all"
```

## .gitignore Best Practices

### .NET

```gitignore
## Build results
bin/
obj/
[Dd]ebug/
[Rr]elease/

## User-specific files
*.user
*.userosscache
*.suo

## Test Coverage
coverage/
*.opencover.xml

## Secrets
appsettings.Development.json
appsettings.*.json
!appsettings.json
.env
.env.local
secrets.json
```

### TypeScript/React

```gitignore
## Dependencies
node_modules/
.pnp/
.pnp.js

## Build
dist/
build/
.next/
.vite/

## Testing
coverage/
.vitest/

## Environment
.env
.env.local
.env.*.local

## IDE
.vscode/
.idea/
*.swp
*.swo
```

## Task Persistence (Experimental)

> **Note:** This workflow is experimental and works best for large projects with many features running in parallel.

By default, Claude Code tasks are session-local and cleared when the context compacts or you run `/clear`. For long-running feature work, you can persist tasks across context clears using the `CLAUDE_CODE_TASK_LIST_ID` environment variable.

### Why Use Persistent Tasks?

When working on a complex feature:
1. Context window fills up
2. Claude compacts/summarizes to free space
3. Without persistence → task list lost, Claude loses track of progress
4. With persistence → task list survives, Claude knows what's pending

### Setup

**Option A: Manual (per feature)**
```bash
export CLAUDE_CODE_TASK_LIST_ID=feat-user-auth
claude
```

**Option B: Auto-detect from git branch**
```bash
# Add to your .bashrc or .zshrc
export CLAUDE_CODE_TASK_LIST_ID=$(git branch --show-current 2>/dev/null || echo "default")
```

**Option C: Per-developer (simpler)**
```bash
# Add to your .bashrc or .zshrc
export CLAUDE_CODE_TASK_LIST_ID=$USER
```

### How It Works

- Tasks stored in `~/.claude/tasks/{TASK_LIST_ID}/`
- Persist across sessions, terminal closes, and `/clear`
- Switching branches (with Option B) = switching task lists

### When to Use

| Project Type | Recommendation |
|--------------|----------------|
| Small project, single feature | Don't set it (session-local is fine) |
| Large project, multiple features | Per-feature task lists |
| Long-running refactors | Persistent task list |

### Relationship to Plans

- **Plans** (`plans/feat-*.md`) → Persistent record of decisions and strategy
- **Tasks** → Session/feature coordination that survives context clears

Plans are the source of truth. Tasks are the execution tracker.

---

## Documenting Changes

Wizardworks uses two complementary documentation approaches:

### CHANGELOG.md (For Humans)

Update `CHANGELOG.md` when making notable changes. This is what developers read to understand what's new.

```markdown
## [YYYY-MM-DD]

### Added
- New features

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

### Removed
- Removed features
```

**When to update:**
- Adding new features or patterns
- Changing existing standards or workflows
- Fixing bugs in configuration or hooks
- Removing deprecated functionality

### Plans Directory (Decision Records)

The `plans/` directory organizes documentation by feature or general decisions.

**Structure:**
```
plans/
├── feat-reports-page/              ← Feature folder (matches branch)
│   ├── 001-initial-plan.md
│   ├── 002-api-design.md
│   └── 003-iteration-notes.md
├── feat-user-auth/
│   ├── 001-plan.md
│   └── 002-security-review.md
├── fix-login-timeout/
│   └── 001-investigation.md
└── 2025-01-25-general-decision.md  ← Non-feature decisions stay flat
```

**Naming conventions:**
- Feature folders: Match branch name (e.g., `feat-user-auth/` for branch `feat/user-auth`)
- Feature docs: `NNN-description.md` (e.g., `001-initial-plan.md`)
- General decisions: `YYYY-MM-DD-description.md` (date-based, flat)

**Alignment:**
| Item | Naming |
|------|--------|
| Git branch | `feat/user-auth` |
| Plan folder | `plans/feat-user-auth/` |
| Task list ID | `CLAUDE_CODE_TASK_LIST_ID=feat-user-auth` |

**Plan file template:**
```markdown
# Plan: [Short Title]

**Date**: YYYY-MM-DD
**Status**: Proposed | Implemented
**Author**: [Name]

## Context
Why is this change needed?

## Decisions Made
What was decided and why?

## Changes Implemented
What files were changed?

## Outstanding Work
What remains to be done?
```

**When to create a plan:**
- Starting a new feature (create folder + 001-plan.md)
- Architectural decisions within a feature
- Multi-file refactoring
- General standard/policy changes (flat, date-based)

### Workflow Summary

1. **Starting a feature**: Create `plans/feat-{name}/001-plan.md`
2. **During work**: Add more docs as needed (002-api-design.md, etc.)
3. **After work**: Update CHANGELOG.md with human-readable summary
4. **Commit all**: Include plans and changelog in your commits

## Release Workflow

### Creating a Release

```bash
# Create release branch
git checkout -b release/v1.2.0 develop

# Update version numbers
# Update CHANGELOG.md

# Commit version bump
git commit -m "chore: bump version to 1.2.0"

# Merge to main
git checkout main
git merge --no-ff release/v1.2.0

# Tag release
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0
git branch -d release/v1.2.0
```

## Wizardworks-Specific Git Rules

### Never Commit
- Database IDs in test data (use Public IDs)
- Connection strings
- API keys or secrets
- Large binary files without Git LFS
- `node_modules/` or `bin/obj/`

### Always Commit
- Lock files (package-lock.json, packages.lock.json, pnpm-lock.yaml)
- Bicep files and parameter templates
- CI/CD pipeline configurations
- README and documentation

### Protected Branches
- `main` branch requires:
  - Pull request
  - Passing CI/CD
  - Code review approval
  - All tests passing
  - 80%+ coverage maintained

**Remember**: Git is our single source of truth. Follow these workflows rigorously to maintain code quality and team collaboration.
