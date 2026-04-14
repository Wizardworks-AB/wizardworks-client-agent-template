#!/usr/bin/env node

/**
 * Wizardworks Hook: Check for State Mutation
 * Detects state mutation in TypeScript/React code
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath || !fs.existsSync(filePath) || !filePath.match(/\.(ts|tsx)$/)) {
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const violations = [];

// Patterns that indicate mutation
const mutationPatterns = [
  {
    pattern: /\w+\.push\(/,
    name: 'Array.push() mutation',
    fix: 'Use [...array, newItem] instead'
  },
  {
    pattern: /\w+\.pop\(/,
    name: 'Array.pop() mutation',
    fix: 'Use array.slice(0, -1) instead'
  },
  {
    pattern: /\w+\.splice\(/,
    name: 'Array.splice() mutation',
    fix: 'Use array.filter() or array.slice() instead'
  },
  {
    pattern: /\w+\.sort\(\)/,
    name: 'Array.sort() mutation',
    fix: 'Use [...array].sort() to avoid mutation'
  },
  {
    pattern: /\w+\.reverse\(\)/,
    name: 'Array.reverse() mutation',
    fix: 'Use [...array].reverse() instead'
  },
  {
    pattern: /\w+\.\w+\s*=\s*[^=]/,
    name: 'Direct property assignment (potential mutation)',
    fix: 'Use spread operator: { ...obj, prop: value }'
  }
];

lines.forEach((line, idx) => {
  // Skip comments
  if (line.trim().startsWith('//')) {
    return;
  }

  mutationPatterns.forEach(({ pattern, name, fix }) => {
    if (pattern.test(line)) {
      // Filter out some false positives
      if (line.includes('const') || line.includes('let') || line.includes('var')) {
        // Variable declaration, not mutation
        return;
      }

      violations.push({
        lineNumber: idx + 1,
        line: line.trim(),
        issue: name,
        fix: fix
      });
    }
  });
});

if (violations.length > 0) {
  console.error('\n⚠️  [IMMUTABILITY CHECK] Potential State Mutation');
  console.error('━'.repeat(60));
  console.error(`File: ${path.basename(filePath)}\n`);

  violations.slice(0, 5).forEach(v => {
    console.error(`Line ${v.lineNumber}: ${v.issue}`);
    console.error(`  ${v.line}`);
    console.error(`  Fix: ${v.fix}\n`);
  });

  if (violations.length > 5) {
    console.error(`... and ${violations.length - 5} more\n`);
  }

  console.error('Wizardworks Immutability Standard:');
  console.error('✗ NEVER mutate state directly');
  console.error('✓ Use spread operators: { ...obj, prop: value }');
  console.error('✓ Use array methods: [...array, item] or array.map()');
  console.error('✓ Use immutable patterns throughout');
  console.error('━'.repeat(60));
  console.error('\n⚠️  Please review for immutability.\n');
}

process.exit(0);
