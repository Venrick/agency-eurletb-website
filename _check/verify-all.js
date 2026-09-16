const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ROOT_DIR = path.resolve(__dirname, '..');
const PAGES = ['index.html', 'about.html', 'services.html', 'projects.html', 'quality-hse.html', 'contact.html', 'service-residential-construction.html', 'service-commercial-buildings.html', 'service-industrial-works.html', 'service-renovation-retrofit.html', 'service-project-management.html', 'service-architectural-design.html', 'service-template.html'];
const LANGS = ['en', 'fr', 'ar'];
const VIEWPORTS = [{ w: 1440, h: 900, name: 'desktop' }, { w: 375, h: 667, name: 'mobile' }];
const PORT = 8123;
const BASE_URL = `http://127.0.0.1:${PORT}/`;

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

function createServer() {
  return http.createServer((req, res) => {
    let fp = path.join(ROOT_DIR, new URL(req.url, BASE_URL).pathname);
    if (fp.endsWith('/') || (fs.existsSync(fp) && fs.statSync(fp).isDirectory())) fp = path.join(fp, 'index.html');
    fs.readFile(fp, (err, content) => {
      if (err) { res.writeHead(404); res.end(); }
      else { res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); res.end(content); }
    });
  });
}

async function run() {
  const server = createServer();
  await new Promise(r => server.listen(PORT, r));
  const browser = await puppeteer.launch({ executablePath: EDGE_PATH, headless: true, args: ['--no-sandbox'] });

  let total = 0, passed = 0, failed = [];

  for (const pFile of PAGES) {
    for (const lang of LANGS) {
      for (const vp of VIEWPORTS) {
        total++;
        const page = await browser.newPage();
        await page.setViewport({ width: vp.w, height: vp.h });
        try {
          await page.goto(BASE_URL + pFile + '?lang=' + lang, { waitUntil: 'networkidle0', timeout: 30000 });
          await page.waitForFunction(() => document.documentElement.getAttribute('lang') !== null, { timeout: 5000 });
          const res = await page.evaluate(checkPage, vp.name, lang);
          if (res.length === 0) passed++;
          else failed.push({ page: pFile, lang, vp: vp.name, issues: res });
        } catch (e) {
          failed.push({ page: pFile, lang, vp: vp.name, issues: [e.message] });
        } finally {
          await page.close();
        }
      }
    }
  }

  await browser.close();
  server.close();

  console.log(`\n=== SUMMARY ===\nTotal: ${total}, Passed: ${passed}, Failed: ${failed.length}`);
  if (failed.length) failed.forEach(f => console.log(`  FAIL: ${f.page} ${f.lang} ${f.vp} -> ${f.issues.join('; ')}`));
  else console.log('ALL CHECKS PASSED');
}

function checkPage(vpName, lang) {
  const issues = [];
  const htmlLang = document.documentElement.getAttribute('lang');
  const htmlDir = document.documentElement.getAttribute('dir');
  if (htmlLang !== lang) issues.push('lang attr: ' + htmlLang + ' !== ' + lang);
  if (lang === 'ar' && htmlDir !== 'rtl') issues.push('AR missing rtl');
  if (lang !== 'ar' && htmlDir !== 'ltr') issues.push('non-AR missing ltr');
  
  const mainbar = document.getElementById('mainbar');
  if (!mainbar) issues.push('mainbar missing');
  
  if (vpName === 'desktop') {
    const langBtns = document.querySelectorAll('.lang-btn');
    if (langBtns.length !== 3) issues.push('desktop: expected 3 lang-btns, got ' + langBtns.length);
    const activeBtn = document.querySelector('.lang-btn.active');
    if (!activeBtn) issues.push('desktop: no active lang-btn');
    else if (activeBtn.getAttribute('data-lang') !== lang) issues.push('desktop: active lang=' + activeBtn.getAttribute('data-lang') + ' !== ' + lang);
  }
  
  if (vpName === 'mobile') {
    const compact = document.querySelector('.lang-compact');
    if (!compact) issues.push('mobile: lang-compact missing');
    const btn = document.querySelector('.lang-compact-btn');
    if (btn) {
      const current = btn.querySelector('.lang-current');
      if (current && current.textContent.trim().toLowerCase() !== lang) issues.push('mobile: compact shows ' + current.textContent + ' not ' + lang);
    }
    const logo = mainbar && mainbar.querySelector('a[href="index.html"]');
    const hamburger = document.getElementById('hamburger');
    if (logo && hamburger && compact) {
      const mainbarRect = mainbar.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const hambRect = hamburger.getBoundingClientRect();
      const compactRect = compact.getBoundingClientRect();
      
      const centerY = mainbarRect.top + mainbarRect.height / 2;
      if (Math.abs(logoRect.top + logoRect.height/2 - centerY) > 5) issues.push('mobile: logo not vertically centered');
      if (Math.abs(hambRect.top + hambRect.height/2 - centerY) > 5) issues.push('mobile: hamburger not vertically centered');
      if (Math.abs(compactRect.top + compactRect.height/2 - centerY) > 5) issues.push('mobile: compact not vertically centered');
      
      const isRTL = lang === 'ar';
      if (!isRTL) {
        if (compactRect.right > logoRect.left) issues.push('mobile LTR: compact should be left of logo');
        if (hambRect.left < logoRect.right) issues.push('mobile LTR: hamburger should be right of logo');
      } else {
        if (compactRect.left < logoRect.right) issues.push('mobile RTL: compact should be right of logo');
        if (hambRect.right > logoRect.left) issues.push('mobile RTL: hamburger should be left of logo');
      }
      
      if (hambRect.width < 44 || hambRect.height < 44) issues.push('mobile: hamburger tap target < 44px');
      if (compactRect.height < 44) issues.push('mobile: compact btn height < 44px');
    }
  }
  
  const footerNavTitle = document.querySelector('[data-i18n="footer.nav_title"]');
  if (!footerNavTitle) issues.push('footer.nav_title missing');
  
  if (document.body.scrollWidth > window.innerWidth + 1) {
    issues.push('horizontal overflow: body ' + document.body.scrollWidth + ' > viewport ' + window.innerWidth);
  }
  // Check page-unique body content is untranslated
  // (except for pages with translated content: index.html, about.html, services.html, contact.html, projects.html)
  const pageFile = window.location.pathname.split('/').pop() || 'index.html';
  if (pageFile !== 'index.html' && pageFile !== 'about.html' && pageFile !== 'services.html' && pageFile !== 'contact.html' && pageFile !== 'projects.html') {
    const untranslatedElements = document.querySelectorAll('main [data-i18n], section:not(#hero):not(#page-hero) h1[data-i18n], section h2[data-i18n]');
    if (untranslatedElements.length > 0) {
      issues.push('Found unexpected data-i18n attributes on unique body content: ' + untranslatedElements.length);
    }
  } else if (pageFile === 'about.html') {
    const heroEyebrow = document.querySelector('[data-i18n="about.hero_eyebrow"]');
    if (!heroEyebrow) issues.push('about.hero_eyebrow missing');
    const heroHeadline = document.querySelector('[data-i18n-html="about.hero_headline"]');
    if (!heroHeadline || !heroHeadline.querySelector('.text-gold')) issues.push('about.hero_headline missing gold span');
    const storyHeadline = document.querySelector('[data-i18n-html="about.story_headline"]');
    if (!storyHeadline || !storyHeadline.querySelector('.text-gold')) issues.push('about.story_headline missing gold span');
    const ctaHeading = document.querySelector('[data-i18n-html="about.cta_heading"]');
    if (!ctaHeading || !ctaHeading.querySelector('.text-gold')) issues.push('about.cta_heading missing gold span');
  } else if (pageFile === 'services.html') {
    const heroEyebrow = document.querySelector('[data-i18n="services.hero_eyebrow"]');
    if (!heroEyebrow) issues.push('services.hero_eyebrow missing');
    const heroHeadline = document.querySelector('[data-i18n-html="services.hero_headline"]');
    if (!heroHeadline || !heroHeadline.querySelector('.text-gold')) issues.push('services.hero_headline missing gold span');
    const gridHeadline = document.querySelector('[data-i18n-html="services.grid_headline"]');
    if (!gridHeadline || !gridHeadline.querySelector('.text-gold')) issues.push('services.grid_headline missing gold span');
    const ctaHeading = document.querySelector('[data-i18n="services.cta_heading"]');
    if (!ctaHeading) issues.push('services.cta_heading missing');
    const learnMore = document.querySelectorAll('[data-i18n="services.card_learn_more"]');
    if (learnMore.length !== 6) issues.push('services: expected 6 shared Learn More spans, got ' + learnMore.length);
    const learnMoreArrows = document.querySelectorAll('#services-grid a[href^="service-"] svg');
    if (learnMoreArrows.length !== 6) issues.push('services: expected 6 arrow svgs in Learn More links, got ' + learnMoreArrows.length);
    const svcTitles = document.querySelectorAll('#services-grid h3[data-i18n^="footer.svc_"]');
    if (svcTitles.length !== 6) issues.push('services: expected 6 footer.svc_* card titles, got ' + svcTitles.length);
    const processSteps = document.querySelectorAll('#process-steps .process-step');
    if (processSteps.length !== 4) issues.push('services: expected 4 process steps, got ' + processSteps.length);
    const stepBodies = document.querySelectorAll('[data-i18n^="services.process_step"]');
    if (stepBodies.length !== 8) issues.push('services: expected 8 process step title/body elements, got ' + stepBodies.length);
  } else if (pageFile === 'contact.html') {
    const heroEyebrow = document.querySelector('[data-i18n="contact.hero_eyebrow"]');
    if (!heroEyebrow) issues.push('contact.hero_eyebrow missing');
    const heroHeadline = document.querySelector('[data-i18n-html="contact.hero_headline"]');
    if (!heroHeadline || !heroHeadline.querySelector('.text-gold')) issues.push('contact.hero_headline missing gold span');
    if (heroHeadline && !heroHeadline.querySelector('br')) issues.push('contact.hero_headline missing <br>');
    const locBody = document.querySelector('[data-i18n-html="contact.card_location_body"]');
    if (!locBody || !locBody.querySelector('br')) issues.push('contact.card_location_body missing <br>');
    const formHeading = document.querySelector('[data-i18n="contact.form_heading"]');
    if (!formHeading) issues.push('contact.form_heading missing');
    const svcOptions = document.querySelectorAll('select option[data-i18n^="footer.svc_"]');
    if (svcOptions.length !== 6) issues.push('contact: expected 6 footer.svc_* options, got ' + svcOptions.length);
    const phEls = document.querySelectorAll('[data-i18n-placeholder]');
    if (phEls.length !== 4) issues.push('contact: expected 4 data-i18n-placeholder elements, got ' + phEls.length);
    const alEls = document.querySelectorAll('[data-i18n-aria-label]');
    if (alEls.length !== 4) issues.push('contact: expected 4 data-i18n-aria-label elements, got ' + alEls.length);
    const sel = document.querySelector('select');
    const selTxt = sel ? sel.textContent : '';
    ['Commercial & Industrial', 'Renovation & Remodeling', 'General Contracting', 'Heavy Machinery', 'Maintenance Services'].forEach(function (stale) {
      if (selTxt.indexOf(stale) >= 0) issues.push('contact: stale service option still present: ' + stale);
    });
  } else if (pageFile === 'projects.html') {
    const heroEyebrow = document.querySelector('[data-i18n="projects.hero_eyebrow"]');
    if (!heroEyebrow) issues.push('projects.hero_eyebrow missing');
    const heroHeadline = document.querySelector('[data-i18n-html="projects.hero_headline"]');
    if (!heroHeadline || !heroHeadline.querySelector('.text-gold')) issues.push('projects.hero_headline missing gold span');
    const filters = document.querySelectorAll('.filter-btn');
    if (filters.length !== 4) issues.push('projects: expected 4 filter buttons, got ' + filters.length);
    const cards = document.querySelectorAll('.project-card');
    if (cards.length !== 12) issues.push('projects: expected 12 rendered project cards, got ' + cards.length);
    // Drift guard: card category labels must be worded exactly like the filter buttons.
    const labelBySlug = {};
    filters.forEach(function (b) { labelBySlug[b.dataset.filter] = b.textContent.trim(); });
    cards.forEach(function (c) {
      const catEl = c.querySelector('span');
      const slug = c.dataset.category;
      if (!catEl || !labelBySlug[slug]) return;
      const shown = catEl.textContent.trim();
      if (shown !== labelBySlug[slug]) issues.push('projects: card category "' + shown + '" != filter label "' + labelBySlug[slug] + '"');
    });
    // A translated page must not fall back to the EN source names once localised.
    const firstName = cards.length ? cards[0].querySelector('h3').textContent.trim() : '';
    if (lang !== 'en' && firstName === 'Algiers Business Tower') issues.push('projects: card name not localised (' + firstName + ')');
  }
  
  return issues;
}

run().catch(e => { console.error(e); process.exit(1); });