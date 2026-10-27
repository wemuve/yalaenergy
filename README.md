# Yala Energy Limited — website

**Powering a Greener Future.**

The website for Yala Energy Limited: a Zambian renewable-energy project
developer and PV & BESS engineering consultancy, developing the proposed
Muchenje Solar PV Plant in Chibombo District.

Built as a static Astro site — no runtime framework, no third-party scripts, no
tracking, no cookies. Every page is HTML on arrival; JavaScript only adds
enhancement on top.

---

## Quick start

```bash
npm install          # Node 20.9+ (this build is pinned to Astro 7.0.0)
npm run dev          # http://localhost:4321
npm run build        # static output into dist/
npm run preview      # serve the built output
npm test             # unit tests → build → end-to-end tests
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run check` | Astro + TypeScript diagnostics |
| `npm run test:unit` | Validation and handler tests (`node --test`) |
| `npm run test:e2e` | Browser checks against `dist/` (needs a build first) |
| `npm test` | The full sequence |
| `npm run assets:og` | Regenerate the social image and PWA icons |

---

## The two things to add

### 1. The official logo

Drop the official artwork at **`public/brand/yala-energy-logo.svg`** (preferred)
or `.png`. `src/components/Logo.astro` detects it at build time and uses it
everywhere automatically.

Until it is there, the component renders a vector reconstruction of the mark —
the three leaf blades in the brand's yellow and greens, the "YALA" wordmark in
the green gradient, "ENERGY LIMITED" in charcoal. Close, but it is a
reconstruction; use the real file.

After adding it, run `npm run assets:og` to regenerate the favicon-adjacent
raster assets.

### 2. The photographs

Drop the source photographs into **`src/assets/media/`** with these exact
filenames:

| Filename | Used on |
| --- | --- |
| `aerial-solar-plant.jpg` | Homepage flagship, Projects card, Muchenje hero, Engineering band |
| `panel-row-dusk.jpg` | Homepage hero (the LCP image), Projects hero |
| `array-sun-glint.jpg` | About hero, Muchenje scale band, Homepage closing CTA |
| `module-detail.jpg` | Engineering hero, Contact hero |

JPEG or PNG, at least 1920 px on the long edge. **Do not pre-convert** — Astro
generates AVIF and WebP at several widths with intrinsic dimensions set.

Until the files are there, every slot falls back to an illustrated vector scene
at the identical size. Nothing 404s, no layout shifts and no build fails, so
adding the files is the only step. See `src/assets/media/README.md`.

> **The caption rule.** None of these photographs show the Muchenje site, so
> `src/data/media.ts` marks each one `siteSpecific: false` and every figure
> prints *"Illustrative photograph … Not the Muchenje site."* Do not flip that
> flag on an image that is not actually of a Yala Energy asset.

---

## Contact forms

Forms have three modes, chosen by one environment variable.

### Demo mode (the default)

With `PUBLIC_ENQUIRY_ENDPOINT` unset, the forms validate fully and then say, on
screen, that **nothing was sent** and where to email instead. The site never
implies a message was delivered when it was not.

### Live mode

Set `PUBLIC_ENQUIRY_ENDPOINT` to your handler's URL. Submissions are POSTed as
JSON and the real outcome — success, per-field server errors, or failure — is
reported to the visitor.

### No JavaScript

The `<form>` falls back to a `mailto:` action with the subject prefilled, and a
visible note explains it.

### The handler

`server/enquiry-handler.mjs` is a dependency-free `Request → Response` function.
It is **not** part of the website bundle — nothing under `src/` imports it, so
no secret it reads can reach the browser.

It provides: an origin allow-list, a body-size cap, server-side validation via
the same module the browser uses, honeypot and submission-timing checks, per-IP
rate limiting, header-injection guards, and responses that never echo submitted
content.

Deploy it as a function:

```js
// Vercel — api/enquiry.js
export { default } from '../server/enquiry-handler.mjs';
export const config = { runtime: 'edge' };
```

```js
// Netlify — netlify/functions/enquiry.mjs
import { handleEnquiry } from '../../server/enquiry-handler.mjs';
export default (request) => handleEnquiry(request, Netlify.env.toObject());
export const config = { path: '/api/enquiry' };
```

```js
// Cloudflare Workers
import { handleEnquiry } from './server/enquiry-handler.mjs';
export default { fetch: (request, env) => handleEnquiry(request, env) };
```

Then set `PUBLIC_ENQUIRY_ENDPOINT` to that route and rebuild.

Delivery goes through Resend by default; swap the `fetch` in `deliver()` for
Postmark, SES or anything else — nothing else in the file depends on it.

> The rate limiter is in-memory, which is right for one long-lived instance. On
> a platform that scales to many short-lived instances, back it with a shared
> store (Upstash, Workers KV, Redis).

### Environment variables

Copy `.env.example` to `.env`. Only `PUBLIC_*` values reach the browser.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `SITE_URL` | build | Canonical origin for sitemap, canonicals and OG URLs |
| `PUBLIC_ENQUIRY_ENDPOINT` | browser | Form endpoint; empty = demo mode |
| `ENQUIRY_TO_ADDRESS` | server | Where enquiries are delivered |
| `ENQUIRY_MAIL_API_KEY` | server | Mail provider key — **never** `PUBLIC_` |
| `ENQUIRY_ALLOWED_ORIGINS` | server | Comma-separated origins allowed to POST |

---

## Project structure

```
src/
  assets/media/      Photographs (drop files here — see its README)
  components/        Astro components; styles are scoped to each file
  data/              All copy and facts, typed, each claim with a status
  layouts/           BaseLayout (SEO, JSON-LD) and LegalLayout
  lib/
    enquiry.mjs      Form schema + validation, shared browser/server/tests
    perspective.ts   Ground-plane maths for the artwork and canvas
  pages/             One file per route
  scripts/           Client enhancements (nav, reveal, counters, forms, canvas)
  styles/            tokens → base → layout → components → patterns → forms
server/              Enquiry handler (not bundled into the site)
scripts/             Build-time asset generation and screenshot utility
tests/unit/          node --test
tests/e2e/           Playwright checks against dist/
docs/                Verification checklist
```

### Content lives in `src/data/`

Copy is not scattered through markup. `site.ts`, `company.ts`, `project.ts`,
`services.ts` and `media.ts` hold it, typed. Changing a capacity figure or a
biography is a one-line edit in one file.

---

## How claims are labelled

Every substantive factual claim carries a status, defined in `src/data/types.ts`
and explained to visitors at `/information-accuracy/`:

| Status | Meaning |
| --- | --- |
| `confirmed` | Documented and verifiable |
| `supplied` | Company-stated; documentation under review |
| `estimate` | Sponsor estimate requiring validation |
| `assumption` | Working assumption of the current concept |
| `in-progress` | Under way, not complete |
| `outstanding` | Not secured, applied for or agreed |

This is enforced, not just intended: `tests/e2e/run.mjs` fails the build if a
page makes a prohibited claim ("shovel-ready", "signed PPA", "guaranteed
returns" and similar) outside an explicit denial, if the project page drops its
status badges or its securities disclaimer, or if illustrative imagery loses its
disclosure.

**Before launch, work through `docs/verification-checklist.md`.** It lists every
claim on the site that needs company confirmation.

---

## Design system

Plain CSS with design tokens in `src/styles/tokens.css` — no utility framework.
Global layers set the system; each component scopes its own styles.

- **Colour** — forest green, lime accent, charcoal, warm white, restrained grey.
  Lime is an accent and a large-graphic colour; it is never body text on light,
  where it would fail contrast.
- **Type** — Archivo (display) and Inter (body), self-hosted variable fonts,
  latin subset, 83 kB total. Fluid scale from `--step--2` to `--step-6`.
- **Rhythm** — full-bleed "stages" alternate paper / sunken / ink. Sections are
  built from rules, grids and typography rather than from cards.
- **Motion** — scroll reveals, a count-up on metrics, a drifting light layer on
  the hero. All of it disabled under `prefers-reduced-motion`, and none of it
  gates content.

### The hero's 3D layer

The animated solar field (`src/scripts/solar-field.ts`) is a hand-written
perspective renderer on a 2D canvas, about 3 kB. A WebGL build of the same
decorative effect costs 150 kB+ on the homepage's critical path, so the depth is
computed directly and the budget stays with the content.

It starts transparent and fades in only after drawing a frame, and it never runs
under reduced motion, below 768 px, on fewer than 4 CPU cores, with data-saver
on, in a background tab, or when scrolled out of view. The photograph underneath
is never removed.

---

## Accessibility

Targets WCAG 2.2 AA.

- Skip link, one `<h1>` per page, ordered headings, landmarks.
- Mobile drawer is a real focus trap with Escape and focus restoration.
- The system diagram is a `tablist` with arrow-key navigation; with JavaScript
  off, all six panels render as a readable list.
- Form errors are per-field, `aria-invalid`, `aria-describedby`, announced via a
  live region, and focus moves to the first invalid field.
- Count-up animations keep the real number in the DOM and mark the animating
  span `aria-hidden`.
- Honeypot is removed from the accessibility tree and the tab order.
- Reveal animations have a print handler and a 6-second safety net, so content
  can never stay invisible.

---

## Performance

- Static HTML, no hydration, no framework runtime.
- One small JS entry; the canvas layer is a separate lazy chunk behind an
  idle callback.
- Self-hosted preloaded fonts — no third-party connection on any page.
- AVIF/WebP with responsive widths and intrinsic dimensions; the hero image is
  the only eager, high-priority one.
- No analytics, cookies or embeds.

---

## Deployment

Static output — any host works.

```bash
npm ci && npm run build   # output: dist/
```

| Host | Settings |
| --- | --- |
| Netlify | build `npm run build`, publish `dist` |
| Vercel | framework Astro, output `dist` |
| Cloudflare Pages | build `npm run build`, output `dist` |
| Any web server | serve `dist/` as the document root |

Set `SITE_URL` in the build environment so canonicals, the sitemap and OG URLs
point at the real origin. `trailingSlash: 'always'` — if your host rewrites
URLs, keep it consistent or canonicals will drift.

`public/robots.txt` points at `/sitemap-index.xml`, which `@astrojs/sitemap`
generates on every build. Serve `dist/404.html` for unmatched routes.

Recommended response headers:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; img-src 'self' data:;
  style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';
  frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

`'unsafe-inline'` covers Astro's scoped `<style>` blocks, the JSON-LD block and
the two-line inline bootstrap script. Replace it with hashes or a nonce if your
host can generate them.

---

## Testing

`npm test` runs unit tests, builds, then runs the browser suite.

**Unit** (`node --test`) — email and field validation, length limits, header
injection, honeypot and timing logic, schema integrity, and the handler's
method/origin/payload/spam/rate-limit/delivery paths.

**End-to-end** (Playwright against the built `dist/`) — every route's status,
headings, metadata, canonical, Open Graph and JSON-LD; broken images; console
errors and failed requests; horizontal overflow at 360/768/1280/1680; every
internal link; the mobile drawer; keyboard and focus; the diagram widget; form
validation and demo-mode honesty; reduced motion; the no-JavaScript experience;
secret scanning across shipped assets; and the data-integrity rules above.

Playwright is resolved through `createRequire`, so it works whether it is a
project dependency or supplied by the environment. To pin it locally:
`npm i -D playwright && npx playwright install chromium`.

---

## Licences

Site code: © Yala Energy Limited. Fonts: Archivo and Inter, SIL Open Font
License 1.1 (`public/fonts/README.md`). All illustrated artwork in
`src/components/SolarFieldScene.astro` and the brand reconstruction in
`Logo.astro` is original to this project.

---

## Utilities

`scripts/shoot.mjs` screenshots built pages for visual review:

```bash
npm run build
node scripts/shoot.mjs ./shots "/@1440@full" "/contact/@390"
```

Each argument is `route@width@mode`, where mode is `fold` (viewport) or `full`
(whole page, scrolled first so reveal animations have run).
