import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL ?? 'https://yalaenergy.co.zm';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  /**
   * Astro's HTML compressor removes the whitespace between a run of text and a
   * following element when that whitespace contains a line break, which glues
   * words to inline links ("See<a>information accuracy</a>"). On a prose-heavy
   * site that is a steady source of subtle copy bugs. The size it saves is
   * recovered by gzip anyway, so correctness wins.
   */
  compressHTML: false,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'monthly',
      priority: 0.7,
    }),
  ],
  devToolbar: { enabled: false },
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
