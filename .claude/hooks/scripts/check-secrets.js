#!/usr/bin/env node

/**
 * Wizardworks Hook: Check for Hardcoded Secrets
 * Prevents committing hardcoded secrets, API keys, passwords, or connection strings
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath || !fs.existsSync(filePath)) {
  console.error('❌ [Hook Error] File not found:', filePath);
  process.exit(0); // Don't block on error
}

const content = fs.readFileSync(filePath, 'utf8');

// Patterns to detect secrets
const secretPatterns = [
  {
    pattern: /sk-[a-zA-Z0-9]{20,}/g,
    name: 'OpenAI API Key',
    severity: 'CRITICAL'
  },
  {
    pattern: /(password|pwd)\s*[=:]\s*["'][^"']+["']/gi,
    name: 'Hardcoded Password',
    severity: 'CRITICAL'
  },
  {
    pattern: /(api[_-]?key|apikey)\s*[=:]\s*["'][^"']+["']/gi,
    name: 'API Key',
    severity: 'CRITICAL'
  },
  {
    pattern: /Server=.*Password=[^;]+/gi,
    name: 'SQL Connection String with Password',
    severity: 'CRITICAL'
  },
  {
    pattern: /(secret|token)\s*[=:]\s*["'][^"']+["']/gi,
    name: 'Secret or Token',
    severity: 'CRITICAL'
  },
  {
    pattern: /[a-zA-Z0-9_-]{32,}/g,
    name: 'Potential Secret (long random string)',
    severity: 'WARNING'
  }
];

const violations = [];

secretPatterns.forEach(({ pattern, name, severity }) => {
  const matches = content.match(pattern);
  if (matches) {
    // Filter out common false positives
    const filtered = matches.filter(match => {
      const lower = match.toLowerCase();
      return !lower.includes('placeholder') &&
             !lower.includes('example') &&
             !lower.includes('your-') &&
             !lower.includes('xxx') &&
             !lower.includes('todo') &&
             !lower.includes('replace') &&
             !lower.includes('environment.get') &&
             !lower.includes('process.env') &&
             !lower.includes('configuration[') &&
             !lower.includes('@microsoft.keyvault') &&
             match.length < 100; // Likely not a secret if too long
    });

    if (filtered.length > 0) {
      violations.push({
        severity,
        name,
        matches: filtered.slice(0, 3) // Show max 3 examples
      });
    }
  }
});

if (violations.length > 0) {
  console.error('\n🚨 [CRITICAL] Potential Secrets Detected!');
  console.error('━'.repeat(60));
  console.error(`File: ${path.basename(filePath)}\n`);

  violations.forEach(({ severity, name, matches }) => {
    console.error(`[${severity}] ${name}:`);
    matches.forEach(match => {
      const preview = match.length > 50 ? match.substring(0, 50) + '...' : match;
      console.error(`  - ${preview}`);
    });
    console.error('');
  });

  console.error('Wizardworks Security Policy:');
  console.error('✗ NEVER hardcode secrets in code');
  console.error('✓ Use environment variables: process.env.API_KEY');
  console.error('✓ Use Azure Key Vault: @Microsoft.KeyVault(...)');
  console.error('✓ Use User Secrets for local dev: dotnet user-secrets set');
  console.error('━'.repeat(60));

  const hasCritical = violations.some(v => v.severity === 'CRITICAL');
  if (hasCritical) {
    console.error('\n❌ Blocking: CRITICAL security violation detected!');
    process.exit(1);
  } else {
    console.error('\n⚠️  Warning: Potential secrets detected. Please review.');
    process.exit(0);
  }
}

// Success - no secrets detected
process.exit(0);
