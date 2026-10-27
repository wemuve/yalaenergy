# Self-hosted fonts

| File | Family | Licence |
| --- | --- | --- |
| `archivo-latin-var.woff2` | Archivo (variable, 100–900) — display | SIL Open Font License 1.1 |
| `inter-latin-var.woff2` | Inter (variable, 100–900) — body | SIL Open Font License 1.1 |

Both are the **latin** subsets only (`U+0000-00FF` and common punctuation), which
keeps the pair under 85 kB in total. They are self-hosted rather than loaded from
a third-party CDN so that no visitor request leaves the site's own origin and no
render-blocking cross-origin connection is needed.

Full licence text: <https://openfontlicense.org/>.

To replace them with a licensed brand typeface, drop the `woff2` files here and
update the `@font-face` blocks in `src/styles/base.css` plus the two `<link
rel="preload">` tags in `src/layouts/BaseLayout.astro`.
