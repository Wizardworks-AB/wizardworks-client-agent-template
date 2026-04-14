#!/usr/bin/env node

/**
 * Wizardworks Hook: Check for Database ID Exposure
 * Ensures Public IDs are used instead of database IDs in API code
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath || !fs.existsSync(filePath)) {
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');
const fileName = path.basename(filePath);

// Only check Controllers and DTOs
if (!fileName.includes('Controller') && !fileName.includes('Dto')) {
  process.exit(0);
}

const violations = [];

// Check for database ID exposure in C# code
if (filePath.endsWith('.cs')) {
  // Check for [HttpGet("{id}")] with int parameter
  const httpGetIntPattern = /\[HttpGet\("{id}"\)\][\s\S]*?public.*?\(int id\)/g;
  if (httpGetIntPattern.test(content)) {
    violations.push({
      issue: 'HTTP endpoint uses int id instead of string publicId',
      line: 'HttpGet route parameter',
      fix: 'Change [HttpGet("{id}")] to [HttpGet("{publicMagicId}")]'
    });
  }

  // Check for DTOs with database ID properties
  if (fileName.includes('Dto')) {
    const dbIdPattern = /public int \w+Id { get; set; }/g;
    const matches = content.match(dbIdPattern);
    if (matches) {
      matches.forEach(match => {
        if (!match.includes('PublicId')) {
          violations.push({
            issue: 'DTO exposes database ID property',
            line: match.trim(),
            fix: 'Use public string PublicMagicId { get; set; } instead'
          });
        }
      });
    }
  }

  // Check for controllers returning entities directly
  if (fileName.includes('Controller')) {
    const returnEntityPattern = /return.*?<(\w+)>\(/g;
    const matches = [...content.matchAll(returnEntityPattern)];
    matches.forEach(match => {
      const type = match[1];
      if (!type.includes('Dto') && !type.includes('IActionResult')) {
        violations.push({
          issue: 'Controller may be returning entity instead of DTO',
          line: match[0],
          fix: `Return ${type}Dto instead of ${type} entity`
        });
      }
    });
  }
}

// Check for TypeScript/React
if (filePath.match(/\.(ts|tsx)$/)) {
  // Check for id: number in interfaces
  const numberIdPattern = /\bid:\s*number\b/g;
  if (numberIdPattern.test(content)) {
    violations.push({
      issue: 'Interface uses numeric id instead of string publicId',
      line: 'id: number',
      fix: 'Use publicMagicId: string instead'
    });
  }
}

if (violations.length > 0) {
  console.error('\n⚠️  [PUBLIC ID CHECK] Potential Database ID Exposure');
  console.error('━'.repeat(60));
  console.error(`File: ${fileName}\n`);

  violations.forEach((v, idx) => {
    console.error(`${idx + 1}. ${v.issue}`);
    console.error(`   Found: ${v.line}`);
    console.error(`   Fix: ${v.fix}\n`);
  });

  console.error('Wizardworks Standard:');
  console.error('✗ NEVER expose database IDs (int MagicId) externally');
  console.error('✓ ALWAYS use Public IDs (string PublicMagicId) in APIs');
  console.error('✓ DTOs should only contain public-facing properties');
  console.error('━'.repeat(60));
  console.error('\n⚠️  Please review and fix before continuing.\n');

  // Don't block, just warn
  process.exit(0);
}

process.exit(0);
