# Wizardworks Research Context

Mode: Exploration, investigation, discovery, and learning
Focus: Understanding before acting - deep analysis and comprehensive findings

## Behavior

- **Read widely before concluding**: Examine multiple files, patterns, and related code
- **Ask clarifying questions**: Ensure understanding of context and requirements
- **Document findings as you go**: Build comprehensive understanding
- **Form and verify hypotheses**: Test assumptions against evidence
- **No premature code**: Don't write code until understanding is clear
- **Trace implications**: Consider how findings affect other parts of the system
- **Share context**: Provide sufficient background for others to understand findings

## Research Process

1. **Understand the question**: What specifically needs investigation?
2. **Explore relevant code/docs**: Read related files, patterns, architecture
3. **Trace patterns**: Find where this pattern appears elsewhere
4. **Form hypothesis**: Develop theory based on evidence
5. **Verify with evidence**: Check hypothesis against code and documentation
6. **Document findings**: Summarize what you've learned
7. **Provide recommendations**: Suggest next steps based on findings

## Investigation Checklist

- [ ] Question fully understood
- [ ] Relevant files identified and read
- [ ] Wizardworks patterns researched
- [ ] Related code traced across codebase
- [ ] Multiple perspectives examined
- [ ] Evidence collected and documented
- [ ] Hypothesis verified against evidence
- [ ] Findings summarized clearly
- [ ] Recommendations provided

## Research Focus Areas

### Architecture & Patterns

- How are layers separated (Controller-Service-Repository)?
- Where are Public IDs used vs database IDs?
- How are DTOs structured and mapped?
- What composition patterns are used?
- How is dependency injection implemented?

### Code Organization

- How are features organized (by type vs by feature)?
- What naming conventions are followed?
- How large are typical files and methods?
- What reusable patterns are in place?
- How is code duplication handled?

### Testing Patterns

- What test frameworks are used?
- How are tests organized?
- What coverage levels are typical?
- How are mocks and dependencies handled?
- What test patterns are reused?

### Security Practices

- How are secrets managed?
- What validation patterns are used?
- How is authentication implemented?
- How are error messages handled?
- What security checks are in place?

### Performance & Scalability

- What performance patterns are used?
- How are queries optimized?
- What caching strategies are employed?
- What are bottlenecks?
- What scaling concerns exist?

### Technical Debt & Complexity

- What areas need refactoring?
- Where is complexity highest?
- What patterns aren't being followed?
- What gaps exist in coverage?
- What standards aren't met?

## Tools to Favor

- **Read**: Deep understanding of code and patterns
- **Grep, Glob**: Finding patterns and occurrences across codebase
- **Bash**: Running searches, analyzing output
- **WebSearch, WebFetch**: External documentation and references
- **Skill (Explore)**: Use for complex codebase questions

## Research Output Format

### Findings Summary

1. **Question**: What was being investigated
2. **Scope**: What parts of the system were examined
3. **Key Findings**: 3-5 main discoveries
4. **Evidence**: Code snippets supporting findings
5. **Related Areas**: Where else this matters
6. **Recommendations**: Suggested actions

### Presentation

- **Findings first**: Lead with discoveries, not methods
- **Evidence-based**: Show code, not opinions
- **Hierarchical**: Most important findings first
- **Actionable**: Provide specific recommendations
- **Documented**: Reference file paths and line numbers

## Example Investigation Patterns

### Investigating a Feature Implementation

1. Find all files related to feature (Controllers, Services, Repositories, DTOs)
2. Trace how data flows through layers
3. Check test coverage for the feature
4. Verify Public ID and DTO patterns used
5. Review security validation
6. Assess code quality and complexity
7. Document findings with recommendations

### Investigating Architecture Violations

1. Search for layer-skipping patterns (Controller→Repository)
2. Find instances where entities are exposed in APIs
3. Identify code that doesn't follow patterns
4. Trace impact of violations
5. Document scope of issue
6. Recommend refactoring approach

### Investigating Security Concerns

1. Search for hardcoded secrets or keys
2. Find parameterized vs string-concatenated queries
3. Check input validation on endpoints
4. Verify authorization checks
5. Review error message handling
6. Document security gaps and risks

### Investigating Performance Issues

1. Identify slow queries (N+1 problems, missing indexes)
2. Find inefficient algorithms or patterns
3. Check for unnecessary allocations
4. Review caching strategies
5. Measure vs estimate impact
6. Recommend optimization approach

### Investigating Code Quality

1. Find oversized methods (>50 lines .NET, >30 lines React)
2. Identify duplicated code
3. Check naming consistency
4. Review error handling patterns
5. Assess test coverage gaps
6. Document refactoring priorities

## Research Mindset

### Do's

- ✅ Examine multiple files before drawing conclusions
- ✅ Look for patterns and repetition
- ✅ Question assumptions with evidence
- ✅ Consider context and constraints
- ✅ Trace implications across system
- ✅ Document reasoning and sources
- ✅ Verify findings with actual code

### Don'ts

- ❌ Jump to conclusions without evidence
- ❌ Read single file and assume understanding
- ❌ Ignore context or constraints
- ❌ Make recommendations without investigation
- ❌ Confuse correlation with causation
- ❌ Forget to reference findings with file/line numbers

## Wizardworks Research Context

### Standards to Research

- **CONSTITUTION.md**: Core principles and enforcement
- **Architectural Patterns**: Controller-Service-Repository, Public ID, DTO
- **Testing Standards**: TDD workflow, 80% coverage, test types
- **Security Standards**: Secret management, validation, authentication
- **Code Style**: Naming, file sizes, method complexity, immutability

### Common Research Questions

- "How should I implement X feature?"
- "Where is this pattern used in our codebase?"
- "What's the current state of test coverage?"
- "Are we following security standards?"
- "How should this layer be structured?"
- "What testing patterns do we use?"
- "Why isn't this code following patterns?"

## Research Documentation Template

```markdown
# Investigation: [Title]

## Question
What specifically was being investigated?

## Scope
What files and areas were examined?

## Key Findings
1. Finding 1 with evidence
2. Finding 2 with evidence
3. Finding 3 with evidence

## Evidence
### File: path/to/file.cs (line 123)
Code snippet with context

### File: path/to/other/file.ts (line 456)
Code snippet with context

## Related Areas
- Where else this matters
- Connected components
- Dependent systems

## Recommendations
1. Recommended action 1
2. Recommended action 2
3. Recommended action 3

## References
- [CONSTITUTION.md](link) - Core standards
- [rules/security.md](link) - Security patterns
```

## Helpful References

- **CONSTITUTION.md**: Core engineering principles and standards
- **rules/coding-style.md**: Code organization and naming conventions
- **rules/testing.md**: Testing requirements and patterns
- **rules/security.md**: Security practices and standards
- **rules/git-workflow.md**: Version control patterns
- **skills/backend-patterns-dotnet/SKILL.md**: .NET architecture and patterns
- **skills/frontend-patterns-react/SKILL.md**: React patterns and best practices
- **skills/infrastructure-as-code/SKILL.md**: Infrastructure and deployment patterns
