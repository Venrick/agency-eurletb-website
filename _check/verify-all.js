const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');
const execFileSync = require('child_process').execFileSync;

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
  /* Client contact details (sitewide update, own commit): every entry below is either the old
     placeholder or the previous domain, so any survivor in a page or in a dictionary means a spot
     was missed. Checked against the raw source, which the DOM sweep cannot see (e.g. meta tags). */
  const FORBIDDEN_CONTACT = ['123 Construction', '00 00 00 00', '555 123', '555 789', 'etbachouri.com', '__cf_email__', 'cdn-cgi'];
  PAGES.concat(['assets/js/i18n.js']).forEach(function (f) {
    const src = read(f);
    FORBIDDEN_CONTACT.forEach(function (bad) {
      if (src.indexOf(bad) >= 0) issues.push(f + ': forbidden contact string still present: "' + bad + '"');
    });
  });
  return issues;
}

/* ── Every local asset reference must resolve to a real file, with the exact case ──────────
   The DOM sweep above only sees <img> elements at runtime, and only in a page that is already
   loaded. This pass reads all 13 pages as *text* and resolves every local reference they make:
   <img src> and <img data-src>, <script src>, <link href> for icon / apple-touch-icon /
   stylesheet / preload, <source src>, <video src> and <video poster>, the other media tags'
   src, url(...) inside an inline style attribute, url(...) inside a <style> block, and the
   og:image / twitter:image content.
   Existence alone is not enough: Windows matches file names case-insensitively, so a page that
   asks for "assets/Images/Logo-Dark.png" renders fine here and 404s on any case-sensitive host
   (Linux, most CDNs). Every reference is therefore compared case-sensitively and a case mismatch
   is its own failure, naming the file that is really on disk.
   There is NO exceptions list. Absolute URLs (http(s)://, //), data:, mailto:, tel:, javascript:,
   blob:, about: and "#..." fragments are not local paths and are out of scope by definition.
   A reference to a file that exists on disk but is not in the git index is reported as well:
   the worktree serves it, a fresh clone or a deploy from git would 404 it. */
function staticAssetChecks() {
  const issues = [];
  const exact = new Set();      /* relative paths as spelled on disk */
  const byLower = new Map();    /* lower-cased path -> the case-correct one */
  (function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
      if (e.name === '.git' || e.name === 'node_modules') return;
      const abs = path.join(dir, e.name);
      const rel = path.relative(ROOT_DIR, abs).split(path.sep).join('/');
      if (e.isDirectory()) walk(abs);
      else {
        exact.add(rel);
        if (!byLower.has(rel.toLowerCase())) byLower.set(rel.toLowerCase(), rel);
      }
    });
  })(ROOT_DIR);

  /* Index contents, NUL-separated so git never escapes the non-ASCII names
     ("assets/Politique Qualité …pdf"). A missing git is not a failure — the check is skipped. */
  let staged = null;
  try {
    staged = new Set(execFileSync('git', ['ls-files', '-z'], { cwd: ROOT_DIR, maxBuffer: 1 << 26 })
      .toString('utf8').split('\u0000').filter(Boolean));
  } catch (e) { staged = null; }

  const OUT_OF_SCOPE = /^(\/\/|https?:|data:|mailto:|tel:|javascript:|blob:|about:|#)/i;
  const urlRx = function () { return /url\(\s*(['"]?)([^'")]*?)\1\s*\)/gi; };
  const ATTR = function (name, tag) {
    const m = new RegExp('\\b' + name + '\\s*=\\s*("[^"]*"|\'[^\']*\'|[^\\s>]+)', 'i').exec(tag);
    return m ? m[1].replace(/^["']/, '').replace(/["']$/, '') : null;
  };
  const refs = [];

  PAGES.forEach(function (page) {
    const html = fs.readFileSync(path.join(ROOT_DIR, page), 'utf8');
    const nl = [];
    for (let i = 0; i < html.length; i++) if (html.charCodeAt(i) === 10) nl.push(i);
    const lineOf = function (off) {
      let lo = 0, hi = nl.length;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (nl[mid] < off) lo = mid + 1; else hi = mid; }
      return lo + 1;
    };
    const add = function (raw, kind, off) {
      const v = String(raw == null ? '' : raw).trim();
      if (!v || OUT_OF_SCOPE.test(v)) return;
      refs.push({ ref: v, kind: kind, page: page, line: lineOf(off) });
    };

    const TAG_RX = /<(img|script|link|source|video|audio|iframe|embed|track)\b([^>]*)>/gi;
    let m;
    while ((m = TAG_RX.exec(html))) {
      const tag = m[1].toLowerCase(), attrs = m[2];
      const want = [];
      if (tag === 'img') { want.push(['src', 'img src']); want.push(['data-src', 'img data-src']); }
      else if (tag === 'link') {
        const rel = String(ATTR('rel', attrs) || '').toLowerCase();
        if (!/\b(icon|apple-touch-icon|stylesheet|preload)\b/.test(rel)) continue;
        want.push(['href', 'link[' + rel + '] href']);
      } else if (tag === 'video') { want.push(['src', 'video src']); want.push(['poster', 'video poster']); }
      else { want.push(['src', tag + ' src']); }
      want.forEach(function (w) {
        const val = ATTR(w[0], attrs);
        if (val !== null) add(val, w[1], m.index);
      });
    }
    const STYLE_ATTR_RX = /\bstyle\s*=\s*("[^"]*"|'[^']*')/gi;
    while ((m = STYLE_ATTR_RX.exec(html))) {
      const val = m[1].slice(1, -1), rx = urlRx();
      let u;
      while ((u = rx.exec(val))) add(u[2], 'inline style url()', m.index + u.index);
    }
    const STYLE_BLK_RX = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    while ((m = STYLE_BLK_RX.exec(html))) {
      const rx = urlRx();
      let u;
      while ((u = rx.exec(m[1]))) add(u[2], 'stylesheet url()', m.index + u.index);
    }
    const META_RX = /<meta\b[^>]*>/gi;
    while ((m = META_RX.exec(html))) {
      const key = String(ATTR('property', m[0]) || ATTR('name', m[0]) || '').toLowerCase();
      if (key !== 'og:image' && key !== 'twitter:image') continue;
      const val = ATTR('content', m[0]);
      if (val !== null) add(val, 'meta ' + key, m.index);
    }
  });

  refs.forEach(function (r) {
    const clean = r.ref.split('#')[0].split('?')[0];
    if (!clean) return;
    let rel;
    try { rel = decodeURIComponent(clean); } catch (e) { rel = clean; }
    rel = rel.charAt(0) === '/' ? rel.slice(1)
      : path.posix.normalize(path.posix.join(path.posix.dirname(r.page), rel));
    if (exact.has(rel)) r.real = rel;
    else if (byLower.has(rel.toLowerCase())) { r.problem = 'WRONG CASE'; r.real = byLower.get(rel.toLowerCase()); }
    else r.problem = 'MISSING';
    if (!r.problem && staged && !staged.has(rel)) r.problem = 'NOT IN THE GIT INDEX (a fresh clone or a deploy from git would 404 it)';
  });

  /* One entry per (problem, path), so a file several pages ask for is reported once. */
  const group = new Map();
  refs.forEach(function (r) {
    if (!r.problem) return;
    const key = r.problem + ' ' + r.ref;
    if (!group.has(key)) group.set(key, { problem: r.problem, ref: r.ref, real: r.real, where: [] });
    const g = group.get(key);
    if (g.where.length < 4) g.where.push(r.page + ':' + r.line + ' (' + r.kind + ')');
  });
  group.forEach(function (g) {
    issues.push('asset reference ' + g.ref + ': ' + g.problem +
      (g.real && g.real !== g.ref ? ' — the file on disk is "' + g.real + '"' : '') +
      '; referenced by ' + g.where.join(', '));
  });
  return issues;
}

/* ── Header/nav layout sweep ──────────────────────────────────────────────────────────
   Between the mobile breakpoint (768) and the full desktop header the nav is squeezed, and the
   bands that keep it on a single row are hand-tuned in each page's CSS. The suite therefore pins
   the widths that straddle those bands: 800 and 900 (inside the tightened 769..920 band), 1024
   (mid band), 1140 (the width at which the FR row still wrapped before the band was extended),
   1199 (the last width of the tightened band) and 1210 (the first width that uses the default
   spacing), on the three pages that carry the canonical header, in all three languages, because
   the nav labels are translated and FR is the widest of the three. At 768 the same page is then
   probed the way a visitor uses it: hamburger visible, desktop nav hidden, one real click opens
   the drawer, a second one closes it. */
const HEADER_PAGES = ['index.html', 'about.html', 'contact.html'];
const HEADER_WIDTHS = [800, 900, 1024, 1140, 1199, 1210];

/* Runs inside the page; every value is read from the live layout, nothing is assumed. */
function headerMetrics() {
  const out = {};
  const mb = document.getElementById('mainbar');
  const mbRect = mb.getBoundingClientRect();
  out.overflowDoc = document.documentElement.scrollWidth - window.innerWidth;
  out.overflowBody = document.body.scrollWidth - window.innerWidth;
  /* The header shells (logo / nav / switcher) share the 110px bar: one that grows, or that stops
     being vertically centred, means the row wrapped or an item was pushed onto a second line. */
  const shell = Array.prototype.slice.call(mb.children).filter(k => k.getBoundingClientRect().width > 0);
  out.shellHeights = shell.map(k => +k.getBoundingClientRect().height.toFixed(1));
  out.shellSpreads = shell.map(k => {
    const r = k.getBoundingClientRect();
    return +Math.abs((r.top + r.height / 2) - (mbRect.top + mbRect.height / 2)).toFixed(1);
  });
  const logoImgs = Array.prototype.slice.call(mb.querySelectorAll('a img'));
  const vis = logoImgs.filter(i => getComputedStyle(i).display !== 'none' && i.getBoundingClientRect().width > 0);
  out.logoVisible = vis.length;
  if (vis.length === 1) {
    const i = vis[0], r = i.getBoundingClientRect();
    /* Squeeze = how much narrower the logo is than its own aspect ratio allows, i.e. how hard
       flex is compressing it. */
    out.logoSqueeze = +((r.height * (i.naturalWidth / i.naturalHeight)) - r.width).toFixed(1);
    out.logoH = +r.height.toFixed(1);
  }
  const nav = document.querySelector('#mainbar .nav-desktop');
  const links = Array.prototype.slice.call(document.querySelectorAll('#mainbar .nav-desktop > li > a'));
  const lis = Array.prototype.slice.call(document.querySelectorAll('#mainbar .nav-desktop > li'));
  out.navDisplay = nav ? getComputedStyle(nav).display : null;
  out.navScrollOverflow = nav ? (nav.scrollWidth - nav.clientWidth) : null;
  out.linkCount = links.length;
  const hs = links.map(a => a.getBoundingClientRect().height);
  out.linkH = hs.length ? [+Math.min.apply(null, hs).toFixed(1), +Math.max.apply(null, hs).toFixed(1)] : [];
  out.linksWrapped = hs.length ? (Math.max.apply(null, hs) - Math.min.apply(null, hs) > 3) : null;
  out.navRows = new Set(lis.map(li => Math.round(li.getBoundingClientRect().top))).size;
  const swBtn = document.querySelector('#mainbar .lang-btn');
  const sw = swBtn && swBtn.closest('div');
  const ham = document.getElementById('hamburger');
  const drawer = document.getElementById('nav-drawer');
  const compact = mb.querySelector('.lang-compact');
  out.swDisplay = sw ? getComputedStyle(sw).display : null;
  out.hamDisplay = ham ? getComputedStyle(ham).display : null;
  out.drawerDisplay = drawer ? getComputedStyle(drawer).display : null;
  out.compactDisplay = compact ? getComputedStyle(compact).display : null;
  /* Overlap is measured as a real gap between boxes (max of the two left edges minus min of the
     two right edges) instead of a subtraction, which would flip sign under RTL. */
  const gap = (a, b) => +Math.max(a.l, b.l) - Math.min(a.r, b.r);
  const rect = el => { const r = el.getBoundingClientRect(); return { l: +r.left.toFixed(1), r: +r.right.toFixed(1) }; };
  out.gapLogoNav = (vis.length === 1 && nav) ? +gap(rect(vis[0].closest('a')), rect(nav)).toFixed(1) : null;
  out.gapNavSwitch = (nav && sw) ? +gap(rect(nav), rect(sw)).toFixed(1) : null;
  return out;
}

/* Verdict for one measured width. The thresholds describe the layout, not the fix: at most 1px of
   horizontal overflow (sub-pixel rounding), exactly one visible logo at its natural 72px height
   and unsqueezed, a flex nav that is one row of seven unwrapped links, no hamburger / drawer /
   compact switcher, and no negative gap between logo, nav and switcher. */
function headerIssues(w, m) {
  const bad = [];
  const push = s => bad.push(w + 'px: ' + s);
  if (m.overflowDoc > 1 || m.overflowBody > 1) push('horizontal overflow (document +' + m.overflowDoc + 'px, body +' + m.overflowBody + 'px)');
  if (m.logoVisible !== 1) push(m.logoVisible + ' logo images visible, expected exactly 1');
  if (m.logoSqueeze > 1) push('logo squeezed by ' + m.logoSqueeze + 'px');
  if (m.logoH !== 72) push('logo is ' + m.logoH + 'px tall, expected 72px');
  if (m.navDisplay !== 'flex') push('desktop nav display is ' + m.navDisplay);
  if (m.navScrollOverflow > 1) push('nav overflows its own box by ' + m.navScrollOverflow + 'px');
  if (m.navRows !== 1) push('nav links sit on ' + m.navRows + ' rows');
  if (m.linkCount !== 7) push(m.linkCount + ' nav links, expected 7');
  if (m.linksWrapped) push('nav links wrapped (heights ' + JSON.stringify(m.linkH) + ')');
  if (m.hamDisplay !== 'none') push('hamburger visible (' + m.hamDisplay + ')');
  if (m.drawerDisplay !== 'none') push('drawer visible (' + m.drawerDisplay + ')');
  if (m.swDisplay !== 'flex') push('language switcher display is ' + m.swDisplay);
  if (m.compactDisplay !== 'none') push('compact switcher visible (' + m.compactDisplay + ')');
  if (m.gapLogoNav !== null && m.gapLogoNav < 0) push('logo and nav overlap by ' + (-m.gapLogoNav) + 'px');
  if (m.gapNavSwitch !== null && m.gapNavSwitch < 0) push('nav and language switcher overlap by ' + (-m.gapNavSwitch) + 'px');
  m.shellHeights.forEach((h, i) => { if (h > 104) push('header item ' + i + ' is ' + h + 'px tall (the bar content box is 107px)'); });
  m.shellSpreads.forEach((sp, i) => { if (sp > 6) push('header item ' + i + ' is ' + sp + 'px off the bar centre'); });
  return bad;
}

/* One (page, lang) case: load once, re-measure at every pinned width, then probe the 768 band. */
async function headerSweepCase(browser, pFile, lang) {
  const issues = [];
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (u.indexOf('videos.pexels.com') !== -1 || /\.(mp4|webm)(\?|$)/i.test(u)) req.abort(); else req.continue();
  });
  try {
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL + pFile + '?lang=' + lang, { waitUntil: 'networkidle0', timeout: 40000 });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 400));
    for (const w of HEADER_WIDTHS) {
      await page.setViewport({ width: w, height: 900 });
      await new Promise(r => setTimeout(r, 120));
      const m = await page.evaluate(headerMetrics);
      headerIssues(w, m).forEach(s => issues.push(s));
    }
    /* Mobile band (768 = the widest mobile width): the same page must fall back to the drawer.
       The hamburger listener is attached at the end of each page's main script, i.e. after the
       GSAP/ScrollTrigger CDNs, so a click sent before that is simply lost; wait for readiness and
       then click, with one retry so a slow CDN is not reported as a broken drawer. */
    await page.setViewport({ width: 768, height: 900 });
    await page.waitForFunction(() => document.readyState === 'complete' &&
      typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined', { timeout: 15000 })
      .catch(() => {});
    await new Promise(r => setTimeout(r, 400));
    const snap = () => page.evaluate(() => {
      const dr = document.getElementById('nav-drawer'), ham = document.getElementById('hamburger');
      const nav = document.querySelector('#mainbar .nav-desktop');
      return {
        hamDisplay: getComputedStyle(ham).display,
        navDisplay: getComputedStyle(nav).display,
        drawerOpen: dr.classList.contains('open'),
        drawerH: +dr.getBoundingClientRect().height.toFixed(1),
        visibleLinks: Array.prototype.filter.call(dr.querySelectorAll('a'), a => a.getBoundingClientRect().height > 0).length
      };
    });
    const closed = await snap();
    if (closed.hamDisplay !== 'flex') issues.push('768px: hamburger display is ' + closed.hamDisplay);
    if (closed.navDisplay !== 'none') issues.push('768px: desktop nav still visible (' + closed.navDisplay + ')');
    if (closed.drawerOpen || closed.drawerH !== 0) issues.push('768px: drawer already open before any click (' + JSON.stringify(closed) + ')');
    let opened = null;
    for (let i = 0; i < 2; i++) {
      await page.click('#hamburger');
      await new Promise(r => setTimeout(r, 600));
      opened = await snap();
      if (opened.drawerOpen && opened.drawerH > 0) break;
    }
    if (!opened.drawerOpen || opened.drawerH === 0) issues.push('768px: a click on the hamburger did not open the drawer (' + JSON.stringify(opened) + ')');
    else if (opened.visibleLinks !== 7) issues.push('768px: the open drawer shows ' + opened.visibleLinks + ' links, expected 7');
    await page.click('#hamburger');
    await new Promise(r => setTimeout(r, 600));
    const reclosed = await snap();
    if (reclosed.drawerOpen || reclosed.drawerH !== 0) issues.push('768px: a second click did not close the drawer (' + JSON.stringify(reclosed) + ')');
  } catch (e) {
    issues.push(e.message);
  }
  await page.close();
  return issues;
}

/* ── Guard: page links created by script ──────────────────────────────────────────────
   The ?lang= rewriter walks document.querySelectorAll('a[href]') inside applyI18n, so it covers
   every anchor that is in the DOM when it runs - including anchors inside containers that are
   hidden and filled later (the project modal, the nav drawer) - and it runs again on every
   language switch. It cannot cover an anchor that a page script creates while that switch is
   running, because projects.html rebuilds its cards from a MutationObserver on <html lang>, which
   fires after applyI18n has already returned. Nothing does that today: the project cards are built
   by script but contain no anchor (the card div itself is clickable), and the only anchors a page
   script creates are Leaflet's attribution links, which spell out absolute https:// URLs and must
   stay untouched. This scan keeps it that way: every inline <script> on every page is scanned for
   an internal .html link that exists only in script - a template literal / innerHTML string,
   setAttribute('href', ...), or an .href assignment - because such a link would silently lose
   ?lang= instead of following the visitor to the next page. Build it with
   window.i18nLinkHref(href, lang) instead, or put it in the markup. */
function dynamicPageLinkScan() {
  const issues = [];
  const patterns = [
    { rx: /<a\s[^>]*href\s*=\s*(["'])(?!#|https?:|mailto:|tel:|\/\/|javascript:)([^"']*\.html[^"']*)\1/gi, what: 'an <a href="..."> string for an internal page' },
    { rx: /setAttribute\(\s*["']href["'][^)]*\.html/gi, what: "setAttribute('href', ...) with an internal page URL" },
    { rx: /\.href\s*=\s*["'][^"']*\.html[^"']*["']/gi, what: '.href = "page.html"' }
  ];
  const SCRIPT_RX = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  PAGES.forEach(function (file) {
    const html = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
    let m;
    while ((m = SCRIPT_RX.exec(html))) {
      if (/\bsrc\s*=/.test(m[1])) continue;   /* an external <script src>, not our code */
      const startLine = html.slice(0, m.index).split('\n').length;
      patterns.forEach(function (p) {
        p.rx.lastIndex = 0;
        let hit;
        while ((hit = p.rx.exec(m[2]))) {
          const line = startLine + m[2].slice(0, hit.index).split('\n').length - 1;
          issues.push(file + ':' + line + ': a script builds ' + p.what + ' ("' +
            hit[0].replace(/\s+/g, ' ').slice(0, 70) + '"), which cannot carry the ?lang= the rest of ' +
            'the site uses — build it with window.i18nLinkHref(href, lang) or put it in the markup');
        }
      });
    }
  });
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
          // applyI18n sets lang/dir immediately after it rewrites the internal links, so waiting
          // for both (dir is not in the source markup) also means the hrefs below are final.
          await page.waitForFunction((l) => document.documentElement.getAttribute('lang') === l && document.documentElement.getAttribute('dir') !== null, { timeout: 5000 }, lang);
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

  /* ── The right nav / drawer / footer link is still highlighted in AR ─────────────────── */
  const ACTIVE_CASES = [
    { file: 'about.html', active: 'about.html' },
    { file: 'services.html', active: 'services.html' },
    { file: 'service-industrial-works.html', active: 'services.html' }
  ];
  for (const c of ACTIVE_CASES) {
    total++;
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(BASE_URL + c.file + '?lang=ar', { waitUntil: 'networkidle0', timeout: 30000 });
      const r = await page.evaluate(function () {
        const q = function (s) { return Array.prototype.map.call(document.querySelectorAll(s), function (a) { return a.getAttribute('href'); }); };
        return {
          nav: q('#mainbar a.nav-link.active'),
          drawer: q('#nav-drawer a.active'),
          footer: Array.prototype.filter.call(document.querySelectorAll('a.fnav-link'), function (a) { return a.classList.contains('text-gold'); }).map(function (a) { return a.getAttribute('href'); })
        };
      });
      const bare = function (h) { return String(h).split('#')[0].split('?')[0]; };
      const issues = [];
      const want = bare(c.active);
      if (!r.nav.map(bare).includes(want)) issues.push('nav: no active nav-link for ' + c.active + ' in AR (active links: ' + JSON.stringify(r.nav) + ')');
      if (!r.drawer.map(bare).includes(want)) issues.push('drawer: no active drawer link for ' + c.active + ' in AR (active links: ' + JSON.stringify(r.drawer) + ')');
      if (r.footer.length !== 1 || bare(r.footer[0]) !== want) issues.push('footer: expected exactly the ' + c.active + ' link highlighted in AR, got ' + JSON.stringify(r.footer));
      const noLang = r.nav.concat(r.drawer, r.footer).filter(function (h) { return !/[?&]lang=ar/.test(h); });
      if (noLang.length) issues.push('highlighted link(s) without ?lang=ar: ' + JSON.stringify(noLang));
      if (issues.length) failed.push({ page: 'lang-in-url: active state', lang: 'ar', vp: 'desktop', issues: issues.map(function (i) { return c.file + ': ' + i; }) });
      else passed++;
      await page.close();
    } catch (e) { failed.push({ page: 'lang-in-url: active state', lang: 'ar', vp: 'desktop', issues: [c.file + ': ' + e.message] }); }
  }

  /* ── index.html#companies reached from another page still scrolls to the section ─────── */
  total++;
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', function (r) { if (/\.(mp4|webm|m3u8)(\?|$)/i.test(r.url())) r.abort(); else r.continue(); });
    await page.setViewport({ width: 1440, height: 900 });
    const issues = [];
    await page.goto(BASE_URL + 'about.html?lang=ar', { waitUntil: 'networkidle0', timeout: 30000 });
    const href = await page.evaluate(function () {
      const a = Array.prototype.find.call(document.querySelectorAll('#mainbar a[href]'), function (el) {
        const h = el.getAttribute('href');
        return h.split('#')[0].split('?')[0] === 'index.html' && h.indexOf('#') >= 0;
      });
      return a ? a.getAttribute('href') : null;
    });
    if (href !== 'index.html?lang=ar#companies') issues.push('the Companies nav link on about.html is "' + href + '", expected "index.html?lang=ar#companies" (query before the hash, language kept)');
    if (href) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
        page.evaluate(function () {
          Array.prototype.find.call(document.querySelectorAll('#mainbar a[href]'), function (el) {
            const h = el.getAttribute('href');
            return h.split('#')[0].split('?')[0] === 'index.html' && h.indexOf('#') >= 0;
          }).click();
        })
      ]);
      await new Promise(function (r) { setTimeout(r, 1500); });
      const st = await page.evaluate(function () {
        const sec = document.getElementById('companies');
        return {
          hash: window.location.hash,
          search: window.location.search,
          lang: document.documentElement.getAttribute('lang'),
          top: sec ? sec.getBoundingClientRect().top : null,
          scrollY: window.scrollY
        };
      });
      if (st.hash !== '#companies') issues.push('after following the link the hash is "' + st.hash + '"');
      if (!/[?&]lang=ar/.test(st.search)) issues.push('the ?lang=ar parameter was dropped by the hash navigation (search="' + st.search + '")');
      if (st.lang !== 'ar') issues.push('index.html arrived in "' + st.lang + '" instead of ar');
      if (st.top === null) issues.push('#companies is missing on index.html');
      else if (Math.abs(st.top) > 300) issues.push('#companies is not in view after following the link (top=' + st.top.toFixed(0) + 'px, scrollY=' + st.scrollY.toFixed(0) + ')');
    }
    if (issues.length) failed.push({ page: 'lang-in-url: hash target', lang: 'ar', vp: 'desktop', issues: issues });
    else passed++;
    await page.close();
  } catch (e) { failed.push({ page: 'lang-in-url: hash target', lang: 'ar', vp: 'desktop', issues: [e.message] }); }

  /* ── The URL-language rewriter: query merging, hash placement, untouched links ─────────
     window.i18nLinkHref is the same function the load/switch pass runs over every link. */
  total++;
  try {
    const page = await browser.newPage();
    await page.goto(BASE_URL + 'about.html?lang=ar', { waitUntil: 'networkidle0', timeout: 30000 });
    const issues = await page.evaluate(function () {
      const out = [];
      const f = window.i18nLinkHref;
      if (typeof f !== 'function') return ['window.i18nLinkHref is missing: the URL-language rewriter is not wired into i18n.js'];
      [
        ['index.html', 'ar', 'index.html?lang=ar'],
        ['index.html#companies', 'ar', 'index.html?lang=ar#companies'],
        ['about.html?x=1#top', 'ar', 'about.html?x=1&lang=ar#top'],
        ['about.html?lang=fr#top', 'ar', 'about.html?lang=ar#top'],
        ['contact.html?company=etb', 'ar', 'contact.html?company=etb&lang=ar'],
        ['about.html?lang=fr', 'en', 'about.html'],
        ['index.html?lang=ar', 'en', 'index.html'],
        ['#top', 'ar', null],
        ['#', 'ar', null],
        ['mailto:contact@eurlachouri.com', 'ar', null],
        ['tel:+21327567788', 'ar', null],
        ['javascript:void(0)', 'ar', null],
        ['https://example.com/page.html', 'ar', null],
        ['assets/js/i18n.js', 'ar', null],
        ['assets/images/Logo-Dark.png', 'ar', null]
      ].forEach(function (c) {
        const got = f(c[0], c[1]);
        if (got !== c[2]) out.push('rewrite(' + c[0] + ', ' + c[1] + ') gave ' + JSON.stringify(got) + ', expected ' + JSON.stringify(c[2]));
      });
      return out;
    });
    if (issues.length) failed.push({ page: 'lang-in-url: rewriter', lang: '-', vp: '-', issues: issues });
    else passed++;
    await page.close();
  } catch (e) { failed.push({ page: 'lang-in-url: rewriter', lang: '-', vp: '-', issues: [e.message] }); }

  /* ── AR follows index -> about -> projects -> service page with storage disabled ──────
     Every link was rewritten on the page before, so the language must still be AR (and dir
     rtl) after each hop even when localStorage throws on every call. */
  total++;
  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(function () {
      const boom = function () { throw new Error('localStorage disabled for this test'); };
      try {
        Storage.prototype.getItem = boom;
        Storage.prototype.setItem = boom;
        Storage.prototype.removeItem = boom;
      } catch (e) {}
    });
    await page.setRequestInterception(true);
    page.on('request', function (r) { if (/\.(mp4|webm|m3u8)(\?|$)/i.test(r.url())) r.abort(); else r.continue(); });
    await page.setViewport({ width: 1440, height: 900 });
    const issues = [];
    const hops = [['index.html', 'about.html'], ['about.html', 'projects.html'], ['projects.html', 'service-industrial-works.html']];
    await page.goto(BASE_URL + 'index.html?lang=ar', { waitUntil: 'networkidle0', timeout: 30000 });
    for (const hop of hops) {
      const from = hop[0], to = hop[1];
      const dead = await page.evaluate(function () { try { localStorage.getItem('site-lang'); return false; } catch (e) { return true; } });
      if (!dead) issues.push('probe: localStorage did not throw on ' + from + ', so this test is not proving what it claims');
      const href = await page.evaluate(function (t) {
        const a = Array.prototype.find.call(document.querySelectorAll('a[href]'), function (el) {
          const h = el.getAttribute('href');
          return h.split('#')[0].split('?')[0] === t;
        });
        return a ? a.getAttribute('href') : null;
      }, to);
      if (!href) { issues.push('no link to ' + to + ' on ' + from); break; }
      if (!/[?&]lang=ar/.test(href)) issues.push('the link to ' + to + ' on ' + from + ' does not carry ?lang=ar -> ' + href);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
        page.evaluate(function (t) {
          Array.prototype.find.call(document.querySelectorAll('a[href]'), function (el) {
            const h = el.getAttribute('href');
            return h.split('#')[0].split('?')[0] === t;
          }).click();
        }, to)
      ]);
      const st = await page.evaluate(function () {
        return {
          lang: document.documentElement.getAttribute('lang'),
          dir: document.documentElement.getAttribute('dir'),
          file: window.location.pathname.split('/').pop(),
          search: window.location.search
        };
      });
      if (st.file !== to) issues.push('expected to land on ' + to + ', landed on ' + st.file);
      if (st.lang !== 'ar') issues.push('language lost with storage disabled: ' + from + ' -> ' + to + ' ended up in "' + st.lang + '"');
      if (st.dir !== 'rtl') issues.push('direction lost with storage disabled: ' + from + ' -> ' + to + ' ended up dir="' + st.dir + '"');
      if (!/[?&]lang=ar/.test(st.search)) issues.push('address bar lost the language on ' + st.file + ' ("' + st.search + '")');
    }
    if (issues.length) failed.push({ page: 'lang-in-url: crawl (storage disabled)', lang: 'ar', vp: 'desktop', issues: issues });
    else passed++;

    await page.close();
  } catch (e) { failed.push({ page: 'lang-in-url: crawl (storage disabled)', lang: 'ar', vp: 'desktop', issues: [e.message] }); }

  /* ── Header/nav layout sweep: the desktop nav on one row, with no overlap, 769..1100 ─────────
     One case per (page, language) - see HEADER_PAGES / HEADER_WIDTHS above for why those four
     widths and why FR/AR matter. Each case also probes the 768 band. */
  for (const hPage of HEADER_PAGES) {
    for (const hLang of LANGS) {
      total++;
      const where = 'header sweep ' + hPage + ' @ ' + HEADER_WIDTHS.join('/') + 'px + 768px';
      try {
        const issues = await headerSweepCase(browser, hPage, hLang);
        if (issues.length === 0) passed++;
        else failed.push({ page: where, lang: hLang, vp: '-', issues: issues });
      } catch (e) {
        failed.push({ page: where, lang: hLang, vp: '-', issues: [e.message] });
      }
    }
  }


  /* ── The language survives every link, including the ones a page script creates ──────────────
     projects.html is the only page whose content is built by script: the cards (which contain no
     anchor - the card itself is the click target), the map control (Leaflet builds its attribution
     anchors from absolute https:// URLs, which must stay untouched) and the modal (hidden, filled
     by script, and the home of the one internal link no visitor sees before clicking a card). The
     rewriter runs over the whole document inside applyI18n, so a switch has to reach all of them -
     including a link that was added to the DOM after load. */
  total++;
  try {
    const issues = [];
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      if (u.indexOf('videos.pexels.com') !== -1 || /\.(mp4|webm)(\?|$)/i.test(u)) req.abort(); else req.continue();
    });
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL + 'projects.html?lang=ar', { waitUntil: 'networkidle0', timeout: 40000 });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 600));   /* the cards and the map are built after load */

    const counts = await page.evaluate(() => ({
      cards: document.querySelectorAll('#project-grid .project-card').length,
      data: typeof projectData !== 'undefined' ? Object.keys(projectData).length : -1
    }));
    if (counts.cards < 1 || (counts.data > 0 && counts.cards !== counts.data)) {
      issues.push('projects.html shows ' + counts.cards + ' project cards for ' + counts.data + ' entries in projectData');
    }

    await page.evaluate(() => { const c = document.querySelector('#project-grid .project-card'); if (c) c.click(); });
    await new Promise(r => setTimeout(r, 400));
    const modalCta = () => page.evaluate(() => {
      const a = document.querySelector('#modal-box a[href]');
      return a ? a.getAttribute('href') : null;
    });
    const arHref = await modalCta();
    if (arHref !== 'contact.html?lang=ar') issues.push('the modal CTA reads "' + arHref + '" on load in AR, expected "contact.html?lang=ar" (the modal is hidden and filled by script, but its link is in the markup and must be rewritten)');


    /* A link added to the DOM after load must be picked up by the next switch as well: this stands
       in for a script-built anchor and pins the scope of the rewriter. */
    await page.evaluate(() => {
      const mk = (id, href) => { const a = document.createElement('a'); a.id = id; a.setAttribute('href', href); a.textContent = 'probe'; document.body.appendChild(a); };
      mk('sweep-probe-internal', 'contact.html#form');
      mk('sweep-probe-external', 'https://example.com/other.html');
    });
    const switched = await page.evaluate(() => {
      const btn = document.querySelector('.lang-btn[data-lang="fr"]');
      if (!btn) return false;
      btn.click();
      return true;
    });
    if (!switched) issues.push('the header has no .lang-btn[data-lang="fr"], so the switch could not be exercised');
    await new Promise(r => setTimeout(r, 700));

    const frHref = await modalCta();
    if (frHref !== 'contact.html?lang=fr') issues.push('after the switch to FR the modal CTA reads "' + frHref + '", expected "contact.html?lang=fr"');
    const probes = await page.evaluate(() => {
      const g = id => { const el = document.getElementById(id); return el ? el.getAttribute('href') : '(missing)'; };
      return { internal: g('sweep-probe-internal'), external: g('sweep-probe-external') };
    });
    if (probes.internal !== 'contact.html?lang=fr#form') issues.push('a link added after load kept "' + probes.internal + '" through the switch to FR, expected "contact.html?lang=fr#form" (the language goes before the #hash)');
    if (probes.external !== 'https://example.com/other.html') issues.push('the rewriter touched an external link: "' + probes.external + '"');

    /* Only the two probes are exempt: every other internal link on the page - nav, drawer, footer,
       the card CTAs and the modal - must have followed the switch. */
    const stray = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll('a[href]').forEach(a => {
        if (a.id.indexOf('sweep-probe') === 0) return;
        const raw = a.getAttribute('href');
        const bare = raw.split('#')[0].split('?')[0];
        if (raw.charAt(0) === '#' || raw.indexOf(':') >= 0 || raw.indexOf('//') === 0 || !/\.html$/i.test(bare)) return;
        const got = /(?:[?&])lang=([^&#]*)/.exec(raw);
        if (!got || got[1] !== 'fr') bad.push(raw + (got ? ' (lang=' + got[1] + ')' : ' (no lang)'));
      });
      return bad;
    });
    stray.forEach(s => issues.push('internal link left in AR after the switch to FR: ' + s));

    await page.close();
    if (issues.length === 0) passed++;
    else failed.push({ page: 'script-built and hidden links', lang: 'ar -> fr', vp: 'desktop', issues: issues });
  } catch (e) {
    failed.push({ page: 'script-built and hidden links', lang: 'ar -> fr', vp: 'desktop', issues: [e.message] });
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

  // Static scan of every local asset reference on all 13 pages (see staticAssetChecks): each one
  // must resolve to a file that exists on disk with exactly the case the page spells out.
  total++;
  try {
    const assetIssues = staticAssetChecks();
    if (assetIssues.length === 0) passed++;
    else failed.push({ page: 'asset refs scan', lang: '-', vp: '-', issues: assetIssues });
  } catch (e) {
    failed.push({ page: 'asset refs scan', lang: '-', vp: '-', issues: [e.message] });
  }
  // Static scan of the inline scripts of all 13 pages (see dynamicPageLinkScan): a script that
  // spells out an internal .html link would silently drop ?lang= on the next language switch.
  total++;
  try {
    const linkIssues = dynamicPageLinkScan();
    if (linkIssues.length === 0) passed++;
    else failed.push({ page: 'script-built links scan', lang: '-', vp: '-', issues: linkIssues });
  } catch (e) {
    failed.push({ page: 'script-built links scan', lang: '-', vp: '-', issues: [e.message] });
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

  /* ── Phone numbers must stay LTR inside an RTL (Arabic) page ─────────────────
     A phone number is a run of weak characters, so in an RTL paragraph bidi
     re-orders the digit groups and a " / " pair can end up reading right-to-left.
     Every element that owns a phone number as its *own* text must therefore sit
     inside a dir="ltr" wrapper, whose shared .phone-ltr rule isolates the run. */
  const PHONE_RX = /0\d{2}(\s\d{2}){3}/;
  const phoneHolders = [];
  document.querySelectorAll('body *').forEach(function (el) {
    const ownsPhone = Array.prototype.some.call(el.childNodes, function (n) {
      return n.nodeType === 3 && PHONE_RX.test(n.nodeValue);
    });
    if (ownsPhone) phoneHolders.push(el);
  });
  const phoneFile = window.location.pathname.split('/').pop() || 'index.html';
  const phoneExpected = (phoneFile === 'index.html' || phoneFile === 'contact.html') ? 5 : 3;
  if (phoneHolders.length !== phoneExpected) {
    issues.push('phone numbers in DOM: ' + phoneHolders.length + ', expected ' + phoneExpected);
  }
  phoneHolders.forEach(function (el) {
    const label = '<' + el.tagName.toLowerCase() + '> "' + el.textContent.trim().slice(0, 30) + '"';
    const wrapper = el.closest('[dir="ltr"]');
    if (!wrapper) issues.push('phone not inside a dir="ltr" wrapper: ' + label);
    else if (!wrapper.classList.contains('phone-ltr')) issues.push('phone wrapper missing the .phone-ltr class: ' + label);
    const dir = window.getComputedStyle(el).direction;
    if (dir !== 'ltr') issues.push('phone renders direction:' + dir + ' (expected ltr): ' + label);
  });
  /* Layout probe: one isolated " / " pair inside a forced RTL container must still
     read left-to-right. Without the isolate the two runs swap and the first
     number lands to the right of the second. */
  const probe = document.createElement('div');
  probe.setAttribute('dir', 'rtl');
  probe.setAttribute('style', 'position:absolute; left:-9999px; top:0; white-space:nowrap; font-size:13px');
  probe.innerHTML = '<span class="phone-ltr" dir="ltr"><span class="p1">027 56 77 88</span> / <span class="p2">027 56 77 77</span></span>';
  document.body.appendChild(probe);
  const p1 = probe.querySelector('.p1').getBoundingClientRect();
  const p2 = probe.querySelector('.p2').getBoundingClientRect();
  if (!(p1.left < p2.left)) {
    issues.push('RTL " / " pair reordered: 027 56 77 88 at x=' + p1.left.toFixed(1) + ', 027 56 77 77 at x=' + p2.left.toFixed(1));
  }
  probe.parentNode.removeChild(probe);

  /* ── Language carried in the URL ────────────────────────────────────────────
     A language picked on one page has to follow the visitor to the next one, so every
     internal page link must carry the active language in its query string and EN must carry
     none. Links that leave the site, mailto:/tel:/javascript: links, "#"-only links and
     non-.html assets must stay untouched. The rule mirrors the rewriter in i18n.js. */
  Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (a) {
    const raw  = a.getAttribute('href');
    const bare = raw.split('#')[0].split('?')[0];
    const isPage = raw.charAt(0) !== '#' && raw.indexOf(':') < 0 && raw.indexOf('//') !== 0 && /\.html$/i.test(bare);
    const got  = /(?:[?&])lang=([^&#]*)/.exec(raw);
    if (isPage) {
      if (lang === 'en') {
        if (got) issues.push('language in URL: EN link still carries a ?lang= parameter -> ' + raw);
      } else if (!got) {
        issues.push('language in URL: ' + lang + ' link is missing ?lang=' + lang + ' -> ' + raw);
      } else if (got[1] !== lang) {
        issues.push('language in URL: link says ?lang=' + got[1] + ' but the page is ' + lang + ' -> ' + raw);
      }
    } else if (got) {
      issues.push('language in URL: a non-page link must not carry ?lang= -> ' + raw);
    }
  });

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
    /* Path-based lookup: in FR/AR every href carries ?lang=xx, so an exact href="index.html"
       selector would silently stop matching and skip the mobile layout assertions below. */
    const logo = mainbar && Array.prototype.find.call(mainbar.querySelectorAll('a[href]'), function (a) {
      return a.getAttribute('href').split('#')[0].split('?')[0] === 'index.html';
    });
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
  if (pageFile !== 'index.html' && pageFile !== 'about.html' && pageFile !== 'services.html' && pageFile !== 'contact.html' && pageFile !== 'projects.html' && pageFile !== 'quality-hse.html' && pageFile !== 'service-residential-construction.html' && pageFile !== 'service-commercial-buildings.html' && pageFile !== 'service-industrial-works.html' && pageFile !== 'service-architectural-design.html' && pageFile !== 'service-renovation-retrofit.html' && pageFile !== 'service-project-management.html') {
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
    // Scoped to the social links (LinkedIn, Instagram, YouTube): the shared
    // language/hamburger controls are asserted site-wide further up, and counting every aria hook here would conflate the two groups.
    const alEls = document.querySelectorAll('.social-link[data-i18n-aria-label]');
    if (alEls.length !== 3) issues.push('contact: expected 3 social-link aria hooks, got ' + alEls.length);
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
    // info cards. The two value spans are deliberately left untranslated (a pair of tel: links and a
    // plain mailto address), so no hooks are expected on them.
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
      if (locVal && locVal.textContent.trim() === 'Cité 98 LSP Housing, Building F, No. 70, Khemis Miliana, Aïn Defla, Algeria') issues.push('index: contact_location_value not localised');
    }
  }

  // Service detail pages: the six wired pages (residential / commercial / industrial / renovation /
  // project management / architectural) share the svc_page.* chrome keys and reuse footer.svc_* /
  // nav.* for the service name and breadcrumb, exactly like services.html and contact.html do.
  // Every svc_* key per page is wired here — including ov_p1 / ov_p2 on the two pages whose FR/AR
  // copy was corrected by the client.
  const SVC_KEY = {
    'service-residential-construction.html': { slug: 'svc_residential', svcName: 'residential' },
    'service-commercial-buildings.html':     { slug: 'svc_commercial',  svcName: 'commercial' },
    'service-industrial-works.html':         { slug: 'svc_industrial',  svcName: 'industrial' },
    'service-architectural-design.html':     { slug: 'svc_arch',        svcName: 'arch' },
    'service-renovation-retrofit.html':      { slug: 'svc_renovation',  svcName: 'renovation' },
    'service-project-management.html':       { slug: 'svc_pm',          svcName: 'pm' }
  };
  if (SVC_KEY[pageFile]) {
    const slug = SVC_KEY[pageFile].slug;
    const svcName = SVC_KEY[pageFile].svcName;
    if (!document.querySelector('title[data-i18n="' + slug + '.page_title"]')) issues.push(pageFile + ': page_title hook missing');
    ['hero_eyebrow', 'hero_tagline', 'ov_eyebrow', 'ov_h2', 'ov_p1', 'ov_p2', 'inc_h2', 'inc_sub',
      'feat1_title', 'feat1_body', 'feat2_title', 'feat2_body', 'feat3_title', 'feat3_body',
      'feat4_title', 'feat4_body', 'feat5_title', 'feat5_body', 'feat6_title', 'feat6_body',
      'proc_h2', 'proc_sub', 'step1_title', 'step1_body', 'step2_title', 'step2_body',
      'step3_title', 'step3_body', 'step4_title', 'step4_body', 'cta_h3', 'cta_sub'].forEach(function (k) {
      if (!document.querySelector('[data-i18n="' + slug + '.' + k + '"]')) issues.push(pageFile + ': ' + slug + '.' + k + ' hook missing');
    });
    ['svc_page.back_link', 'svc_page.included_eyebrow', 'svc_page.process_eyebrow',
      'svc_page.cta_btn_contact', 'svc_page.cta_btn_projects'].forEach(function (k) {
      if (!document.querySelector('[data-i18n="' + k + '"]')) issues.push(pageFile + ': shared ' + k + ' hook missing');
    });
    const featTitles = document.querySelectorAll('[data-i18n^="' + slug + '.feat"][data-i18n$="_title"]');
    if (featTitles.length !== 6) issues.push(pageFile + ': expected 6 feature title hooks, got ' + featTitles.length);
    const featBodies = document.querySelectorAll('[data-i18n^="' + slug + '.feat"][data-i18n$="_body"]');
    if (featBodies.length !== 6) issues.push(pageFile + ': expected 6 feature body hooks, got ' + featBodies.length);
    const stepTitles = document.querySelectorAll('[data-i18n^="' + slug + '.step"][data-i18n$="_title"]');
    if (stepTitles.length !== 4) issues.push(pageFile + ': expected 4 process step title hooks, got ' + stepTitles.length);
    const stepBodies = document.querySelectorAll('[data-i18n^="' + slug + '.step"][data-i18n$="_body"]');
    if (stepBodies.length !== 4) issues.push(pageFile + ': expected 4 process step body hooks, got ' + stepBodies.length);
    if (!document.querySelector('#hero-title[data-i18n="footer.svc_' + svcName + '"]')) issues.push(pageFile + ': hero h1 not wired to the shared footer.svc_* service name');
    // A translated page must not silently fall back to the EN source copy once localised.
    if (lang !== 'en') {
      const enCopy = {
        svc_residential: {
          ov_h2: 'Comprehensive Residential Building Solutions',
          ov_p1: 'From single-family custom homes to multi-unit residential complexes and apartment buildings, our residential construction service covers the full build cycle — foundations, structural framing, building envelopes, and interior finishing. Every home is planned around the way you live, with layouts and finishes tailored to your brief.',
          ov_p2: 'We work to strict quality standards and building codes, coordinate all trades and suppliers in-house, and keep you informed at every milestone. The result is a home or residential development that is durable, comfortable, and delivered on time.',
          hero_tagline: 'Custom homes, multi-unit complexes, and apartment buildings delivered with premium materials and modern architectural standards.',
          cta_h3: 'Ready to Build Your Home?'
        },
        svc_commercial: {
          ov_h2: 'Commercial Buildings Built for Business',
          ov_p1: 'We deliver office buildings, retail centres, and mixed-use commercial facilities designed around how businesses actually operate — flexible floor plates, efficient circulation, and high-quality building systems. Every project is engineered for maximum operational efficiency and long-term durability.',
          ov_p2: 'From site preparation through structural works, facade, and fit-out, we coordinate all disciplines in-house and manage the programme tightly so your building is ready when your business needs it.',
          hero_tagline: 'Office complexes, retail centres, and commercial facilities engineered for performance, efficiency, and longevity.',
          cta_h3: 'Ready to Build Your Commercial Space?'
        },
        svc_industrial: {
          ov_h2: 'Industrial Facilities Built for Performance',
          ov_p1: 'Our industrial works service covers warehouses, logistics hubs, and production facilities designed for demanding operational loads — heavy-duty flooring, clear spans, robust building envelopes, and integrated MEP systems. We build to the standards your operations rely on.',
          ov_p2: 'Every industrial facility is planned around workflow: goods-in, storage, processing, and dispatch. We coordinate structural, mechanical, and electrical works to deliver a facility that runs efficiently from day one.',
          hero_tagline: 'Warehouses, production facilities, and logistics hubs engineered for heavy-duty operations.',
          cta_h3: 'Ready to Build Your Industrial Facility?'
        },
        svc_arch: {
          ov_h2: 'From Concept to Construction Documentation',
          ov_p1: 'Our architectural design service covers the full design spectrum — feasibility studies, concept design, detailed architectural drawings, and technical documentation. We turn your requirements into a design that is buildable, compliant, and aligned with national and international engineering codes.',
          ov_p2: 'Working alongside structural and MEP engineers, we coordinate every drawing so the design translates cleanly into construction, reducing risk and cost on site.',
          hero_tagline: 'Concept designs, detailed drawings, and technical documentation that turn ideas into buildable projects.',
          cta_h3: 'Have a Project in Mind?'
        },
        svc_renovation: {
          ov_h2: 'Breathing New Life Into Existing Buildings',
          ov_p1: 'Our renovation and retrofit service upgrades existing buildings — residential, commercial, or industrial — with structural reinforcement, interior remodelling, and full-scale refurbishment. We assess what is there, design targeted interventions, and deliver modern finishes that add real value.',
          ov_p2: 'Whether it is an energy retrofit, a functional reconfiguration, or a complete building renewal, we plan the works to minimise disruption and keep the building safe and compliant throughout.',
          hero_tagline: 'Structural upgrades, interior remodelling, and energy retrofits that extend the life of existing buildings.',
          cta_h3: 'Ready to Transform Your Building?'
        },
        svc_pm: {
          ov_h2: 'Construction Managed, End to End',
          ov_p1: 'Our project management service takes responsibility for the whole delivery chain — planning, procurement, subcontractor coordination, cost control, and quality assurance. We keep every project on schedule and on budget while meeting the highest safety and quality standards.',
          ov_p2: 'Acting as a single point of accountability, we coordinate consultants, suppliers, and trades, report transparently at every stage, and manage risks before they become delays.',
          hero_tagline: 'End-to-end coordination of timelines, subcontractors, budgets, and quality control.',
          cta_h3: 'Need Your Project Managed?'
        }
      }[slug];
      Object.keys(enCopy).forEach(function (k) {
        const el = document.querySelector('[data-i18n="' + slug + '.' + k + '"]');
        if (el && el.textContent.trim() === enCopy[k]) issues.push(pageFile + ': ' + slug + '.' + k + ' not localised (' + lang + ')');
      });
      const back = document.querySelector('[data-i18n="svc_page.back_link"]');
      if (back && back.textContent.trim() === 'Back to All Services') issues.push(pageFile + ': shared svc_page.back_link not localised (' + lang + ')');
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
  
  /* ── Every <img> in the DOM must really load ────────────────────────────────
     A wrong asset path fails silently: the request 404s, naturalWidth stays 0 and the page
     quietly renders the alt text instead of the picture. There is NO exceptions list here, so
     every <img> in the document is judged — including the ones the responsive classes hide
     (display:none still fetches eagerly) and the lazy ones below the fold. A lazy image is not
     requested until it scrolls near the viewport, so those are scrolled into view and switched
     to loading="eager" first, and an image is only reported if it still has no pixels after that
     bounded wait. Anything still unresolved is named by src, so the list doubles as the audit. */
  const images = Array.prototype.slice.call(document.images);
  const imgOk = function (i) { return i.complete && i.naturalWidth > 0; };
  const sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  const waitImg = function (i, ms) {
    return new Promise(function (res) {
      if (i.complete) return res();
      const done = function () { clearTimeout(t); i.removeEventListener('load', done); i.removeEventListener('error', done); res(); };
      const t = setTimeout(done, ms);
      i.addEventListener('load', done);
      i.addEventListener('error', done);
    });
  };
  /* listeners first, then trigger the fetch, so a fast 404 is not missed */
  const triggerImg = function (i, ms) {
    return new Promise(function (res) {
      const done = function () { clearTimeout(t); i.removeEventListener('load', done); i.removeEventListener('error', done); res(); };
      const t = setTimeout(done, ms);
      i.addEventListener('load', done);
      i.addEventListener('error', done);
      if (i.getAttribute('loading') === 'lazy') i.setAttribute('loading', 'eager');
      i.scrollIntoView({ block: 'center' });
      if (imgOk(i)) done();
    });
  };
  const inFlight = images.filter(function (i) { return !imgOk(i) && !i.complete; });
  if (inFlight.length) await Promise.race([Promise.all(inFlight.map(function (i) { return waitImg(i, 4000); })), sleep(4000)]);
  for (const img of images.filter(function (i) { return !imgOk(i); })) {
    /* This site's own lazy pattern: createSlideshow() parks each slide's URL in data-src until
       the slide becomes current/next. Promote it the way the page itself would, so a broken
       slide URL is still caught — only the promotion differs, never the assertion. */
    if (img.hasAttribute('data-src')) img.setAttribute('src', img.getAttribute('data-src'));
    if (img.getAttribute('loading') === 'lazy') await triggerImg(img, 2000);
    else if (!img.complete) await waitImg(img, 1500);
  }
  images.filter(function (i) { return !imgOk(i); }).forEach(function (i) {
    const ident = ' [' + i.tagName.toLowerCase() + (i.id ? '#' + i.id : '') +
      (typeof i.className === 'string' && i.className.trim() ? '.' + i.className.trim().split(/\s+/).join('.') : '') + ']';
    issues.push('image not loaded: ' + (i.getAttribute('src') || i.currentSrc || '(no src attribute)') + ident +
      (i.hasAttribute('data-src') ? ' (data-src="' + i.getAttribute('data-src') + '" not promoted)' : '') +
      ' (naturalSize ' + i.naturalWidth + 'x' + i.naturalHeight + ', complete=' + i.complete +
      ', display=' + getComputedStyle(i).display + ', loading=' + (i.getAttribute('loading') || 'eager') +
      ', alt="' + (i.getAttribute('alt') || '') + '")');
  });

  return issues;
}

run().catch(e => { console.error(e); process.exit(1); });