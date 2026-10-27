/**
 * Generates the social share image, the PWA icons and the Apple touch icon.
 *
 * These are the handful of assets that genuinely have to be raster: Open Graph
 * has no SVG support in any major platform, and `apple-touch-icon` ignores it.
 * Everything else on the site stays vector.
 *
 * The artwork is composed in HTML/CSS and rendered with the Chromium build that
 * ships with this environment, so there is no design-tool round trip and the
 * brand colours come from one place.
 *
 * Run: `npm run assets:og`. Output: `public/og/`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = resolve(process.cwd(), 'public', 'og');

const PALETTE = {
  forest950: '#061a11',
  forest900: '#0a2318',
  forest700: '#15432f',
  limeA1: '#e8e02a',
  limeA2: '#b9d41f',
  greenB1: '#2faa43',
  greenB2: '#86e04a',
  greenC1: '#3ab845',
  greenC2: '#97e84c',
  paper: '#fbfbf8',
};

/** The three-blade emblem, shared by every asset below. */
function emblem(scale = 1, flat = false) {
  return `
    <svg width="${80 * scale}" height="${104 * scale}" viewBox="0 0 80 104" fill="none">
      <defs>
        <linearGradient id="ga" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${PALETTE.limeA1}"/><stop offset="100%" stop-color="${PALETTE.limeA2}"/>
        </linearGradient>
        <linearGradient id="gb" x1="0.1" y1="0" x2="0.95" y2="1">
          <stop offset="0%" stop-color="${PALETTE.greenB1}"/><stop offset="100%" stop-color="${PALETTE.greenB2}"/>
        </linearGradient>
        <linearGradient id="gc" x1="0.1" y1="0" x2="0.95" y2="1">
          <stop offset="0%" stop-color="${PALETTE.greenC1}"/><stop offset="100%" stop-color="${PALETTE.greenC2}"/>
        </linearGradient>
      </defs>
      <path d="M6 18H10C30 21 30 63 10 66H6A4 4 0 0 1 2 62V22A4 4 0 0 1 6 18Z" fill="url(#ga)"/>
      <path d="M48 0H53C74 3 74 47 53 50H48A4 4 0 0 1 44 46V4A4 4 0 0 1 48 0Z" fill="url(#gb)"/>
      <path d="M48 54H53C74 57 74 101 53 104H48A4 4 0 0 1 44 100V58A4 4 0 0 1 48 54Z" fill="url(#gc)"/>
      ${
        flat
          ? ''
          : `
      <path d="M6 18h7c-4 8-5.8 16-5.8 24S9 58 13 66H6a4 4 0 0 1-4-4V22a4 4 0 0 1 4-4z" fill="#056a1d" opacity="0.26"/>
      <path d="M48 0h8c-4.5 8-6.8 16.5-6.8 25S51.5 42 56 50h-8a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#056a1d" opacity="0.28"/>
      <path d="M48 54h8c-4.5 8-6.8 16.5-6.8 25S51.5 96 56 104h-8a4 4 0 0 1-4-4V58a4 4 0 0 1 4-4z" fill="#056a1d" opacity="0.28"/>`
      }
    </svg>`;
}

/** Perspective rows of modules, matching the site's hero artwork. */
function solarRows(width, height, horizon) {
  const rows = [];
  const count = 16;
  for (let i = 0; i < count; i += 1) {
    const t0 = i / count;
    const t1 = (i + 0.6) / count;
    const y = (t) => horizon + (height - horizon) * (1 - t) ** 2.1;
    const yN = y(t0);
    const yF = y(t1);
    if (yF <= horizon + 1) continue;
    const hw = (yy) => (yy - horizon) * 2.4;
    const cx = width * 0.5;
    rows.push(
      `<polygon points="${cx - hw(yN)},${yN} ${cx + hw(yN)},${yN} ${cx + hw(yF)},${yF} ${cx - hw(yF)},${yF}" fill="#15323c" opacity="${(0.9 - t0 * 0.5).toFixed(3)}"/>` +
        `<polygon points="${cx - hw(yF)},${yF} ${cx + hw(yF)},${yF} ${cx + hw(yF) * 0.99},${yF - 2} ${cx - hw(yF) * 0.99},${yF - 2}" fill="#d8c08a" opacity="${(0.4 - t0 * 0.3).toFixed(3)}"/>`,
    );
  }
  return rows.join('');
}

/**
 * Fonts are inlined as data URIs rather than referenced by `file://`. Chromium
 * refuses cross-scheme font loads from a `setContent` document, which silently
 * drops the face and renders the headline in the serif fallback — subtle enough
 * to ship unnoticed if the output is never actually looked at.
 */
const FONT_FACE = [
  ['Archivo', 'public/fonts/archivo-latin-var.woff2'],
  ['Inter', 'public/fonts/inter-latin-var.woff2'],
]
  .map(([family, file]) => {
    const data = readFileSync(resolve(process.cwd(), file)).toString('base64');
    return `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${data}) format('woff2-variations');font-weight:100 900;font-style:normal;}`;
  })
  .join('\n');

function ogHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${FONT_FACE}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px; height: 630px; position: relative; overflow: hidden;
      background: ${PALETTE.forest950};
      font-family: 'Inter', system-ui, sans-serif;
      color: #fff;
    }
    .sky { position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 40% 55% at 82% 72%, rgba(255,214,150,0.5), transparent 70%),
        linear-gradient(170deg, #071d2c 0%, #10364a 42%, #2f4a44 72%, #6b5a3c 100%);
    }
    .rows { position: absolute; inset: 0; }
    .scrim { position: absolute; inset: 0;
      background: linear-gradient(100deg, rgba(6,26,17,0.96) 0%, rgba(6,26,17,0.84) 44%, rgba(6,26,17,0.34) 100%);
    }
    .content { position: relative; height: 100%; padding: 68px 72px; display: flex; flex-direction: column; justify-content: space-between; }
    .top { display: flex; align-items: center; gap: 22px; }
    .word { font-family: 'Archivo'; font-weight: 800; font-size: 34px; letter-spacing: 0.01em; text-transform: uppercase;
      background: linear-gradient(103deg, #9ee34f 10%, #e6f7cf 92%); -webkit-background-clip: text; color: transparent; line-height: 1; }
    .sub { font-family: 'Archivo'; font-weight: 700; font-size: 14px; letter-spacing: 0.24em; text-transform: uppercase; color: #fff; margin-top: 5px; }
    .slogan { font-family: 'Archivo'; font-weight: 700; font-size: 86px; line-height: 0.96; letter-spacing: -0.035em; max-width: 15ch; }
    .headline { font-size: 27px; font-weight: 500; color: #9ee34f; margin-top: 22px; letter-spacing: -0.01em; }
    .foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px;
      border-top: 1px solid rgba(255,255,255,0.18); padding-top: 22px; }
    .foot p { font-size: 17px; color: #bccfc0; max-width: 62ch; line-height: 1.45; }
    .domain { font-size: 15px; letter-spacing: 0.18em; text-transform: uppercase; color: #9ee34f; white-space: nowrap; font-weight: 600; }
  </style></head><body>
    <div class="sky"></div>
    <svg class="rows" viewBox="0 0 1200 630" preserveAspectRatio="none">${solarRows(1200, 630, 300)}</svg>
    <div class="scrim"></div>
    <div class="content">
      <div class="top">
        ${emblem(0.62)}
        <div>
          <div class="word">Yala</div>
          <div class="sub">Energy Limited</div>
        </div>
      </div>
      <div>
        <div class="slogan">Powering a Greener Future.</div>
        <div class="headline">Renewable Energy. Engineered to Perform.</div>
      </div>
      <div class="foot">
        <p>Renewable-energy project development and PV &amp; BESS engineering, design, simulation and consulting.</p>
        <div class="domain">yalaenergy.co.zm</div>
      </div>
    </div>
  </body></html>`;
}

function iconHtml(size, maskable = false) {
  // A maskable icon must keep its artwork inside the safe zone — the outer 10%
  // on each edge can be cropped to any shape by the platform.
  const pad = maskable ? 0.3 : 0.18;
  const radius = maskable ? 0 : size * 0.19;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; padding: 0; }
    body { width: ${size}px; height: ${size}px; display: grid; place-items: center;
      background: ${PALETTE.forest900}; border-radius: ${radius}px; overflow: hidden; }
    svg { width: ${Math.round(size * (1 - pad * 2) * 0.86)}px; height: auto; }
  </style></head><body>${emblem(1, true)}</body></html>`;
}

function logoHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${FONT_FACE}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 600px; height: 600px; display: grid; place-items: center; background: ${PALETTE.paper}; }
    .lockup { display: flex; align-items: center; gap: 22px; }
    .word { font-family: 'Archivo'; font-weight: 800; font-size: 60px; text-transform: uppercase; line-height: 1;
      background: linear-gradient(103deg, #0f7a28 8%, #57c22a 92%); -webkit-background-clip: text; color: transparent; }
    .sub { font-family: 'Archivo'; font-weight: 700; font-size: 23px; letter-spacing: 0.235em; text-transform: uppercase; color: #11150f; margin-top: 8px; }
  </style></head><body>
    <div class="lockup">${emblem(1.5)}<div><div class="word">Yala</div><div class="sub">Energy Ltd</div></div></div>
  </body></html>`;
}

const TARGETS = [
  { file: 'yala-energy-default.png', html: ogHtml(), width: 1200, height: 630 },
  { file: 'yala-energy-logo.png', html: logoHtml(), width: 600, height: 600 },
  { file: 'apple-touch-icon.png', html: iconHtml(180), width: 180, height: 180 },
  { file: 'icon-192.png', html: iconHtml(192), width: 192, height: 192 },
  { file: 'icon-512.png', html: iconHtml(512), width: 512, height: 512 },
  { file: 'icon-maskable-512.png', html: iconHtml(512, true), width: 512, height: 512 },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const target of TARGETS) {
    const page = await browser.newPage({
      viewport: { width: target.width, height: target.height },
      deviceScaleFactor: 1,
    });
    await page.setContent(target.html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const buffer = await page.screenshot({ type: 'png', omitBackground: false });
    await writeFile(resolve(OUT, target.file), buffer);
    await page.close();
    console.log(`  wrote public/og/${target.file}  (${target.width}×${target.height})`);
  }

  await browser.close();
  console.log('\nDone. Social image and icons regenerated.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
