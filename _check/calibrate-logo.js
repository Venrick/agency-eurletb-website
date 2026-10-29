#!/usr/bin/env node
/**
 * calibrate-logo.js — measure the real pillar geometry of assets/images/etb-logo-full.svg
 *
 * The companies section maps click targets onto the logo, so the hotspot rectangles have to be
 * derived from the artwork instead of guessed. This renders the SVG into a canvas at its intrinsic
 * 2000x2000 size, builds an ink mask, prints an ASCII occupancy map and the bounding boxes of the
 * connected ink components, so the four pillar rectangles can be read off exactly.
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8129;
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
  await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ executablePath: EDGE_PATH, headless: true, args: ['--no-sandbox'] });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });
    await page.goto(BASE_URL + 'index.html', { waitUntil: 'domcontentloaded' });

    const report = await page.evaluate(async (svgUrl) => {
      const img = new Image();
      img.src = svgUrl;
      await img.decode();
      const W = img.naturalWidth, H = img.naturalHeight;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, W, H);
      const data = ctx.getImageData(0, 0, W, H).data;

      // Ink = anything that is not the near-white page background.
      const ink = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) {
        const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
        if (r < 246 || g < 246 || b < 246) ink[i] = 1;
      }

      // Downsample to a coarse grid so components can be labelled cheaply.
      const G = 100, cw = W / G, ch = H / G;
      const cell = new Uint8Array(G * G);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (!ink[y * W + x]) continue;
          cell[Math.floor(y / ch) * G + Math.floor(x / cw)]++;
        }
      }
      const on = cell.map(c => (c > 0 ? 1 : 0));

      // 4-connected component labelling on the coarse grid.
      const label = new Int32Array(G * G).fill(-1);
      const comps = [];
      for (let s = 0; s < G * G; s++) {
        if (!on[s] || label[s] !== -1) continue;
        const id = comps.length;
        const stack = [s];
        label[s] = id;
        const c = { cells: 0, x1: 1e9, y1: 1e9, x2: -1, y2: -1 };
        while (stack.length) {
          const cur = stack.pop();
          const cx = cur % G, cy = (cur - cx) / G;
          c.cells++;
          c.x1 = Math.min(c.x1, cx); c.y1 = Math.min(c.y1, cy);
          c.x2 = Math.max(c.x2, cx); c.y2 = Math.max(c.y2, cy);
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
            const nx = cx + dx, ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= G || ny >= G) return;
            const ni = ny * G + nx;
            if (!on[ni] || label[ni] !== -1) return;
            label[ni] = id;
            stack.push(ni);
          });
        }
        c.box = [
          Math.round(c.x1 * cw), Math.round(c.y1 * ch),
          Math.round((c.x2 + 1) * cw), Math.round((c.y2 + 1) * ch)
        ];
        comps.push(c);
      }
      comps.sort((a, b) => b.cells - a.cells);

      // ASCII occupancy map, 100 columns wide.
      const rows = [];
      for (let y = 0; y < G; y++) {
        let line = '';
        for (let x = 0; x < G; x++) line += on[y * G + x] ? '#' : '.';
        rows.push(String(y).padStart(3, ' ') + ' ' + line);
      }

      // Column / row ink totals (in source pixels) to locate the gaps between pillars.
      const colInk = new Array(G).fill(0), rowInk = new Array(G).fill(0);
      for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
        if (!on[y * G + x]) continue;
        colInk[x]++; rowInk[y]++;
      }

      // ── Interior analysis: find the vertical bars (pillars) inside the emblem frame ──
      const X0 = 540, X1 = 1460, Y0 = 360, Y1 = 1340;
      const ig = 92, iw = (X1 - X0) / ig, ih = 52, ihh = (Y1 - Y0) / ih;
      const iRows = [];
      const iColCount = new Array(ig).fill(0);
      for (let ry = 0; ry < ih; ry++) {
        let line = '';
        for (let rx = 0; rx < ig; rx++) {
          let count = 0;
          for (let y = Y0 + ry * ihh; y < Y0 + (ry + 1) * ihh; y++) {
            for (let x = X0 + rx * iw; x < X0 + (rx + 1) * iw; x++) {
              if (ink[Math.round(y) * W + Math.round(x)]) count++;
            }
          }
          if (count > 0) iColCount[rx]++;
          line += count > 0 ? '#' : '.';
        }
        iRows.push(String(ry).padStart(2) + '|' + line);
      }
      const colPx = [];
      for (let rx = 0; rx < ig; rx++) colPx.push(Math.round(X0 + rx * iw));

      // ── Gold-only segmentation: the four pillar groups are the gold buildings inside the frame ──
      const GOLD_CELL = 10, gW = W / GOLD_CELL, gH = H / GOLD_CELL;
      const goldCell = new Uint8Array(gW * gH);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const isGold = r > 140 && g > 110 && b < 150 && (r - b) > 40 && (g - b) > 25;
          if (!isGold) continue;
          goldCell[Math.floor(y / GOLD_CELL) * gW + Math.floor(x / GOLD_CELL)]++;
        }
      }
      const gOn = goldCell.map(c => (c > 40 ? 1 : 0));
      const gLabel = new Int32Array(gW * gH).fill(-1);
      const gComps = [];
      for (let s = 0; s < gW * gH; s++) {
        if (!gOn[s] || gLabel[s] !== -1) continue;
        const id = gComps.length;
        const stack = [s];
        gLabel[s] = id;
        const c = { cells: 0, x1: 1e9, y1: 1e9, x2: -1, y2: -1 };
        while (stack.length) {
          const cur = stack.pop();
          const cx = cur % gW, cy = (cur - cx) / gW;
          c.cells++;
          c.x1 = Math.min(c.x1, cx); c.y1 = Math.min(c.y1, cy);
          c.x2 = Math.max(c.x2, cx); c.y2 = Math.max(c.y2, cy);
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            const nx = cx + d[0], ny = cy + d[1];
            if (nx < 0 || ny < 0 || nx >= gW || ny >= gH) return;
            const ni = ny * gW + nx;
            if (!gOn[ni] || gLabel[ni] !== -1) return;
            gLabel[ni] = id;
            stack.push(ni);
          });
        }
        c.box = [
          c.x1 * GOLD_CELL, c.y1 * GOLD_CELL,
          (c.x2 + 1) * GOLD_CELL, (c.y2 + 1) * GOLD_CELL
        ];
        gComps.push(c);
      }
      gComps.sort(function (a, b) { return a.box[0] - b.box[0]; });

      return {
        W, H,
        rows,
        cols: colInk.join(','),
        rowTotals: rowInk.join(','),
        comps: comps.slice(0, 14).map(c => ({ cells: c.cells, box: c.box })),
        goldComps: gComps.filter(c => c.cells > 20).map(c => ({ cells: c.cells, box: c.box })),
        interior: { iRows: iRows, iColCount: iColCount, colPx: colPx, X0, X1, Y0, Y1, ig, ih }
      };
    }, BASE_URL + 'assets/images/etb-logo-full.svg');

    console.log('SVG intrinsic size: ' + report.W + ' x ' + report.H);
    console.log('\n=== ASCII occupancy (100 x 100 grid, 20px cells) ===');
    report.rows.forEach(r => console.log(r));
    console.log('\n=== Column ink (per 20px cell, 100 cells) ===');
    console.log(report.cols);
    console.log('\n=== Row ink (per 20px cell, 100 cells) ===');
    console.log(report.rowTotals);
    console.log('\n=== Largest connected ink components (bbox in SVG units) ===');
    report.comps.forEach((c, i) => console.log(String(i).padStart(2) + ': cells=' + String(c.cells).padStart(5) + '  box=' + c.box.join(',')));

    console.log('\n=== Gold components, sorted left→right (bbox in SVG units) ===');
    report.goldComps.forEach((c, i) => console.log(String(i).padStart(2) + ': cells=' + String(c.cells).padStart(5) + '  box=' + c.box.join(',') + '   w=' + (c.box[2] - c.box[0]) + ' h=' + (c.box[3] - c.box[1])));
    console.log('\n=== Emblem interior (' + it.X0 + '-' + it.X1 + ' x ' + it.Y0 + '-' + it.Y1 + ') ===');
    it.iRows.forEach(r => console.log(r));
    console.log('\n=== Interior column ink (cells out of ' + it.ih + ' rows) ===');
    console.log(it.iColCount.map((n, i) => i + ':' + it.colPx[i] + 'px=' + n).join('  '));
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch(e => { console.error(e); process.exit(1); });
