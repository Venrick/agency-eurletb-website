#!/usr/bin/env node
/**
 * verify-companies-redesign.js — behavioural check of the homepage companies section.
 *
 * Covers the acceptance criteria that a static scan cannot: logo sizing per viewport, the grid being
 * hidden, the four pillar hotspots actually opening the right card, the modal open/close paths, the
 * contact links, and EN/FR/AR localisation of the new copy.
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8127;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

const EXPECTED = [
  { id: 'bitumax', title: 'SARL BITUMAX', href: 'contact.html?company=bitumax', body: 'home.comp_body2' },
  { id: 'bati-achouri', title: 'BATI Achouri', href: 'contact.html?company=bati-achouri', body: 'home.comp_body3' },
  { id: 'batikram', title: 'SARL BATIKRAM', href: 'contact.html?company=batikram', body: 'home.comp_body4' },
  { id: 'etrabal', title: 'EURL ETRABAL', href: 'contact.html?company=etrabal', body: 'home.comp_body_etrabal' }
];

const VIEWPORTS = [
  // The artwork's natural size is 302×364, so `max-w-[360px]` never upscales it on desktop.
  { name: 'desktop', w: 1440, h: 900, logoW: 302, logoH: 364 },
  { name: 'tablet', w: 768, h: 1024, logoW: 300, logoH: 362 },
  { name: 'mobile', w: 375, h: 667, logoW: 220, logoH: 265 }
];

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

const issues = [];
const network = { bad: [], failed: [] };
function check(ok, msg) { if (!ok) issues.push(msg); }

async function openPage(browser, w, h, lang) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h });
  page.on('pageerror', e => issues.push('pageerror: ' + e.message));
  page.on('console', m => {
    // Resource-loading noise from remote media is reported separately (see `network`) and is not a
    // regression signal; only real script errors count here.
    if (m.type() === 'error' && !/Failed to load resource/i.test(m.text())) issues.push('console error: ' + m.text());
  });
  page.on('response', r => { if (r.status() >= 400) network.bad.push(r.status() + ' ' + r.url()); });
  page.on('requestfailed', r => network.failed.push(r.url() + ' (' + (r.failure() ? r.failure().errorText : '?') + ')'));
  await page.setRequestInterception(true);
  page.on('request', r => {
    // The site is styled by the Tailwind Play CDN, so external requests must be allowed; only the
    // heavy video assets are dropped to keep the run fast.
    if (/\.(mp4|webm|m3u8)(\?|$)/i.test(r.url())) r.abort(); else r.continue();
  });
  await page.goto(BASE_URL + 'index.html' + (lang && lang !== 'en' ? '?lang=' + lang : ''), { waitUntil: 'networkidle0', timeout: 40000 });
  await page.waitForFunction(() => {
    const l = document.getElementById('companies-etb-logo');
    return document.readyState === 'complete' && l && l.complete && l.naturalWidth > 0;
  }, { timeout: 20000 });
  // Tailwind's Play CDN injects its stylesheet asynchronously; the measured boxes are meaningless
  // until the utilities (max-w-[500px], hidden, fixed, …) have been generated.
  await page.waitForFunction(() => {
    const l = document.getElementById('companies-etb-logo');
    return l && Math.abs(l.getBoundingClientRect().width - 2000) > 1;
  }, { timeout: 15000 }).catch(() => {});
  return page;
}

async function sectionChecks(browser, vp, lang) {
  const page = await openPage(browser, vp.w, vp.h, lang);
  const tag = '[' + vp.name + '/' + (lang || 'en') + '] ';

  // Bring the section into view so the measured boxes are clickable.
  await page.evaluate(() => {
    const s = document.getElementById('companies');
    s.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 400));

  const geo = await page.evaluate(() => {
    const logo = document.getElementById('companies-etb-logo');
    const grid = document.getElementById('companies-grid');
    const hint = document.querySelector('[data-i18n="home.comp_pillar_hint"]');
    const btns = Array.prototype.map.call(document.querySelectorAll('#pillar-touch-overlay .pillar-btn'), b => {
      const r = b.getBoundingClientRect();
      return { id: b.getAttribute('data-company'), x: r.x, y: r.y, w: r.width, h: r.height };
    });
    const lr = logo.getBoundingClientRect();
    return {
      logo: { x: lr.x, y: lr.y, w: lr.width, h: lr.height, natural: logo.naturalWidth },
      gridDisplay: grid ? getComputedStyle(grid).display : 'missing',
      visibleCards: Array.prototype.filter.call(document.querySelectorAll('.company-card'), c => c.offsetParent !== null).length,
      hintText: hint ? hint.textContent.trim() : null,
      hintVisible: !!(hint && hint.offsetParent !== null),
      hintPulse: !!(document.getElementById('companies-pillar-hint-icon') &&
        document.getElementById('companies-pillar-hint-icon').classList.contains('hint-pulse')),
      cardExtras: Array.prototype.map.call(document.querySelectorAll('.company-card'), function (c) {
        const meta = c.querySelector('[data-i18n^="home.comp_meta_"]');
        return {
          meta: meta ? meta.textContent.trim() : null,
          bullets: c.querySelectorAll('ul li').length
        };
      }),
      btns,
      areas: Array.prototype.map.call(document.querySelectorAll('#etb-logo-map area'), a => ({ id: a.getAttribute('data-company'), coords: a.getAttribute('coords') })),
      etbRefs: document.querySelectorAll('[data-company="etb"], [data-company-id="etb"]').length,
      cardIds: Array.prototype.map.call(document.querySelectorAll('.company-card'), c => c.getAttribute('data-company-id'))
    };
  });

  if (!lang || lang === 'en') {
    check(Math.abs(geo.logo.w - vp.logoW) <= 2, tag + 'logo rendered ' + Math.round(geo.logo.w) + 'px, expected ' + vp.logoW + 'px');
    check(Math.abs(geo.logo.h - vp.logoH) <= 2, tag + 'logo rendered ' + Math.round(geo.logo.h) + 'px, expected ' + vp.logoH + 'px');
    check(geo.logo.natural === 302, tag + 'logo intrinsic width ' + geo.logo.natural + ', expected 302');
    check(geo.gridDisplay === 'none', tag + 'companies grid display is "' + geo.gridDisplay + '", expected none');
    check(geo.visibleCards === 0, tag + 'visible company cards on page: ' + geo.visibleCards + ' (expected 0)');
    check(geo.hintVisible, tag + 'pillar hint is not visible');
    check(geo.hintPulse, tag + 'pillar hint icon is not pulsing (hint-pulse class missing)');
    check(geo.cardExtras.length === 4 && geo.cardExtras.every(c => !!c.meta && c.bullets === 3),
      tag + 'card metadata/bullets incomplete: ' + JSON.stringify(geo.cardExtras));
    check(geo.etbRefs === 0, tag + 'found ' + geo.etbRefs + ' leftover ETB company hooks');
    check(geo.cardIds.join(',') === 'bitumax,bati-achouri,batikram,etrabal', tag + 'card order is ' + geo.cardIds.join(','));
    check(geo.areas.length === 4, tag + 'image map has ' + geo.areas.length + ' areas, expected 4');
    check(geo.areas.map(a => a.id).join(',') === 'bitumax,bati-achouri,batikram,etrabal', tag + 'area order is ' + geo.areas.map(a => a.id).join(','));
    geo.areas.forEach(a => {
      const c = a.coords.split(',').map(Number);
      check(c.length === 4 && c[2] > c[0] && c[3] > c[1] && c[2] <= 302 && c[3] <= 364, tag + 'bad area coords for ' + a.id + ': ' + a.coords);
    });
  }

  // Overlay buttons must sit exactly on the measured pillar bands.
  const bands = [[79, 101], [111, 135], [170, 194], [204, 227]];
  check(geo.btns.length === 4, tag + 'overlay has ' + geo.btns.length + ' buttons, expected 4');
  geo.btns.forEach((b, i) => {
    const expCx = geo.logo.x + (((bands[i][0] + bands[i][1]) / 2) / 302) * geo.logo.w;
    const gotCx = b.x + b.w / 2;
    check(Math.abs(gotCx - expCx) <= 3, tag + b.id + ' hotspot centre x is ' + Math.round(gotCx) + ', pillar centre is ' + Math.round(expCx));
    check(b.w > 10 && b.h > 10, tag + b.id + ' hotspot is too small (' + Math.round(b.w) + 'x' + Math.round(b.h) + ')');
    check(b.y >= geo.logo.y - 1 && b.y + b.h <= geo.logo.y + geo.logo.h + 1, tag + b.id + ' hotspot spills outside the logo box');
  });

  return { page, geo };
}

async function modalState(page) {
  return page.evaluate(() => {
    const m = document.getElementById('companies-modal');
    const c = m ? document.getElementById('companies-modal-content') : null;
    const h3 = c ? c.querySelector('h3') : null;
    const a = c ? c.querySelector('a') : null;
    const p = c ? c.querySelector('p') : null;
    return {
      open: !!m && !m.classList.contains('hidden') && getComputedStyle(m).display !== 'none',
      title: h3 ? h3.textContent.trim() : null,
      href: a ? a.getAttribute('href') : null,
      body: p ? p.textContent.trim() : null
    };
  });
}

async function interactChecks(page, geo, tag) {
  // 1. Each transparent pillar button opens its own card.
  for (let i = 0; i < EXPECTED.length; i++) {
    const b = geo.btns[i];
    await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2);
    await new Promise(r => setTimeout(r, 120));
    const st = await modalState(page);
    check(st.open, tag + 'clicking the ' + EXPECTED[i].id + ' pillar did not open the modal');
    check(st.title === EXPECTED[i].title, tag + EXPECTED[i].id + ' pillar opened "' + st.title + '", expected "' + EXPECTED[i].title + '"');
    check(st.href === EXPECTED[i].href, tag + EXPECTED[i].id + ' contact link is "' + st.href + '", expected "' + EXPECTED[i].href + '"');
    check(!!st.body && st.body.length > 10, tag + EXPECTED[i].id + ' card has no description text');
    const rich = await page.evaluate(() => {
      const c = document.getElementById('companies-modal-content');
      const ul = c ? c.querySelector('.company-card ul') : null;
      const meta = c ? c.querySelector('.company-card [data-i18n^="home.comp_meta_"]') : null;
      return {
        meta: meta ? meta.textContent.trim() : null,
        bullets: ul ? Array.prototype.map.call(ul.querySelectorAll('li'), li => li.textContent.trim()) : []
      };
    });
    check(!!rich.meta && /(19|20)\d\d/.test(rich.meta), tag + EXPECTED[i].id + ' card is missing the year/specialisation strip ("' + rich.meta + '")');
    check(rich.bullets.length === 3 && rich.bullets.every(t => t.length > 2),
      tag + EXPECTED[i].id + ' card service bullets are ' + JSON.stringify(rich.bullets));
    await page.click('#companies-modal-close');
    await new Promise(r => setTimeout(r, 320));
    const closed = await modalState(page);
    check(!closed.open, tag + 'close button did not dismiss the modal');
  }

  // 2. Clicks that miss the artwork (image-map fallback path) must not open a card.
  await page.evaluate(() => {
    const overlay = document.getElementById('pillar-touch-overlay');
    if (overlay) overlay.style.pointerEvents = 'none';
    Array.prototype.forEach.call(document.querySelectorAll('.pillar-btn'), b => { b.style.pointerEvents = 'none'; });
  });
  await page.mouse.click(geo.logo.x + geo.logo.w * 0.12, geo.logo.y + geo.logo.h * 0.6);
  await new Promise(r => setTimeout(r, 120));
  check(!(await modalState(page)).open, tag + 'a click on the empty left margin opened a card');

  // 3. Image map / logo fallback still resolves the right pillar by x position.
  for (let i = 0; i < EXPECTED.length; i++) {
    const bandPairs = [[79, 101], [111, 135], [170, 194], [204, 227]];
    const centroid = (bandPairs[i][0] + bandPairs[i][1]) / 2;
    const cx = geo.logo.x + (centroid / 302) * geo.logo.w;
    await page.mouse.click(cx, geo.logo.y + geo.logo.h * 0.6);
    await new Promise(r => setTimeout(r, 120));
    const st = await modalState(page);
    check(st.open && st.title === EXPECTED[i].title, tag + 'logo click at pillar ' + EXPECTED[i].id + ' opened "' + st.title + '"');
    if (st.open) await page.click('#companies-modal-close');
    await new Promise(r => setTimeout(r, 320));
  }

  // 4. Backdrop click closes the modal.
  await page.evaluate(() => {
    const overlay = document.getElementById('pillar-touch-overlay');
    if (overlay) overlay.style.pointerEvents = '';
    Array.prototype.forEach.call(document.querySelectorAll('.pillar-btn'), b => { b.style.pointerEvents = ''; });
  });
  const b0 = geo.btns[3];
  await page.mouse.click(b0.x + b0.w / 2, b0.y + b0.h / 2);
  await new Promise(r => setTimeout(r, 120));
  await page.mouse.move(5, Math.round(page.viewport().height / 2));
  await page.mouse.down();
  await page.mouse.up();
  await new Promise(r => setTimeout(r, 320));
  check(!(await modalState(page)).open, tag + 'backdrop click did not dismiss the modal');

  // 5. Escape closes the modal; the panel carries a larger close button and a keyboard hint.
  const bEsc = geo.btns[2];
  await page.mouse.click(bEsc.x + bEsc.w / 2, bEsc.y + bEsc.h / 2);
  await new Promise(r => setTimeout(r, 200));
  const panel = await page.evaluate(() => {
    const btn = document.getElementById('companies-modal-close');
    const hint = document.querySelector('#companies-modal-panel [data-i18n="home.comp_modal_hint"]');
    const panelEl = document.getElementById('companies-modal-panel');
    const cs = panelEl ? getComputedStyle(panelEl) : null;
    const r = btn ? btn.getBoundingClientRect() : null;
    return {
      close: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null,
      hint: hint ? hint.textContent.trim() : null,
      opacity: cs ? Number(cs.opacity).toFixed(2) : null
    };
  });
  check(!!panel.close && panel.close.w >= 36 && panel.close.h >= 36,
    tag + 'close button is too small: ' + JSON.stringify(panel.close));
  check(!!panel.hint, tag + 'modal keyboard hint (ESC) is missing');
  check(Number(panel.opacity) > 0.9, tag + 'modal panel did not fade in (opacity ' + panel.opacity + ')');
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 320));
  check(!(await modalState(page)).open, tag + 'Escape did not dismiss the modal');

  // 6. Hovering a pillar reveals the gold affordance (pointer devices only).
  const canHover = await page.evaluate(() => window.matchMedia('(hover: hover)').matches);
  if (canHover) {
    const bHover = geo.btns[0];
    await page.mouse.move(bHover.x + bHover.w / 2, bHover.y + bHover.h / 2);
    await new Promise(r => setTimeout(r, 300));
    const glow = await page.evaluate(() => {
      const btn = document.querySelector('.pillar-btn');
      if (!btn) return null;
      const cs = getComputedStyle(btn);
      return { opacity: cs.opacity, bg: cs.backgroundColor, anim: cs.animationName };
    });
    check(!!glow && Number(glow.opacity) > 0.5,
      tag + 'pillar hover does not reveal the hotspot (opacity ' + (glow && glow.opacity) + ')');
    check(!!glow && (/193, 159, 93/.test(glow.bg) || glow.anim === 'pillarGlow'),
      tag + 'pillar hover shows no gold glow (' + JSON.stringify(glow) + ')');
    await page.mouse.move(0, 0);
    await new Promise(r => setTimeout(r, 220));
  }
}

const EN_HINT = 'Click on a pillar to explore our sister companies';
const EN_ETRABAL_BODY = 'Hydraulic systems, fluid power solutions, and water management equipment.';

async function i18nChecks(browser, vp) {
  // EN copy is the source of truth rendered on load.
  const en = await sectionChecks(browser, vp);
  check(en.geo.hintText === EN_HINT, '[en] hint text is "' + en.geo.hintText + '"');
  await en.page.close();

  for (const lang of ['fr', 'ar']) {
    const { page, geo } = await sectionChecks(browser, vp, lang);
    const tag = '[' + vp.name + '/' + lang + '] ';
    check(geo.hintText && geo.hintText !== EN_HINT && geo.hintText.length > 5,
      tag + 'pillar hint still shows the English copy ("' + geo.hintText + '")');
    const resolved = await page.evaluate(() => {
      return {
        hint: typeof window.i18nText === 'function' ? window.i18nText('home.comp_pillar_hint') : null,
        etrabal: typeof window.i18nText === 'function' ? window.i18nText('home.comp_body_etrabal') : null
      };
    });
    check(!!resolved.hint && resolved.hint !== EN_HINT, tag + 'i18nText(home.comp_pillar_hint) did not localise: ' + resolved.hint);
    check(!!resolved.etrabal && resolved.etrabal !== EN_ETRABAL_BODY, tag + 'i18nText(home.comp_body_etrabal) did not localise: ' + resolved.etrabal);

    // The ETRABAL modal card must carry the localised description.
    const b = geo.btns[3];
    await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2);
    await new Promise(r => setTimeout(r, 150));
    const st = await modalState(page);
    check(st.open, tag + 'ETRABAL pillar did not open the modal');
    check(st.body !== EN_ETRABAL_BODY && !!st.body, tag + 'ETRABAL card description is not localised ("' + st.body + '")');
    const sides = await page.evaluate(() => {
      const b = document.getElementById('companies-modal-close');
      const p = document.getElementById('companies-modal-panel');
      if (!b || !p) return null;
      const br = b.getBoundingClientRect();
      const pr = p.getBoundingClientRect();
      return { btn: br.x + br.width / 2, panel: pr.x + pr.width / 2, dir: getComputedStyle(document.documentElement).direction, label: document.getElementById('companies-modal').getAttribute('aria-label') };
    });
    check(!!sides, tag + 'close button/panel not measurable');
    if (sides) {
      // `-end-3` is a logical inset: it must mirror to the left edge once direction is rtl.
      const expectRight = sides.dir !== 'rtl';
      check(expectRight ? sides.btn > sides.panel : sides.btn < sides.panel,
        tag + 'close button is on the wrong side for ' + sides.dir + ' (btn ' + Math.round(sides.btn) + ' vs panel centre ' + Math.round(sides.panel) + ')');
      check(!!sides.label && sides.label !== 'Company details',
        tag + 'modal aria-label is not localised ("' + sides.label + '")');
    }
    await page.close();
  }
}

async function run() {
  const server = createServer();
  await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ executablePath: EDGE_PATH, headless: true, args: ['--no-sandbox'] });
  const shots = [];
  try {
    for (const vp of VIEWPORTS) {
      const { page, geo } = await sectionChecks(browser, vp);
      console.log(vp.name + ': logo ' + Math.round(geo.logo.w) + 'px, grid display ' + geo.gridDisplay +
        ', visible cards ' + geo.visibleCards + ', hotspots ' + geo.btns.length);
      await interactChecks(page, geo, '[' + vp.name + '/en] ');
      if (vp.name === 'mobile') {
        const b = geo.btns[3];
        await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2);
        await new Promise(r => setTimeout(r, 350));
        const modalShot = path.join(__dirname, 'companies-modal-etrabal.png');
        await page.screenshot({ path: modalShot });
        shots.push(modalShot);
        await page.click('#companies-modal-close');
        await new Promise(r => setTimeout(r, 320));
      }
      // Frame the section under the fixed header for a readable screenshot.
      await page.evaluate(() => {
        const s = document.getElementById('companies');
        const navH = document.querySelector('header') ? document.querySelector('header').getBoundingClientRect().height : 0;
        window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY - navH - 12);
      });
      await new Promise(r => setTimeout(r, 700));
      const shot = path.join(__dirname, 'companies-' + vp.name + '.png');
      await page.screenshot({ path: shot });
      shots.push(shot);
      await page.close();
    }
    await i18nChecks(browser, VIEWPORTS[0]);
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\nScreenshots:');
  shots.forEach(s => console.log('  ' + s));

  // Only the companies-section assets matter for this check; anything else (remote media, fonts) is
  // reported for information but does not fail the run.
  const local = u => u.indexOf('127.0.0.1') !== -1;
  network.bad.concat(network.failed).forEach(u => {
    if (local(u) && /company-logos|etb-logo-full/.test(u)) issues.push('companies asset failed to load: ' + u);
  });
  const uniq = a => Array.from(new Set(a));
  if (network.bad.length) {
    console.log('\nNon-2xx responses (informational):');
    uniq(network.bad).slice(0, 8).forEach(u => console.log('  ' + u));
  }
  if (network.failed.length) {
    console.log('\nBlocked/failed requests (informational):');
    uniq(network.failed).slice(0, 8).forEach(u => console.log('  ' + u));
  }

  console.log('\n=== COMPANIES SECTION ===');
  if (!issues.length) {
    console.log('ALL CHECKS PASSED');
  } else {
    console.log(issues.length + ' issue(s):');
    issues.forEach(i => console.log(' - ' + i));
    process.exitCode = 1;
  }
}

run().catch(e => { console.error(e); process.exit(1); });


