#!/usr/bin/env node

/**
 * Wizardworks Hook: Check DTO Usage
 * Ensures controllers use DTOs instead of entity models
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath || !fs.existsSync(filePath) || !filePath.endsWith('.cs')) {
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');
const fileName = path.basename(filePath);

if (!fileName.includes('Controller')) {
  process.exit(0);
}

const violations = [];

// Check for [FromBody] with non-DTO types
const fromBodyPattern = /\[FromBody\]\s+(\w+)\s+\w+/g;
const matches = [...content.matchAll(fromBodyPattern)];

matches.forEach(match => {
  const type = match[1];
  if (!type.includes('Dto') && !type.includes('IFormFile') && type !== 'string' && type !== 'int') {
    violations.push({
      issue: 'Controller accepts entity model instead of DTO',
      type: type,
      fix: `Create ${type}Dto for input`
    });
  }
});

// Check for return types that might be entities
const returnPattern = /public\s+async\s+Task<IActionResult>\s+\w+.*?return\s+(Ok|Created)\((.*?)\)/gs;
const returnMatches = [...content.matchAll(returnPattern)];

returnMatches.forEach(match => {
  const returnValue = match[2];
  // Simple heuristic: if not calling a service method and not a DTO variable name
  if (!returnValue.includes('Dto') && !returnValue.includes('_service') && returnValue.length < 50) {
    violations.push({
      issue: 'Controller may be returning entity instead of DTO',
      line: match[0].substring(0, 80) + '...',
      fix: 'Ensure you\'re returning DTOs, not entity models'
    });
  }
});

if (violations.length > 0) {
  console.error('\n⚠️  [DTO USAGE CHECK]');
  console.error('━'.repeat(60));
  console.error(`File: ${fileName}\n`);

  violations.forEach((v, idx) => {
    console.error(`${idx + 1}. ${v.issue}`);
    if (v.type) console.error(`   Type: ${v.type}`);
    if (v.line) console.error(`   Found: ${v.line}`);
    console.error(`   Fix: ${v.fix}\n`);
  });

  console.error('Wizardworks DTO Pattern:');
  console.error('✗ Controllers should NEVER accept/return entity models');
  console.error('✓ Use CreateXDto for inputs');
  console.error('✓ Use UpdateXDto for updates');
  console.error('✓ Use XDto for outputs');
  console.error('━'.repeat(60));
  console.error('\n⚠️  Please review DTO usage.\n');
}

process.exit(0);
