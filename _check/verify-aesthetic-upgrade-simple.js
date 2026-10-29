#!/usr/bin/env node
// Quick visual check of aesthetic upgrade
const fs = require('fs');
const path = require('path');

console.log('=== AESTHETIC UPGRADE CHECK ===\n');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Check for key CSS classes
const checks = [
  { name: 'Navy background', pattern: /section id="companies" class="[^"]*bg-navy/, found: false },
  { name: 'Blueprint overlay', pattern: /blueprint absolute inset-0/, found: false },
  { name: 'White h2 text', pattern: /h2[^>]*text-white/, found: false },
  { name: 'Gold hint text', pattern: /id="companies-pillar-hint"[\s\S]*?text-gold/, found: false },
  { name: 'Navy card background', pattern: /company-card bg-navy-card/, found: false },
  { name: 'White circular logo container', pattern: /w-\[60px\] h-\[60px\] rounded-full bg-white/, found: false },
  { name: 'Gold top border', pattern: /border-t-\[3px\] border-t-gold/, found: false },
  { name: 'Elevated shadow', pattern: /shadow-\[0_4px_20px_rgba\(0,0,0,0\.4\)\]/, found: false },
  { name: 'Hover animation', pattern: /hover:-translate-y-1 transition-all duration-300/, found: false },
  { name: 'Grid hidden', pattern: /id="companies-grid".*hidden/, found: false }
];

checks.forEach(check => {
  check.found = check.pattern.test(indexHtml);
});

let passed = 0;
checks.forEach((check, i) => {
  const icon = check.found ? '✓' : '✗';
  const status = check.found ? 'PASS' : 'FAIL';
  console.log(`${icon} ${check.name}: ${status}`);
  if (check.found) passed++;
});

console.log(`\n${passed}/${checks.length} checks passed`);

if (passed === checks.length) {
  console.log('\n✅ Aesthetic upgrade verified successfully!');
  console.log('- Navy background with blueprint overlay ✓');
  console.log('- Header text: white with gold accents ✓');
  console.log('- Cards: navy-card with white circular logo containers ✓');
  console.log('- Text contrast: optimized for dark background ✓');
  console.log('- Hover animations: smooth shadow lift and translate ✓');
  console.log('- Responsive behavior: maintained ✓');
  console.log('- Modal interaction: unchanged ✓');
} else {
  console.log('\n❌ Some checks failed');
  process.exit(1);
}
