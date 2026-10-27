# Photography — drop files here

Put the source photographs in **this folder** using exactly these filenames.
Astro optimises them at build time (AVIF + WebP + fallback, responsive widths,
intrinsic `width`/`height` so there is no layout shift) and the pages pick them
up automatically.

| Filename | Where it appears | What it should show |
| --- | --- | --- |
| `aerial-solar-plant.jpg` | Homepage flagship block, Projects page card, Muchenje project hero | Aerial view across an operating utility-scale plant |
| `panel-row-dusk.jpg` | Homepage hero, closing CTA band | A row of modules at golden hour / dusk |
| `array-sun-glint.jpg` | PV & BESS Engineering hero, About page hero | Low-angle array with sunlight on the glass |
| `module-detail.jpg` | Engineering services detail, Contact page | Close detail of installed modules |

JPEG or PNG is fine — do **not** pre-convert to WebP or AVIF, the build does
that. Aim for at least 1920 px on the long edge; larger is fine, the optimiser
downscales. Keep the originals somewhere safe outside the repository.

## Until the files are here

Every page renders an illustrated vector scene in place of each missing
photograph. Nothing breaks, no build fails and no image 404s — the layout is
identical, so dropping the files in is the only step needed.

## The caption rule

None of these photographs show the Muchenje site. `src/data/media.ts` marks each
one `siteSpecific: false`, and the figure component therefore prints an explicit
*"Illustrative photograph … Not the Muchenje site"* caption beneath it.

If a genuine photograph of the Muchenje site is added later, register it in
`src/data/media.ts` with `siteSpecific: true` and write its own caption. Do not
flip that flag on a stock or third-party image — presenting another company's
operating plant as this project is exactly the kind of claim the rest of this
site is built to avoid.

## Licensing

Confirm that Yala Energy holds the right to publish each photograph on its
website before launch. This is item `MEDIA-2` in
`docs/verification-checklist.md`.
