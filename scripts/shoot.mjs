/**
 * Dev utility: screenshot built pages for visual review.
 * Usage: node scripts/shoot.mjs <outDir> [route ...]
 */
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const DIST = resolve(process.cwd(), 'dist');
const outDir = process.argv[2] ?? resolve(process.cwd(), '.shots');
const routes = process.argv.slice(3);
if (routes.length === 0) routes.push('/');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain',
};

const server = createServer(async (req, res) => {
  try {
    let p = join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    try { if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); } catch {}
    res.writeHead(200, { 'content-type': MIME[extname(p)] ?? 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404).end('nf'); }
});
await new Promise((d) => server.listen(0, '127.0.0.1', d));
const base = `http://127.0.0.1:${server.address().port}`;

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

for (const spec of routes) {
  const [route, width = '1440', mode = 'fold'] = spec.split('@');
  const page = await browser.newPage({
    viewport: { width: Number(width), height: mode === 'full' ? 900 : 1000 },
    deviceScaleFactor: 1,
  });
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (mode === 'full') {
    await page.evaluate(async () => {
      await new Promise((done) => {
        let y = 0;
        const step = () => {
          window.scrollTo(0, y);
          y += window.innerHeight * 0.6;
          if (y < document.body.scrollHeight) setTimeout(step, 180);
          else { window.scrollTo(0, 0); setTimeout(done, 1400); }
        };
        step();
      });
    });
  }
  await page.waitForTimeout(900);
  const name = `${route.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home'}-${width}-${mode}.png`;
  await page.screenshot({ path: join(outDir, name), fullPage: mode === 'full' });
  console.log(join(outDir, name));
  await page.close();
}

await browser.close();
server.close();
