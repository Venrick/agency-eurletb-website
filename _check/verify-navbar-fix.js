#!/usr/bin/env node
/**
 * verify-navbar-fix.js
 * Verify that the Companies nav link active class fix is correct
 * Checks index.html and all other pages for active link correctness
 */

const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'about.html',
  'services.html',
  'projects.html',
  'contact.html',
  'quality-hse.html'
];

const expectedActive = {
  'index.html': 'nav.home',
  'about.html': 'nav.about',
  'services.html': 'nav.services',
  'projects.html': 'nav.projects',
  'contact.html': 'nav.contact',
  'quality-hse.html': 'nav.quality'
};

const companiesLinkPattern = /href="index\.html[^"]*"\s+data-i18n="nav\.companies"[^>]*class="([^"]*)"/;
const activeLinkPattern = /class="([^"]*)"\s+data-i18n="nav\.(home|about|services|projects|contact|quality)"[^>]*active/;

let passed = 0;
let failed = 0;

console.log('🔍 Verifying navbar active link fixes...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ FAIL: ${file} — file not found`);
    failed++;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check Companies link on this page
  const companiesMatch = content.match(companiesLinkPattern);
  const companiesHasActive = companiesMatch && companiesMatch[1].includes('active');
  
  // Check which link has active class
  const activeMatch = content.match(activeLinkPattern);
  const expectedLink = expectedActive[file];
  const actualActiveLink = activeMatch ? `nav.${activeMatch[2]}` : 'none';
  
  // Validation logic
  let check1 = true;
  let check2 = true;
  let reason = '';
  
  // Check 1: Companies link should NEVER have active class
  if (companiesHasActive) {
    check1 = false;
    reason += `Companies link has .active class (should not). `;
  }
  
  // Check 2: Expected link should have active class
  if (actualActiveLink !== expectedLink) {
    check2 = false;
    reason += `Expected ${expectedLink} to be active, but found ${actualActiveLink}. `;
  }
  
  if (check1 && check2) {
    console.log(`✅ PASS: ${file}`);
    console.log(`   └─ Companies link: no .active class ✓`);
    console.log(`   └─ Active link: ${expectedLink} ✓\n`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${file}`);
    if (!check1) console.log(`   └─ Companies link has .active class (WRONG)`);
    if (!check2) console.log(`   └─ Expected ${expectedLink}, found ${actualActiveLink}`);
    console.log(`   └─ ${reason}\n`);
    failed++;
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

if (failed === 0) {
  console.log('\n✅ All navbar active link fixes verified successfully!\n');
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed. Please review the issues above.\n');
  process.exit(1);
}
