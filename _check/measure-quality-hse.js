/* quality-hse-audit-001 - Step 04 measurement harness (read-only).
   Loads quality-hse.html at 375/768/1440 in en/fr/ar, measures type scale, spacing,
   contrast, overflow and direction, screenshots each case, writes
   _check/measure-quality-hse-results.json with one pass/fail entry per case. */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ROOT_DIR = path.resolve(__dirname, '..');
const PAGE = 'quality-hse.html';
const LANGS = ['en', 'fr', 'ar'];
const VIEWPORTS = [
  { w: 375, h: 667, name: 'mobile' },
  { w: 768, h: 1024, name: 'tablet' },
  { w: 1440, h: 900, name: 'desktop' },
];
const PORT = 8125;
const BASE_URL = 'http://127.0.0.1:' + PORT + '/';
const OUT_JSON = path.join(__dirname, 'measure-quality-hse-results.json');
const SHOT_DIR = path.join(os.tmpdir(), 'quality-hse-shots');
const BODY_PX = 15;
const GAP_PX = 24;

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };

function createServer() {
  return http.createServer((req, res) => {
    let fp = path.join(ROOT_DIR, new URL(req.url, BASE_URL).pathname);
    if (fp.endsWith('/') || (fs.existsSync(fp) && fs.statSync(fp).isDirectory())) fp = path.join(fp, 'index.html');
    fs.readFile(fp, (err, content) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
      res.end(content);
    });
  });
}

/* WCAG contrast from computed colours, alpha-composited onto the real backdrop */
function parseColor(str) {
  const m = /rgba?\(([^)]+)\)/.exec(str || '');
  if (!m) return null;
  const p = m[1].split(',').map((v) => parseFloat(v));
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
}
function composite(fg, bg) {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}
function luminance(c) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}
function contrastRatio(fgStr, bgStr) {
  const fg = parseColor(fgStr);
  const bg = parseColor(bgStr);
  if (!fg || !bg) return null;
  const a = luminance(composite(fg, bg));
  const b = luminance(bg);
  return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
}

/* runs inside the page: measures only, never mutates */
function collect() {
  const cs = (el) => getComputedStyle(el);
  const backdrop = (el) => {
    let n = el;
    while (n && n.nodeType === 1) {
      const c = cs(n).backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
      n = n.parentElement;
    }
    return 'rgb(255, 255, 255)';
  };
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), left: Math.round(r.left), right: Math.round(r.right), h: Math.round(r.height) };
  };
  const cardData = (cards) => cards.map((c) => {
    const p = c.querySelector('p');
    const s = p ? cs(p) : null;
    const r = box(c);
    return {
      text: p ? p.textContent.trim().slice(0, 40) : '',
      fontSize: s ? s.fontSize : null,
      lineHeight: s ? s.lineHeight : null,
      color: s ? s.color : null,
      backdrop: backdrop(c),
      top: r.top, left: r.left, right: r.right, height: r.h,
      clipped: c.scrollHeight - c.clientHeight > 1,
    };
  });

  const banner = document.querySelector('#iso-banner');
  const grid = document.querySelector('#quality-grid');
  const hse = document.querySelector('#hse-grid');
  const hero = document.querySelector('#quality-hero');
  const dot = banner ? banner.querySelector('span.rounded-full') : null;
  const navyBox = banner ? banner.querySelector('div.flex-shrink-0') : null;
  const goldInBanner = banner
    ? Array.from(banner.querySelectorAll('*'))
        .filter((e) => cs(e).color === 'rgb(193, 159, 93)')
        .map((e) => ({ text: e.textContent.trim().slice(0, 30), color: cs(e).color, backdrop: backdrop(e) }))
    : [];
  const heroStyle = hero ? cs(hero) : null;
  const gridStyle = grid ? cs(grid) : null;
  const hseStyle = hse ? cs(hse) : null;

  return {
    lang: document.documentElement.lang,
    dir: document.documentElement.dir || cs(document.documentElement).direction,
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    hero: heroStyle ? { padTop: heroStyle.paddingTop, padBottom: heroStyle.paddingBottom, padLeft: heroStyle.paddingLeft, padRight: heroStyle.paddingRight } : null,
    banner: banner ? {
      borderColor: cs(banner).borderTopColor,
      dot: dot ? { background: cs(dot).backgroundColor, animation: cs(dot).animationName } : null,
      box: navyBox ? { background: backdrop(navyBox), borderColor: cs(navyBox).borderTopColor } : null,
      goldTexts: goldInBanner,
    } : null,
    quality: grid ? { count: grid.children.length, columnGap: gridStyle.columnGap, rowGap: gridStyle.rowGap, cards: cardData(Array.from(grid.children)) } : null,
    hse: hse ? { count: hse.children.length, columnGap: hseStyle.columnGap, rowGap: hseStyle.rowGap, cards: cardData(Array.from(hse.children)) } : null,
  };
}

/* source-level direction scan of the audited sections (computed styles only expose resolved left/right) */
function scanDirectionSource() {
  const lines = fs.readFileSync(path.join(ROOT_DIR, PAGE), 'utf8').split(/\r?\n/);
  const physical = /\b(?:text-left|text-right|ml-[0-9]|mr-[0-9]|pl-[0-9]|pr-[0-9])\b/;
  const anchoring = /\b(?:left-0|right-0)\b/;
  const hits = { physical: [], anchoring: [] };
  lines.slice(230, 490).forEach((line, i) => {
    if (physical.test(line)) hits.physical.push({ line: 231 + i, text: line.trim().slice(0, 120) });
    if (anchoring.test(line)) hits.anchoring.push({ line: 231 + i, text: line.trim().slice(0, 120) });
  });
  return hits;
}

function evaluateCase(m, lang) {
  const checks = [];
  const add = (id, pass, detail) => checks.push({ id, pass: !!pass, detail: String(detail) });
  const q = m.quality || { cards: [] };
  const h = m.hse || { cards: [] };
  const b = m.banner || {};
  const gold = b.goldTexts || [];
  const dot = b.dot || null;
  const boxInfo = b.box || null;
  const cards = q.cards.concat(h.cards);

  add('no-horizontal-overflow', m.scrollWidth <= m.innerWidth + 1, m.scrollWidth + ' vs ' + m.innerWidth);
  add('card-counts-7-6', q.count === 7 && h.count === 6, q.count + '/' + h.count);
  add('body-text-15px', cards.length === 13 && cards.every((c) => c.fontSize === BODY_PX + 'px'),
    cards.length + ' cards, sizes ' + Array.from(new Set(cards.map((c) => c.fontSize))).join('/'));
  add('line-height-1.7', cards.every((c) => parseFloat(c.lineHeight) >= BODY_PX * 1.7 - 0.5),
    Array.from(new Set(cards.map((c) => c.lineHeight))).join('/'));
  add('grid-gap-24', parseFloat(q.columnGap) === GAP_PX, q.columnGap + '/' + q.rowGap);
  add('no-card-clipping', cards.every((c) => !c.clipped), cards.filter((c) => c.clipped).length + ' clipped');
  add('no-edge-bleed', cards.every((c) => c.left >= -1 && c.right <= m.innerWidth + 1),
    'left ' + Math.min.apply(null, cards.map((c) => c.left)) + ', right ' + Math.max.apply(null, cards.map((c) => c.right)));

  const rows = {};
  cards.forEach((c) => { rows[c.top] = rows[c.top] || []; rows[c.top].push(c.height); });
  const uneven = Object.keys(rows).filter((k) => Math.max.apply(null, rows[k]) - Math.min.apply(null, rows[k]) > 1);
  add('uniform-card-heights-per-row', uneven.length === 0, uneven.length + ' uneven row(s)');

  add('iso-gold-budget-1', gold.length === 1, gold.map((g) => g.text).join(' | ') || 'none');
  add('iso-dot-muted-static', !!dot && dot.background === 'rgb(90, 95, 114)' && dot.animation === 'none', JSON.stringify(dot));
  add('iso-box-border-muted', !!boxInfo && boxInfo.borderColor === 'rgba(90, 95, 114, 0.25)', (boxInfo || {}).borderColor || 'missing');

  const qRatio = q.cards.length ? contrastRatio(q.cards[0].color, q.cards[0].backdrop) : null;
  const hRatio = h.cards.length ? contrastRatio(h.cards[0].color, h.cards[0].backdrop) : null;
  const gRatio = gold.length ? contrastRatio(gold[0].color, gold[0].backdrop) : null;
  add('contrast-quality-body', qRatio >= 4.5, qRatio + ':1');
  add('contrast-hse-body', hRatio >= 4.5, hRatio + ':1');
  add('contrast-iso-label', gRatio >= 4.5, gRatio + ':1');
  add('direction-attribute', lang === 'ar' ? m.dir === 'rtl' : m.dir === 'ltr', 'dir=' + m.dir);

  return { checks, ratios: { qualityBody: qRatio, hseBody: hRatio, isoLabel: gRatio } };
}

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const server = createServer();
  await new Promise((r) => server.listen(PORT, r));
  const browser = await puppeteer.launch({ executablePath: EDGE_PATH, headless: true, args: ['--no-sandbox'] });
  const report = { generatedAt: new Date().toISOString(), page: PAGE, viewports: VIEWPORTS.map((v) => v.w), languages: LANGS, screenshotDir: SHOT_DIR, sourceScan: scanDirectionSource(), tests: [] };

  try {
    for (const lang of LANGS) {
      for (const vp of VIEWPORTS) {
        const page = await browser.newPage();
        const label = lang + '-' + vp.name;
        try {
          await page.setViewport({ width: vp.w, height: vp.h });
          /* 'load' rather than 'networkidle0': the Tailwind CDN keeps a socket warm, so idle never
             settles on this page. Readiness is asserted explicitly on fonts + i18n hydration. */
          await page.goto(BASE_URL + PAGE + '?lang=' + lang, { waitUntil: 'load', timeout: 45000 });
          await page.evaluate(() => document.fonts.ready);
          await new Promise((r) => setTimeout(r, 300));
          await page.waitForFunction((l) => document.documentElement.getAttribute('lang') === l && document.documentElement.getAttribute('dir') !== null, { timeout: 8000 }, lang);
          const m = await page.evaluate(collect);
          const res = evaluateCase(m, lang);
          const fails = res.checks.filter((c) => !c.pass);
          const shot = path.join(SHOT_DIR, label + '-full.png');
          await page.screenshot({ path: shot, fullPage: true });
          report.tests.push({
            viewport: vp.name, width: vp.w, height: vp.h, lang: lang,
            pass: fails.length === 0,
            failures: fails.map((f) => f.id + ' (' + f.detail + ')'),
            ratios: res.ratios,
            checks: res.checks,
            metrics: {
              overflowPx: m.scrollWidth - m.innerWidth,
              heroPadding: m.hero,
              banner: { borderColor: (m.banner || {}).borderColor, dot: (m.banner || {}).dot, box: (m.banner || {}).box },
              quality: { count: m.quality.count, columnGap: m.quality.columnGap, heights: m.quality.cards.map((c) => c.height), fontSizes: m.quality.cards.map((c) => c.fontSize) },
              hse: { count: m.hse.count, columnGap: m.hse.columnGap, heights: m.hse.cards.map((c) => c.height), fontSizes: m.hse.cards.map((c) => c.fontSize) },
            },
            screenshot: shot,
          });
          console.log((fails.length ? 'FAIL ' : 'PASS ') + label + ' | ' + res.checks.filter((c) => c.pass).length + '/' + res.checks.length + (fails.length ? ' | ' + fails.map((f) => f.id).join(', ') : ''));
        } catch (e) {
          report.tests.push({ viewport: vp.name, width: vp.w, height: vp.h, lang: lang, pass: false, failures: ['harness error: ' + e.message] });
          console.log('FAIL ' + label + ' | harness error: ' + e.message);
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  const passed = report.tests.filter((t) => t.pass).length;
  report.summary = { total: report.tests.length, passed: passed, failed: report.tests.length - passed };
  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));
  console.log('');
  console.log('=== SUMMARY ===');
  console.log('Total: ' + report.summary.total + ', Passed: ' + passed + ', Failed: ' + report.summary.failed);
  console.log('JSON: ' + OUT_JSON);
  if (report.sourceScan.physical.length) console.log('WARN physical direction utilities in audited range: lines ' + report.sourceScan.physical.map((x) => x.line).join(', '));
  if (report.sourceScan.anchoring.length) console.log('INFO physical anchoring in audited range: lines ' + report.sourceScan.anchoring.map((x) => x.line).join(', '));
  process.exit(report.summary.failed === 0 ? 0 : 1);
})();
