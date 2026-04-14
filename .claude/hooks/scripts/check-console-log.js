#!/usr/bin/env node

/**
 * Wizardworks Hook: Check for console.log
 * Warns about console.log statements in production code
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath || !fs.existsSync(filePath)) {
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const violations = [];

lines.forEach((line, idx) => {
  // Skip commented lines
  if (line.trim().startsWith('//')) {
    return;
  }

  if (line.includes('console.log(') || line.includes('console.warn(') || line.includes('console.error(')) {
    violations.push({
      lineNumber: idx + 1,
      line: line.trim()
    });
  }
});

if (violations.length > 0) {
  console.error('\n⚠️  [CONSOLE.LOG DETECTED]');
  console.error('━'.repeat(60));
  console.error(`File: ${path.basename(filePath)}\n`);

  violations.forEach(v => {
    console.error(`Line ${v.lineNumber}: ${v.line}`);
  });

  console.error('\nWizardworks Best Practice:');
  console.error('✗ Avoid console.log in production code');
  console.error('✓ Use proper logging (ILogger in .NET, structured logging)');
  console.error('✓ Remove debug console statements before committing');
  console.error('━'.repeat(60));
  console.error('\n⚠️  Please remove console.log statements.\n');
}

process.exit(0);
