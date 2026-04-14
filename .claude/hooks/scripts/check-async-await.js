#!/usr/bin/env node

/**
 * Wizardworks Hook: Check Async/Await Usage
 * Ensures async methods use await properly in C#
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath || !fs.existsSync(filePath) || !filePath.endsWith('.cs')) {
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');

const violations = [];

// Check for async methods without await
const asyncMethodPattern = /public\s+async\s+Task[<>]*\s+\w+\s*\([^)]*\)\s*{([^}]*)}/g;
const matches = [...content.matchAll(asyncMethodPattern)];

matches.forEach(match => {
  const methodBody = match[1];
  if (!methodBody.includes('await') && !methodBody.includes('Task.FromResult')) {
    violations.push({
      issue: 'Async method without await',
      suggestion: 'Remove async keyword if not using await, or add await to async calls'
    });
  }
});

// Check for .Result or .Wait() usage
if (content.includes('.Result') || content.includes('.Wait()')) {
  violations.push({
    issue: 'Blocking async call detected (.Result or .Wait())',
    suggestion: 'Use await instead of blocking calls'
  });
}

// Check for async void (except event handlers)
if (content.match(/public\s+async\s+void\s+\w+/)) {
  violations.push({
    issue: 'async void method detected',
    suggestion: 'Use async Task instead (async void is only for event handlers)'
  });
}

if (violations.length > 0) {
  console.error('\n⚠️  [ASYNC/AWAIT CHECK]');
  console.error('━'.repeat(60));
  console.error(`File: ${path.basename(filePath)}\n`);

  violations.forEach((v, idx) => {
    console.error(`${idx + 1}. ${v.issue}`);
    console.error(`   → ${v.suggestion}\n`);
  });

  console.error('Wizardworks Async Best Practices:');
  console.error('✓ Use async/await consistently');
  console.error('✗ Never use .Result or .Wait() (causes deadlocks)');
  console.error('✗ Avoid async void (except event handlers)');
  console.error('✓ Remove async if not using await');
  console.error('━'.repeat(60));
  console.error('\n⚠️  Please review async/await usage.\n');
}

process.exit(0);
