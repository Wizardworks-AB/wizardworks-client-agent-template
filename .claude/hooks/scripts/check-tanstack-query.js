#!/usr/bin/env node

/**
 * Wizardworks Hook: Check TanStack Query Usage
 * Ensures TanStack Query is used for data fetching in React
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath || !fs.existsSync(filePath) || !filePath.match(/components\/.*\.(tsx|ts)$/)) {
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');

const violations = [];

// Check for direct fetch/axios usage without TanStack Query
const directFetchPatterns = [
  {
    pattern: /fetch\s*\(/,
    name: 'Direct fetch() call',
    fix: 'Use TanStack Query (useQuery, useMutation)'
  },
  {
    pattern: /axios\.(get|post|put|delete)/,
    name: 'Direct axios call',
    fix: 'Use TanStack Query hooks'
  }
];

directFetchPatterns.forEach(({ pattern, name, fix }) => {
  if (pattern.test(content)) {
    // Check if it's inside a service file (which is ok)
    if (!content.includes('useQuery') && !content.includes('useMutation')) {
      violations.push({
        issue: name,
        fix: fix
      });
    }
  }
});

// Check for useEffect with data fetching
if (content.includes('useEffect') && (content.includes('fetch(') || content.includes('axios'))) {
  violations.push({
    issue: 'useEffect used for data fetching',
    fix: 'Use TanStack Query (useQuery) instead of useEffect for data fetching'
  });
}

// Check for manual loading state management
if (content.includes('useState') && content.match(/useState.*loading|isLoading/i)) {
  if (!content.includes('useQuery') && !content.includes('useMutation')) {
    violations.push({
      issue: 'Manual loading state management',
      fix: 'TanStack Query provides isLoading, isPending states automatically'
    });
  }
}

if (violations.length > 0) {
  console.error('\n⚠️  [TANSTACK QUERY CHECK]');
  console.error('━'.repeat(60));
  console.error(`File: ${path.basename(filePath)}\n`);

  violations.forEach((v, idx) => {
    console.error(`${idx + 1}. ${v.issue}`);
    console.error(`   Fix: ${v.fix}\n`);
  });

  console.error('Wizardworks Frontend Standard:');
  console.error('✓ Use TanStack Query for ALL data fetching');
  console.error('✓ useQuery for GET requests');
  console.error('✓ useMutation for POST/PUT/DELETE');
  console.error('✗ Avoid direct fetch/axios in components');
  console.error('✗ Avoid useEffect for data fetching');
  console.error('');
  console.error('Example:');
  console.error('  const { data, isLoading } = useQuery({');
  console.error('    queryKey: ["magic", id],');
  console.error('    queryFn: () => magicService.getById(id)');
  console.error('  });');
  console.error('━'.repeat(60));
  console.error('\n⚠️  Consider using TanStack Query.\n');
}

process.exit(0);
