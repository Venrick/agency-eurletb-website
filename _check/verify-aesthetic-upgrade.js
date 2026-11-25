#!/usr/bin/env node
/**
 * verify-aesthetic-upgrade.js — verify companies section aesthetic upgrade
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8133;
const BASE_URL = `http://127.0.0.1:${PORT}/`;

function createServer() {
  return http.createServer((req, res) => {
    let fp = path.join(ROOT_DIR, new URL(req.url, BASE_URL).pathname);
    fs.readFile(fp, (err, c) => {
      if (err) { res.writeHead(404); res.end(); }
      else { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(c); }
    });
  });
}

const issues = [];
function check(ok, msg) { if (!ok) issues.push(msg); }

async function run() {
  const server = createServer();
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const browser = await puppeteer.launch({ executablePath: EDGE_PATH, headless: true, args: ['--no-sandbox'] });
  const shots = [];
  
  try {
    console.log('Testing aesthetic upgrade...\n');
    const viewports = [
      { name: 'desktop', w: 1440, h: 900 },
      { name: 'tablet', w: 768, h: 1024 },
      { name: 'mobile', w: 375, h: 667 }
    ];