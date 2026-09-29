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

/* Copy that must never come back: OHSAS 18001 was withdrawn in 2018 (superseded by ISO 45001), and
   ISO 9001 is an in-progress alignment (quality-hse.html) — never a held certificate. */
const RETIRED_COPY = {
  'about.html': ['OHSAS', '18001', 'Quality Management Systems Certified', 'Achieved ISO 9001 quality management certification'],
  'assets/js/i18n.js': ['OHSAS', '18001', 'Quality Management Systems Certified', 'Certifié Système de management de la qualité', 'Obtention de la certification ISO 9001', 'معتمدة في نظام إدارة الجودة', 'حصلنا على شهادة']
};

/* Corrected ISO 9001 card copy, one entry per dictionary (EN source of truth + FR + AR). */
const ISO_9001_SUBS = [
  'Quality Management System — In Progress',
  'Système de management de la qualité — en cours',
  'نظام إدارة الجودة — قيد التنفيذ'
];

function staticSourceChecks() {
  const issues = [];
  const read = f => fs.readFileSync(path.join(ROOT_DIR, f), 'utf8');
  Object.keys(RETIRED_COPY).forEach(function (file) {
    const txt = read(file);
    RETIRED_COPY[file].forEach(function (dead) {
      if (txt.indexOf(dead) >= 0) issues.push(file + ': retired certification copy still present: "' + dead + '"');
    });
  });
  const dicts = read('assets/js/i18n.js');
  ISO_9001_SUBS.forEach(function (copy) {
    if (dicts.indexOf(copy) === -1) issues.push('i18n.js: missing corrected ISO 9001 card copy ("' + copy + '")');
  });
  /* Every language block must define exactly the same key set. A key present in EN but absent from
     FR/AR silently falls back to the English string at runtime, which no DOM assertion would catch
     (the element is hooked, populated, and simply wrong). Duplicates are reported too: the later
     entry wins silently, so the earlier one is dead. */
  const blocks = { en: [], fr: [], ar: [] };
  let block = null;
  const dictRegion = dicts.slice(dicts.indexOf('var I18N = {'));
  dictRegion.split(/\r?\n/).forEach(function (line) {
    if (/^\}\s*;/.test(line)) { block = null; return; }
    const marker = /^\s{2,}(en|fr|ar)\s*:\s*\{\s*$/.exec(line);
    if (marker) { block = marker[1]; return; }
    if (!block) return;
    // Several keys can share one line in these blocks, so scan the whole line rather than the
    // first match. Keys are only recognised at the start of a line or straight after { or , which
    // stops a dictionary *value* from ever being mistaken for a key.
    const keyRe = /(?:^|[{,])\s*"([^"]+)"\s*:/g;
    let m;
    while ((m = keyRe.exec(line)) !== null) blocks[block].push(m[1]);
  });
  ['en', 'fr', 'ar'].forEach(function (b) {
    if (!blocks[b].length) issues.push('i18n.js: could not parse the "' + b + '" dictionary block');
  });
  if (blocks.en.length && blocks.fr.length && blocks.ar.length) {
    [['fr', blocks.fr], ['ar', blocks.ar]].forEach(function (pair) {
      const have = {};
      pair[1].forEach(function (k) { have[k] = true; });
      blocks.en.forEach(function (k) {
        if (!have[k]) issues.push('i18n.js: key "' + k + '" exists in the en block but is missing from the ' + pair[0] + ' block');
      });
    });
    ['en', 'fr', 'ar'].forEach(function (b) {
      const seen = {};
      blocks[b].forEach(function (k) {
        if (seen[k]) issues.push('i18n.js: duplicate key "' + k + '" in the ' + b + ' block');
        seen[k] = true;
      });
    });
  }
  const about = read('about.html');
  ['2009', '2013', '2018', '2024'].forEach(function (yr) {
    if (about.indexOf('data-i18n="about.timeline_' + yr + '_text"') === -1) issues.push('about.html: timeline ' + yr + ' text hook missing');
  });
  const closingTagHooks = about.match(/<\/[a-z0-9]+[^>]*\sdata-i18n/gi) || [];
  if (closingTagHooks.length) issues.push('about.html: ' + closingTagHooks.length + ' data-i18n hook(s) sit on a closing tag and are never applied');
  return issues;
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
        // index.html streams two HD hero videos from an external CDN. They are purely decorative
        // (absolutely-positioned, CSS-sized overlays that never affect layout or the assertions
        // below), so they are stubbed out here: leaving them in made networkidle0 wait on
        // third-party streaming that can stall for minutes, flaking the first navigation.
        await page.setRequestInterception(true);
        page.on('request', (req) => {
          if (req.url().indexOf('videos.pexels.com') !== -1) req.abort();
          else req.continue();
        });
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

  // Static scan of the EN source + FR/AR dictionaries: catches retired certification copy and
  // data-i18n hooks parked on closing tags (the DOM sweep only sees those as missing text).
  total++;
  try {
    const staticIssues = staticSourceChecks();
    if (staticIssues.length === 0) passed++;
    else failed.push({ page: 'source scan', lang: '-', vp: '-', issues: staticIssues });
  } catch (e) {
    failed.push({ page: 'source scan', lang: '-', vp: '-', issues: [e.message] });
  }

  console.log(`\n=== SUMMARY ===\nTotal: ${total}, Passed: ${passed}, Failed: ${failed.length}`);
  if (failed.length) failed.forEach(f => console.log(`  FAIL: ${f.page} ${f.lang} ${f.vp} -> ${f.issues.join('; ')}`));
  else console.log('ALL CHECKS PASSED');
}

async function checkPage(vpName, lang) {
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

  // ── Shared chrome: language controls + hamburger ──────────────────────────
  // These hooks live in the common header markup on every page, so the counts are asserted
  // site-wide rather than inside a per-page branch. Non-EN must not still expose English text.
  const chromeAria = {
    'ui.aria_change_language': 2,   // mainbar compact button + drawer compact button
    'ui.aria_language_options': 2,  // the two matching dropdown menus
    'ui.aria_toggle_menu': 1        // hamburger
  };
  Object.keys(chromeAria).forEach(function (k) {
    const n = document.querySelectorAll('[data-i18n-aria-label="' + k + '"]').length;
    if (n !== chromeAria[k]) issues.push('shared aria: expected ' + chromeAria[k] + ' "' + k + '" hooks, got ' + n);
  });
  // The desktop 3-button switcher group exists only on the homepage; every other page relies on
  // the compact button at both breakpoints.
  const switcherHooks = document.querySelectorAll('[data-i18n-aria-label="ui.aria_language_switcher"]').length;
  const wantSwitcher = pageFile === 'index.html' ? 1 : 0;
  if (switcherHooks !== wantSwitcher) issues.push('shared aria: expected ' + wantSwitcher + ' language_switcher hooks, got ' + switcherHooks);
  if (lang !== 'en') {
    // Every aria key must actually change under FR/AR. A key missing from a dictionary block falls
    // back to the English literal still sitting in the markup, so compare against that literal
    // rather than merely checking the attribute is present.
    const ariaEn = {
      'ui.aria_change_language': 'Change language',
      'ui.aria_language_options': 'Language options',
      'ui.aria_toggle_menu': 'Toggle Menu',
      'ui.aria_language_switcher': 'Language switcher'
    };
    Object.keys(ariaEn).forEach(function (k) {
      document.querySelectorAll('[data-i18n-aria-label="' + k + '"]').forEach(function (el) {
        if (el.getAttribute('aria-label') === ariaEn[k]) issues.push('shared aria: ' + k + ' not localised (' + lang + '): still "' + ariaEn[k] + '"');
      });
    });
  }
  if (pageFile !== 'index.html' && pageFile !== 'about.html' && pageFile !== 'services.html' && pageFile !== 'contact.html' && pageFile !== 'projects.html' && pageFile !== 'quality-hse.html') {
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
    // Cert cards: exactly 4, none referencing a withdrawn standard, and no certification claim in
    // any language — ISO 9001 is an in-progress alignment, per quality-hse.html.
    const certGrid = document.getElementById('certs-grid');
    if (!certGrid) issues.push('about: certs-grid missing');
    else {
      const certCards = certGrid.querySelectorAll('.cert-card');
      if (certCards.length !== 4) issues.push('about: expected 4 cert cards, got ' + certCards.length);
      const gridText = certGrid.textContent;
      ['OHSAS', '18001'].forEach(function (dead) {
        if (gridText.indexOf(dead) >= 0) issues.push('about: withdrawn standard "' + dead + '" still rendered in the cert grid');
      });
      const isoSubEl = document.querySelector('[data-i18n="about.cert_iso_sub"]');
      const isoSub = isoSubEl ? isoSubEl.textContent.trim() : '';
      if (!isoSub) issues.push('about: ISO 9001 card sub-text empty');
      ['Certified', 'certifié', 'Certifié', 'معتمدة'].forEach(function (claim) {
        if (isoSub.indexOf(claim) >= 0) issues.push('about: ISO 9001 card still claims certification ("' + isoSub + '")');
      });
      if (lang !== 'en' && isoSub === 'Quality Management System — In Progress') issues.push('about: ISO 9001 card sub not localised (' + isoSub + ')');
      if (!document.querySelector('[data-i18n="about.cert_hse_title"]') || !document.querySelector('[data-i18n="about.cert_hse_sub"]')) issues.push('about: HSE commitment card hooks missing');
    }
    // Timeline hooks must sit on the element itself, otherwise the body text never localises
    // (they sat on the closing tags before this fix, so FR/AR silently fell back to English).
    const tlHooks = document.querySelectorAll('.timeline-item p[data-i18n^="about.timeline_"]');
    if (tlHooks.length !== 4) issues.push('about: expected 4 timeline text hooks on elements, got ' + tlHooks.length);
    const tl2018 = document.querySelector('[data-i18n="about.timeline_2018_text"]');
    if (!tl2018) issues.push('about: timeline_2018_text hook missing');
    else {
      const tl2018Txt = tl2018.textContent.trim();
      if (/certification|certificate/i.test(tl2018Txt)) issues.push('about: timeline still claims certification ("' + tl2018Txt + '")');
      if (lang !== 'en' && tl2018Txt === 'Launched our heavy machinery division and began structuring our quality processes in preparation for ISO 9001 alignment.') issues.push('about: timeline 2018 text not localised (' + tl2018Txt + ')');
    }
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
    // Scoped to the social links: the shared language/hamburger controls are asserted site-wide
    // further up, and counting every aria hook here would conflate the two groups.
    const alEls = document.querySelectorAll('.social-link[data-i18n-aria-label]');
    if (alEls.length !== 4) issues.push('contact: expected 4 social-link aria hooks, got ' + alEls.length);
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
    // Map info panel INITIAL state (rendered, not source): it must never expose the old
    // placeholder copy, and any project name it shows must be one of the real rendered projects.
    const DEMO = ['Algiers Tower', 'Algiers, Algeria', '12k m', 'Detailed architectural engineering'];
    const panelIds = ['panel-category', 'panel-name', 'panel-city', 'panel-year', 'panel-area', 'panel-status', 'panel-desc', 'panel-pct'];
    const realNames = Array.prototype.map.call(cards, function (c) { return c.querySelector('h3').textContent.trim(); });
    panelIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) { issues.push('projects: #' + id + ' missing from the map panel'); return; }
      const v = el.textContent.trim();
      DEMO.forEach(function (d) { if (v.indexOf(d) >= 0) issues.push('projects: map panel #' + id + ' shows placeholder copy "' + v + '"'); });
    });
    const panelNameEl = document.getElementById('panel-name');
    if (panelNameEl) {
      const pnv = panelNameEl.textContent.trim();
      if (pnv && realNames.indexOf(pnv) === -1) issues.push('projects: map panel name "' + pnv + '" is not one of the rendered projects');
      if (lang !== 'en' && pnv === 'Oran Industrial Warehouse') issues.push('projects: map panel name not localised (' + pnv + ')');
    }
  } else if (pageFile === 'quality-hse.html') {
    // Fully translated page (EN source of truth + FR/AR dictionaries in assets/js/i18n.js).
    if (!document.querySelector('title[data-i18n="quality_hse.page_title"]')) issues.push('quality-hse: page_title hook missing');
    const heroTitle = document.querySelector('[data-i18n-html="quality_hse.hero_title"]');
    if (!heroTitle || !heroTitle.querySelector('.text-gold')) issues.push('quality-hse: hero_title missing gold span');
    const qH2 = document.querySelector('[data-i18n-html="quality_hse.q_h2"]');
    if (!qH2 || !qH2.querySelector('.text-gold')) issues.push('quality-hse: q_h2 missing gold span');
    const hseH2 = document.querySelector('[data-i18n-html="quality_hse.hse_h2"]');
    if (!hseH2 || !hseH2.querySelector('.text-gold')) issues.push('quality-hse: hse_h2 missing gold span');
    // The HSE heading must stay wrappable: whitespace-nowrap overflows once FR/AR copy runs longer.
    if (hseH2 && /\bwhitespace-nowrap\b/.test(hseH2.getAttribute('class') || '')) issues.push('quality-hse: hse_h2 still carries whitespace-nowrap');
    const htmlHeads = document.querySelectorAll('[data-i18n-html^="quality_hse."]');
    if (htmlHeads.length !== 3) issues.push('quality-hse: expected 3 data-i18n-html headings, got ' + htmlHeads.length);
    const qCards = document.querySelectorAll('[data-i18n^="quality_hse.qcard"]');
    if (qCards.length !== 14) issues.push('quality-hse: expected 14 quality card hooks, got ' + qCards.length);
    const hseCards = document.querySelectorAll('[data-i18n^="quality_hse.hsecard"]');
    if (hseCards.length !== 12) issues.push('quality-hse: expected 12 HSE card hooks, got ' + hseCards.length);
    const pdfBtns = document.querySelectorAll('[data-i18n="quality_hse.pdf_btn"]');
    if (pdfBtns.length !== 2) issues.push('quality-hse: expected 2 shared PDF button spans, got ' + pdfBtns.length);
    const iframeTitles = document.querySelectorAll('iframe[data-i18n-title^="quality_hse."]');
    if (iframeTitles.length !== 2) issues.push('quality-hse: expected 2 data-i18n-title iframes, got ' + iframeTitles.length);
    ['quality_hse.hero_eyebrow', 'quality_hse.hero_sub', 'quality_hse.hero_breadcrumb',
     'quality_hse.q_pillar', 'quality_hse.q_intro', 'quality_hse.iso_badge', 'quality_hse.iso_h3',
     'quality_hse.iso_body', 'quality_hse.iso_label', 'quality_hse.iso_sublabel',
     'quality_hse.hse_pillar', 'quality_hse.hse_intro', 'quality_hse.closing_quote',
     'quality_hse.closing_attr', 'quality_hse.cta_h3', 'quality_hse.cta_body',
     'quality_hse.cta_btn_contact', 'quality_hse.cta_btn_projects'].forEach(function (k) {
      if (!document.querySelector('[data-i18n="' + k + '"]')) issues.push('quality-hse: ' + k + ' hook missing');
    });
    // A translated page must not silently fall back to the EN source copy once localised.
    const heroSub = document.querySelector('[data-i18n="quality_hse.hero_sub"]');
    if (lang !== 'en' && heroSub && heroSub.textContent.trim().indexOf('Delivering engineering and construction excellence') === 0) issues.push('quality-hse: hero_sub not localised');
    const ctaH3 = document.querySelector('[data-i18n="quality_hse.cta_h3"]');
    if (lang !== 'en' && ctaH3 && ctaH3.textContent.trim() === 'Partner With a Quality & Safety Focused Team') issues.push('quality-hse: cta_h3 not localised');
    const closeQ = document.querySelector('[data-i18n="quality_hse.closing_quote"]');
    if (lang !== 'en' && closeQ && closeQ.textContent.indexOf('This commitment guides every project') >= 0) issues.push('quality-hse: closing_quote not localised');
  } else if (pageFile === 'index.html') {
    // Homepage was the last page wired for FR/AR (EN source of truth + home.*/ui.* in i18n.js).
    // All three data-i18n-html headings carry a gold accent span, so the dictionary values must
    // supply that markup or the accent silently disappears once localised.
    const htmlHeads = document.querySelectorAll('[data-i18n-html]');
    if (htmlHeads.length !== 3) issues.push('index: expected 3 data-i18n-html headings, got ' + htmlHeads.length);
    Array.prototype.forEach.call(htmlHeads, function (h) {
      if (!h.querySelector('.text-gold')) issues.push('index: ' + h.getAttribute('data-i18n-html') + ' missing gold span');
    });
    // The EN guard resolves only the FIRST element per key, so the repeated hooks are counted here.
    const repeated = {
      'services.card_learn_more': 4,
      'home.comp_contact_link': 4,
      'home.proj_card_view_project': 6
    };
    Object.keys(repeated).forEach(function (k) {
      const n = document.querySelectorAll('[data-i18n="' + k + '"]').length;
      if (n !== repeated[k]) issues.push('index: expected ' + repeated[k] + ' "' + k + '" hooks, got ' + n);
    });
    // Project cards: 6 names plus 6 category labels drawn from the shared projects.cat_* keys —
    // the same mapping projects.html uses for its own filter buttons.
    const cardNames = document.querySelectorAll('#projects [data-i18n^="home.proj_name"]');
    if (cardNames.length !== 6) issues.push('index: expected 6 project name hooks, got ' + cardNames.length);
    // Contact form: 4 labels + 4 placeholders. The phone label and the three name/phone/email
    // placeholders reuse the shared contact.* keys, because their EN text is byte-identical to the
    // homepage markup; the rest are homepage-only keys (the homepage copy is deliberately shorter).
    ['home.contact_label_name', 'contact.form_label_phone', 'home.contact_label_email', 'home.contact_label_message'].forEach(function (k) {
      if (!document.querySelector('#contact-form label[data-i18n="' + k + '"]')) issues.push('index: contact label hook missing: ' + k);
    });
    const phHooks = document.querySelectorAll('#contact-form [data-i18n-placeholder]');
    if (phHooks.length !== 4) issues.push('index: expected 4 contact placeholder hooks, got ' + phHooks.length);
    // The submit-state copy is injected by JS, so it never carries a data-i18n hook — assert the
    // resolver can actually reach both keys instead.
    ['home.contact_sending', 'home.contact_sent_success'].forEach(function (k) {
      if (typeof window.i18nText !== 'function' || window.i18nText(k) === null) issues.push('index: window.i18nText cannot resolve ' + k);
    });
    // Contact info rows: the location row was already hooked, and the phone/email titles reuse the
    // shared contact.card_*_title keys because their EN text is byte-identical to contact.html's
    // info cards. The two value spans are deliberately left untranslated (a phone number and an
    // obfuscated email anchor), so no hooks are expected on them.
    ['home.contact_location_label', 'home.contact_location_value', 'contact.card_phone_title', 'contact.card_email_title'].forEach(function (k) {
      if (!document.querySelector('[data-i18n="' + k + '"]')) issues.push('index: contact info row hook missing: ' + k);
    });
    // Representative sample: a localised homepage must not still render the EN source copy.
    if (lang !== 'en') {
      const labelName = document.querySelector('[data-i18n="home.contact_label_name"]');
      if (labelName && labelName.textContent.trim() === 'Name') issues.push('index: contact_label_name not localised');
      const phMsg = document.querySelector('[data-i18n-placeholder="home.contact_ph_message"]');
      if (phMsg && phMsg.getAttribute('placeholder') === 'Tell us about your project...') issues.push('index: contact_ph_message not localised');
      const heroSub = document.getElementById('hero-sub');
      if (heroSub && heroSub.textContent.indexOf('delivers world-class construction solutions') >= 0) issues.push('index: hero.sub not localised');
      const projName1 = document.querySelector('[data-i18n="home.proj_name1"]');
      if (projName1 && projName1.textContent.trim() === 'Downtown Tower Complex') issues.push('index: proj_name1 not localised (' + projName1.textContent.trim() + ')');
      const altEl = document.querySelector('img[data-i18n-alt="home.about_alt_construction"]');
      if (altEl && altEl.getAttribute('alt') === 'Construction') issues.push('index: about_alt_construction not localised');
      const statYears = document.querySelector('[data-i18n="home.stat_years"]');
      if (statYears && statYears.textContent.trim() === 'Years Experience') issues.push('index: stat_years not localised');
      const cardPhone = document.querySelector('[data-i18n="contact.card_phone_title"]');
      if (cardPhone && cardPhone.textContent.trim() === 'Phone Number') issues.push('index: card_phone_title not localised');
      const cardEmail = document.querySelector('[data-i18n="contact.card_email_title"]');
      if (cardEmail && cardEmail.textContent.trim() === 'Email Address') issues.push('index: card_email_title not localised');
      const locVal = document.querySelector('[data-i18n="home.contact_location_value"]');
      if (locVal && locVal.textContent.trim() === '123 Construction Ave, Algiers, Algeria') issues.push('index: contact_location_value not localised');
    }
  }

  // ── EN source-of-truth guard ─────────────────────────────────────────────
  // applyI18n() writes the EN dictionary value into every hooked element, so the text rendered in
  // EN mode *is* the dictionary value. If that diverges from the element's own source markup, a
  // translation pass has silently rewritten the English marketing copy (or a dictionary value was
  // invented to match a bad inventory). Whitespace is ignored; casing is not. There are NO
  // exceptions — every hook on every page is compared. Runs once per page (EN desktop) so each
  // divergence is reported once rather than twice.
  if (lang === 'en' && vpName === 'desktop') {
    const squash = function (s) { return s.replace(/[\s\u00A0]+/g, ''); };
    const hooks = [
      ['data-i18n', 'textContent'],
      ['data-i18n-html', 'textContent'],
      ['data-i18n-title', 'title'],
      ['data-i18n-placeholder', 'placeholder'],
      ['data-i18n-aria-label', 'aria-label'],
      ['data-i18n-alt', 'alt']
    ];
    const rawHtml = await (await fetch(window.location.pathname)).text();
    const srcDoc = new DOMParser().parseFromString(rawHtml, 'text/html');
    hooks.forEach(function (hook) {
      const attr = hook[0], field = hook[1];
      Array.prototype.forEach.call(srcDoc.querySelectorAll('[' + attr + ']'), function (srcEl) {
        const key = srcEl.getAttribute(attr);
        const liveEl = document.querySelector('[' + attr + '="' + key + '"]');
        if (!liveEl) { issues.push('EN guard (' + attr + '): no live element for ' + key); return; }
        const fromSource = field === 'textContent' ? srcEl.textContent : (srcEl.getAttribute(field) || '');
        const fromDict = field === 'textContent' ? liveEl.textContent : (liveEl.getAttribute(field) || '');
        if (squash(fromSource) === squash(fromDict)) return;
        issues.push('EN guard: ' + key + ' dictionary value diverges from source markup ("' +
          fromDict.replace(/\s+/g, ' ').trim() + '" vs source "' + fromSource.replace(/\s+/g, ' ').trim() + '")');
      });
    });
  }
  
  return issues;
}

run().catch(e => { console.error(e); process.exit(1); });