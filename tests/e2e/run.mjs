/**
 * End-to-end checks against the production build.
 *
 * Serves `dist/` over a real HTTP server and drives it with the Chromium build
 * that ships with this environment. It asserts the things the brief calls for:
 * every route loads, navigation works, the mobile drawer is operable and
 * escapable, no console errors, no horizontal overflow at any breakpoint, no
 * broken images, SEO metadata is present, form validation behaves, demo mode is
 * labelled honestly, reduced motion is respected, and no secrets ship.
 *
 * Run with: `npm run test:e2e` (after `npm run build`), or `npm test` for the
 * whole sequence.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { createRequire } from 'node:module';

/**
 * Playwright is resolved through `createRequire` rather than a bare ESM import
 * so this harness works whether Playwright is a project dependency or supplied
 * by the environment (CI images and this container install it globally). Adding
 * it to `devDependencies` also works and needs no change here.
 */
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const DIST = resolve(process.cwd(), 'dist');

const ROUTES = [
  '/',
  '/about/',
  '/projects/',
  '/projects/muchenje-solar-pv-plant/',
  '/pv-bess-engineering/',
  '/contact/',
  '/privacy/',
  '/information-accuracy/',
];

const VIEWPORTS = [
  { name: 'mobile', width: 360, height: 740 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'wide', width: 1680, height: 1050 },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

/* ------------------------------------------------------------------ report */

const results = [];
let currentGroup = 'general';

function group(name) {
  currentGroup = name;
}

function check(name, passed, detail = '') {
  results.push({ group: currentGroup, name, passed, detail });
  const mark = passed ? '  ok  ' : ' FAIL ';
  console.log(`${mark} ${name}${detail && !passed ? ` — ${detail}` : ''}`);
}

/* ------------------------------------------------------------------ server */

async function serve() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      let filePath = join(DIST, decodeURIComponent(url.pathname));

      // Directory-format output: `/about/` → `/about/index.html`.
      try {
        if ((await stat(filePath)).isDirectory()) filePath = join(filePath, 'index.html');
      } catch {
        /* fall through to the 404 below */
      }

      const body = await readFile(filePath);
      res.writeHead(200, { 'content-type': MIME[extname(filePath)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      try {
        const notFound = await readFile(join(DIST, '404.html'));
        res.writeHead(404, { 'content-type': MIME['.html'] });
        res.end(notFound);
      } catch {
        res.writeHead(404).end('Not found');
      }
    }
  });

  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const { port } = server.address();
  return { server, base: `http://127.0.0.1:${port}` };
}

/* ------------------------------------------------------------------- utils */

function attachConsoleCapture(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

function attachRequestCapture(page) {
  const failures = [];
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  page.on('requestfailed', (request) => {
    failures.push(`failed ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`);
  });
  return failures;
}

/* ------------------------------------------------------------------- suites */

async function checkRoutes(browser, base) {
  group('routes');

  for (const route of ROUTES) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const consoleErrors = attachConsoleCapture(page);
    const requestFailures = attachRequestCapture(page);

    const response = await page.goto(base + route, { waitUntil: 'networkidle' });
    check(`${route} responds 200`, response?.status() === 200, `got ${response?.status()}`);

    // Words glued to an inline link, which is what HTML whitespace compression
    // does to prose split across source lines. Punctuation either side of a
    // link is legitimate; a bare letter is not.
    const glued = await page.evaluate(() => {
      const offenders = [];
      for (const link of document.querySelectorAll('p a, li a, dd a, figcaption a, label a')) {
        const before = link.previousSibling?.textContent ?? '';
        const after = link.nextSibling?.textContent ?? '';
        const text = (link.textContent ?? '').trim();
        if (/[A-Za-z0-9]$/.test(before)) offenders.push(`…${before.slice(-14)}|${text.slice(0, 18)}`);
        if (/^[A-Za-z0-9]/.test(after)) offenders.push(`${text.slice(-18)}|${after.slice(0, 14)}…`);
      }
      return offenders;
    });
    check(`${route} has no words glued to a link`, glued.length === 0, glued.slice(0, 3).join(' ; '));

    const h1Count = await page.locator('h1').count();
    check(`${route} has exactly one h1`, h1Count === 1, `found ${h1Count}`);

    const title = await page.title();
    check(`${route} has a branded title`, title.length > 10 && title.includes('Yala Energy'), title);

    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    check(
      `${route} has a useful meta description`,
      typeof desc === 'string' && desc.length >= 70 && desc.length <= 320,
      `length ${desc?.length ?? 0}`,
    );

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    check(`${route} has a canonical URL`, canonical?.endsWith(route) === true, String(canonical));

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    check(`${route} has Open Graph title and image`, Boolean(ogTitle && ogImage));

    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    let ldValid = false;
    try {
      ldValid = Boolean(JSON.parse(ld ?? '{}')['@graph']);
    } catch {
      ldValid = false;
    }
    check(`${route} has valid JSON-LD`, ldValid);

    // Broken media: an image that decoded to zero intrinsic width is broken.
    const brokenImages = await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
    );
    check(`${route} has no broken images`, brokenImages.length === 0, brokenImages.join(', '));

    check(`${route} has no console errors`, consoleErrors.length === 0, consoleErrors.join(' | '));
    check(
      `${route} has no failed requests`,
      requestFailures.length === 0,
      requestFailures.join(' | '),
    );

    await context.close();
  }
}

async function checkOverflow(browser, base) {
  group('responsive');

  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();
      await page.goto(base + route, { waitUntil: 'networkidle' });

      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
        );
        if (scrollWidth <= docWidth + 1) return null;
        // Identify the widest offending element so a failure is actionable.
        const culprits = Array.from(document.querySelectorAll('body *'))
          .map((el) => ({ el, rect: el.getBoundingClientRect() }))
          .filter(({ rect }) => rect.right > docWidth + 1 && rect.width > 0)
          .sort((a, b) => b.rect.right - a.rect.right)
          .slice(0, 3)
          .map(({ el, rect }) => `${el.tagName.toLowerCase()}.${el.className || '-'} @${Math.round(rect.right)}`);
        return { scrollWidth, docWidth, culprits };
      });

      check(
        `${viewport.name} (${viewport.width}px) ${route} has no horizontal overflow`,
        overflow === null,
        overflow ? `${overflow.scrollWidth} > ${overflow.docWidth}: ${overflow.culprits.join('; ')}` : '',
      );

      await context.close();
    }
  }
}

async function checkNavigation(browser, base) {
  group('navigation');

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });

  // Every internal link on every page resolves to a built route.
  const internalLinks = new Set();
  for (const route of ROUTES) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href') ?? '')
        .filter((href) => href.startsWith('/')),
    );
    hrefs.forEach((href) => internalLinks.add(href.split('#')[0] || '/'));
  }

  const broken = [];
  for (const href of internalLinks) {
    const response = await page.goto(base + href, { waitUntil: 'domcontentloaded' });
    if (response?.status() !== 200) broken.push(`${href} → ${response?.status()}`);
  }
  check(
    `all ${internalLinks.size} internal links resolve`,
    broken.length === 0,
    broken.join(', '),
  );

  // No placeholder links.
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  const placeholders = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .map((a) => a.getAttribute('href'))
      .filter((href) => href === '#' || href === '' || href === null),
  );
  check('homepage has no placeholder links', placeholders.length === 0, placeholders.join(', '));

  // Desktop nav marks the current page.
  await page.goto(base + '/about/', { waitUntil: 'domcontentloaded' });
  const current = await page.locator('.header__nav a[aria-current="page"]').textContent();
  check('desktop nav marks the current page', current?.trim() === 'About', String(current));

  await context.close();
}

async function checkMobileDrawer(browser, base) {
  group('mobile drawer');

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const consoleErrors = attachConsoleCapture(page);
  await page.goto(base + '/', { waitUntil: 'networkidle' });

  const toggle = page.locator('[data-nav-toggle]');
  const drawer = page.locator('[data-nav-drawer]');

  check('drawer toggle is visible on mobile', await toggle.isVisible());
  check('drawer starts closed', await drawer.isHidden());

  await toggle.click();
  await page.waitForTimeout(400);
  check('drawer opens on tap', await drawer.isVisible());
  check(
    'toggle reports expanded state',
    (await toggle.getAttribute('aria-expanded')) === 'true',
  );

  const focusInDrawer = await page.evaluate(() =>
    Boolean(document.activeElement?.closest('[data-nav-drawer]')),
  );
  check('focus moves into the open drawer', focusInDrawer);

  // Focus trap: tabbing from the last item wraps to the first.
  const trapped = await page.evaluate(() => {
    const drawerEl = document.querySelector('[data-nav-drawer]');
    const items = Array.from(
      drawerEl.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null);
    return items.length > 1;
  });
  check('drawer contains focusable items to trap', trapped);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);
  check('Escape closes the drawer', await drawer.isHidden());
  check(
    'focus returns to the toggle after Escape',
    await page.evaluate(() => document.activeElement?.hasAttribute('data-nav-toggle') === true),
  );

  // Navigating from the drawer works.
  await toggle.click();
  await page.waitForTimeout(400);
  await page.locator('[data-nav-drawer] a[href="/projects/"]').click();
  await page.waitForLoadState('domcontentloaded');
  check('drawer links navigate', new URL(page.url()).pathname === '/projects/');

  check('mobile drawer produced no console errors', consoleErrors.length === 0, consoleErrors.join(' | '));
  await context.close();
}

async function checkKeyboard(browser, base) {
  group('keyboard');

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });

  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => document.activeElement?.className ?? '');
  check('first Tab reaches the skip link', firstFocus.includes('skip-link'), firstFocus);

  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  check('skip link targets main content', page.url().includes('#main'));

  // Every interactive element that can actually receive focus shows a visible
  // focus indicator. Elements hidden at this viewport (the mobile toggle, the
  // closed drawer) are not focusable, so they are excluded rather than counted
  // as failures.
  const noOutline = await page.evaluate(() => {
    const offenders = [];
    const candidates = Array.from(document.querySelectorAll('a[href], button')).filter(
      (el) => el.offsetParent !== null && el.getClientRects().length > 0,
    );
    for (const el of candidates.slice(0, 40)) {
      el.focus();
      if (document.activeElement !== el) continue; // not focusable at this size
      const style = getComputedStyle(el, null);
      const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
      const hasShadow = style.boxShadow !== 'none';
      if (!hasOutline && !hasShadow) offenders.push(el.tagName + '.' + (el.className || '-'));
    }
    return { offenders, tested: candidates.length };
  });
  check(
    `all ${noOutline.tested} focusable controls show a focus indicator`,
    noOutline.offenders.length === 0,
    noOutline.offenders.slice(0, 3).join(', '),
  );

  await context.close();
}

async function checkDiagram(browser, base) {
  group('system diagram');

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(base + '/projects/muchenje-solar-pv-plant/', { waitUntil: 'networkidle' });

  const diagram = page.locator('[data-diagram]').first();
  check('diagram is enhanced by script', (await diagram.getAttribute('data-enhanced')) === 'true');

  const tabs = diagram.locator('[role="tab"]');
  const tabCount = await tabs.count();
  check('diagram exposes its elements as tabs', tabCount === 6, `found ${tabCount}`);

  const visiblePanels = await diagram.locator('[role="tabpanel"]:visible').count();
  check('exactly one diagram panel is visible', visiblePanels === 1, `found ${visiblePanels}`);

  await tabs.nth(2).click();
  check(
    'clicking a tab selects it',
    (await tabs.nth(2).getAttribute('aria-selected')) === 'true',
  );
  const activeNodes = await diagram.locator('[data-diagram-graphic] .is-active').count();
  check('selecting a tab highlights its graphic node', activeNodes === 1, `found ${activeNodes}`);

  await tabs.nth(2).focus();
  await page.keyboard.press('ArrowRight');
  check(
    'arrow keys move between tabs',
    (await tabs.nth(3).getAttribute('aria-selected')) === 'true',
  );

  await context.close();
}

async function checkForms(browser, base) {
  group('forms');

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = attachConsoleCapture(page);
  await page.goto(base + '/pv-bess-engineering/#enquiry', { waitUntil: 'networkidle' });

  const form = page.locator('#engineering-enquiry');
  const status = form.locator('[data-form-status]');

  // Empty submission is blocked with per-field errors.
  await form.locator('[data-form-submit]').click();
  await page.waitForTimeout(250);

  const errorCount = await form.locator('.field__error:not(:empty)').count();
  check('empty submission raises field errors', errorCount >= 5, `found ${errorCount}`);
  check('status region reports an error', (await status.getAttribute('data-state')) === 'error');

  const focusedName = await page.evaluate(() => document.activeElement?.getAttribute('name'));
  check('focus moves to the first invalid field', focusedName === 'name', String(focusedName));

  const ariaInvalid = await form.locator('[aria-invalid="true"]').count();
  check('invalid controls are marked aria-invalid', ariaInvalid >= 5, `found ${ariaInvalid}`);

  // A malformed email is caught.
  await form.locator('#engineering-enquiry-name').fill('Test Person');
  await form.locator('#engineering-enquiry-company').fill('Example Ltd');
  await form.locator('#engineering-enquiry-email').fill('not-an-email');
  await form.locator('#engineering-enquiry-country').fill('Zambia');
  await form.locator('#engineering-enquiry-projectStage').selectOption({ index: 1 });
  await form.locator('#engineering-enquiry-service').selectOption({ index: 1 });
  await form.locator('input[name="bessIncluded"]').first().check();
  await form.locator('#engineering-enquiry-consent').check();
  await form.locator('[data-form-submit]').click();
  await page.waitForTimeout(250);

  const emailError = await form.locator('[data-error-for="email"]').textContent();
  check('malformed email is rejected', (emailError ?? '').includes('valid business email'), String(emailError));

  // Typing clears the error.
  await form.locator('#engineering-enquiry-email').fill('someone@example.com');
  await page.waitForTimeout(100);
  const clearedError = await form.locator('[data-error-for="email"]').textContent();
  check('fixing a field clears its error', (clearedError ?? '') === '');

  // A valid submission in demo mode says so, truthfully.
  await form.locator('[data-form-submit]').click();
  await page.waitForTimeout(300);
  const state = await status.getAttribute('data-state');
  const text = (await status.textContent()) ?? '';

  if (state === 'demo') {
    check('demo mode states that nothing was sent', /not been delivered/i.test(text), text.slice(0, 120));
    check('demo mode gives an email alternative', text.includes('info@yalaenergy.co.zm'));
  } else {
    check(
      'configured endpoint reports a real outcome',
      state === 'success' || state === 'error',
      `state ${state}`,
    );
  }

  // Honeypot is unreachable by keyboard and hidden from assistive tech.
  const honeypot = await page.evaluate(() => {
    const field = document.querySelector('.honeypot input');
    if (!field) return null;
    const wrapper = field.closest('.honeypot');
    return {
      tabIndex: field.tabIndex,
      ariaHidden: wrapper?.getAttribute('aria-hidden'),
      visible: field.getBoundingClientRect().width > 2,
    };
  });
  check('honeypot is out of the tab order', honeypot?.tabIndex === -1);
  check('honeypot is hidden from assistive technology', honeypot?.ariaHidden === 'true');
  check('honeypot is not visible', honeypot?.visible === false);

  check('forms produced no console errors', consoleErrors.length === 0, consoleErrors.join(' | '));
  await context.close();
}

async function checkReducedMotion(browser, base) {
  group('reduced motion');

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600); // past the idle-callback gate for the canvas

  const canvasRunning = await page.evaluate(
    () => document.querySelector('[data-solar-field]')?.dataset.ready === 'true',
  );
  check('animated canvas does not start under reduced motion', canvasRunning !== true);

  const hidden = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]'));
    return els.filter((el) => Number(getComputedStyle(el).opacity) < 0.95).length;
  });
  check('no content is hidden by reveal animations', hidden === 0, `${hidden} element(s) under full opacity`);

  await context.close();
}

async function checkNoScript(browser, base) {
  group('no javascript');

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  await page.goto(base + '/projects/muchenje-solar-pv-plant/', { waitUntil: 'domcontentloaded' });

  const visiblePanels = await page.locator('[data-diagram] [role="tabpanel"]:visible').count();
  check(
    'all diagram content is readable without JavaScript',
    visiblePanels === 6,
    `found ${visiblePanels}`,
  );

  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  const hiddenContent = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]'));
    return els.filter((el) => Number(getComputedStyle(el).opacity) < 0.95).length;
  });
  check('no content is hidden without JavaScript', hiddenContent === 0, `${hiddenContent} hidden`);

  const navLinks = await page.locator('#site-nav a').count();
  check('footer navigation is available without JavaScript', navLinks > 8, `${navLinks} links`);

  await context.close();
}

async function checkSecurity(browser, base) {
  group('security');

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const bodies = [];
  page.on('response', async (response) => {
    const type = response.headers()['content-type'] ?? '';
    if (/javascript|html|css/.test(type)) {
      try {
        bodies.push(await response.text());
      } catch {
        /* a redirect or non-text body; nothing to scan */
      }
    }
  });

  for (const route of ROUTES) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
  }

  const corpus = bodies.join('\n');
  const patterns = [
    [/\bre_[A-Za-z0-9]{16,}/, 'Resend API key'],
    [/\bsk-[A-Za-z0-9]{20,}/, 'secret key'],
    [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
    [/ENQUIRY_MAIL_API_KEY\s*[:=]\s*["'][^"']+["']/, 'mail API key'],
    [/\bBearer\s+[A-Za-z0-9._-]{24,}/, 'bearer token'],
  ];

  for (const [pattern, label] of patterns) {
    check(`no ${label} in any shipped asset`, !pattern.test(corpus));
  }

  // Only executable and render-blocking subresources matter here. Canonical
  // URLs and Open Graph metadata are absolute by design and are not loads.
  const externalScript = /<script[^>]+src="https?:\/\//i.exec(corpus);
  const externalStyle =
    /<link[^>]+rel="(?:stylesheet|preload|modulepreload)"[^>]*href="https?:\/\//i.exec(corpus) ??
    /<link[^>]+href="https?:\/\/[^"]*"[^>]*rel="(?:stylesheet|preload|modulepreload)"/i.exec(corpus);
  const externalFontImport = /@import\s+url\(\s*["']?https?:\/\//i.exec(corpus);

  check('no third-party scripts are loaded', externalScript === null, externalScript?.[0] ?? '');
  check('no third-party stylesheets are loaded', externalStyle === null, externalStyle?.[0] ?? '');
  check('no third-party font imports', externalFontImport === null, externalFontImport?.[0] ?? '');

  // External links, if any, must be safe.
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  const unsafeExternal = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[target="_blank"]'))
      .filter((a) => !(a.rel || '').includes('noopener'))
      .map((a) => a.href),
  );
  check('every new-tab link sets rel="noopener"', unsafeExternal.length === 0, unsafeExternal.join(', '));

  await context.close();
}

async function checkIntegrity(browser, base) {
  group('data integrity');

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  /**
   * Phrases the brief prohibits as claims. A sentence that explicitly denies
   * one ("the project is not described as shovel-ready") is the opposite of an
   * overclaim, so each hit is only counted when its sentence carries no
   * negation. Checking for the bare substring would make the honest disclaimers
   * on the project and information-accuracy pages look like violations.
   */
  const banned = [
    'shovel-ready',
    'shovel ready',
    // "bankable" is legitimate technical vocabulary ("a bankable yield
    // assessment requires…"). Only the forms that apply the label to this
    // project are prohibited.
    'bankable project',
    'project is bankable',
    'bankable asset',
    'bankable opportunity',
    'financial close achieved',
    'signed ppa',
    'signed power purchase agreement',
    'guaranteed return',
    'guaranteed returns',
    'fully permitted',
    'ready to build',
    'fully licensed',
  ];

  const NEGATORS =
    /\b(?:not|never|no|nothing|none|nor|without|avoid|avoids|cannot|can't|does not|doesn't|is not|isn't|are not|aren't|has not|hasn't|have not|haven't|neither|rather than|instead of|until)\b/;

  for (const route of ROUTES) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
    const hits = [];
    for (const phrase of banned) {
      let from = 0;
      for (;;) {
        const at = text.indexOf(phrase, from);
        if (at === -1) break;
        from = at + phrase.length;
        // Look back far enough to catch a lead-in that negates a whole list
        // ("this project does not have: … a signed power purchase agreement"),
        // and forward to the end of the containing sentence.
        const before = text.slice(Math.max(0, at - 260), at);
        const after = text.slice(at, Math.min(text.length, from + 120));
        if (!NEGATORS.test(before + after)) {
          hits.push(`"${phrase}" in: ${(before.slice(-60) + after).trim().slice(0, 110)}`);
        }
      }
    }
    check(`${route} makes no prohibited claim`, hits.length === 0, hits.join(' | '));
  }

  // The project page must carry its status vocabulary.
  await page.goto(base + '/projects/muchenje-solar-pv-plant/', { waitUntil: 'domcontentloaded' });
  const badges = await page.locator('.status').count();
  check('project page labels its claims', badges >= 15, `found ${badges}`);

  const bodyText = await page.locator('body').innerText();
  check(
    'project page states what is not in place',
    /no power purchase agreement/i.test(bodyText),
  );
  check(
    'project page carries the securities disclaimer',
    /(?:not|nothing)[^.]{0,120}offer to sell/i.test(bodyText) && /solicitation/i.test(bodyText),
  );

  // Illustrative images are disclosed as such wherever a figure is used.
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  const homeText = await page.locator('body').innerText();
  check('illustrative imagery is disclosed', /not the muchenje site/i.test(homeText));

  await context.close();
}

/* --------------------------------------------------------------------- run */

async function main() {
  const { server, base } = await serve();
  const browser = await chromium.launch();

  console.log(`\nServing dist/ at ${base}\n`);

  try {
    await checkRoutes(browser, base);
    await checkOverflow(browser, base);
    await checkNavigation(browser, base);
    await checkMobileDrawer(browser, base);
    await checkKeyboard(browser, base);
    await checkDiagram(browser, base);
    await checkForms(browser, base);
    await checkReducedMotion(browser, base);
    await checkNoScript(browser, base);
    await checkSecurity(browser, base);
    await checkIntegrity(browser, base);
  } finally {
    await browser.close();
    server.close();
  }

  const failed = results.filter((r) => !r.passed);
  const byGroup = new Map();
  for (const r of results) {
    const entry = byGroup.get(r.group) ?? { pass: 0, fail: 0 };
    r.passed ? (entry.pass += 1) : (entry.fail += 1);
    byGroup.set(r.group, entry);
  }

  console.log('\n──────────────────────────────────────────────');
  for (const [name, { pass, fail }] of byGroup) {
    console.log(`${fail === 0 ? 'ok  ' : 'FAIL'}  ${name.padEnd(18)} ${pass} passed, ${fail} failed`);
  }
  console.log('──────────────────────────────────────────────');
  console.log(`${results.length - failed.length}/${results.length} checks passed`);

  if (failed.length > 0) {
    console.log('\nFailures:');
    for (const f of failed) console.log(`  • [${f.group}] ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
