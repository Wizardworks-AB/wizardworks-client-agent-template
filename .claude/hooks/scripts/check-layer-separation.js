#!/usr/bin/env node

/**
 * Wizardworks Hook: Check Layer Separation
 * Verifies Controller-Service-Repository pattern adherence
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath || !fs.existsSync(filePath) || !filePath.endsWith('Controller.cs')) {
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');

const violations = [];

// Check for direct repository usage in controller
if (content.match(/private.*Repository\s+_repository/i) || content.match(/IRepository.*repository/i)) {
  violations.push({
    issue: 'Controller has direct dependency on Repository',
    severity: 'HIGH',
    fix: 'Controllers should only depend on Services, not Repositories'
  });
}

// Check for business logic in controller (multiple if statements, complex logic)
const methodPattern = /public\s+async\s+Task<IActionResult>\s+\w+[^{]*{([^}]*)}/gs;
const methods = [...content.matchAll(methodPattern)];

methods.forEach(match => {
  const methodBody = match[1];
  const ifCount = (methodBody.match(/\bif\s*\(/g) || []).length;
  const forCount = (methodBody.match(/\bfor\s*\(/g) || []).length;

  if (ifCount > 2 || forCount > 0) {
    violations.push({
      issue: 'Controller method contains business logic',
      severity: 'MEDIUM',
      fix: 'Move business logic to Service layer'
    });
  }

  // Check for direct database operations
  if (methodBody.includes('_context') || methodBody.includes('DbContext')) {
    violations.push({
      issue: 'Controller has direct database access',
      severity: 'HIGH',
      fix: 'Use Service layer for database operations'
    });
  }
});

// Check for proper service usage
if (!content.includes('Service') && !content.includes('IService')) {
  violations.push({
    issue: 'Controller does not use Service layer',
    severity: 'HIGH',
    fix: 'Inject IService dependency'
  });
}

if (violations.length > 0) {
  console.error('\n⚠️  [LAYER SEPARATION CHECK]');
  console.error('━'.repeat(60));
  console.error(`File: ${path.basename(filePath)}\n`);

  violations.forEach((v, idx) => {
    console.error(`${idx + 1}. [${v.severity}] ${v.issue}`);
    console.error(`   Fix: ${v.fix}\n`);
  });

  console.error('Wizardworks Architecture Pattern:');
  console.error('Controller → Service → Repository');
  console.error('');
  console.error('Controllers should:');
  console.error('✓ Handle HTTP requests/responses');
  console.error('✓ Validate input (model validation)');
  console.error('✓ Call service methods');
  console.error('✗ NOT contain business logic');
  console.error('✗ NOT access repositories directly');
  console.error('✗ NOT access database directly');
  console.error('━'.repeat(60));
  console.error('\n⚠️  Please fix layer separation violations.\n');
}

process.exit(0);
