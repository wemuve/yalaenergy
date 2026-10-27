/**
 * Photography registry.
 *
 * ── HOW TO ADD THE PHOTOGRAPHS ─────────────────────────────────────────────
 * Drop the source files into `src/assets/media/` using exactly the `file` names
 * below. Astro optimises them at build time (AVIF + WebP + fallback, responsive
 * widths, intrinsic dimensions set to prevent layout shift). Any photo that is
 * not present falls back to the vector scene automatically, so the site never
 * shows a broken image and never blocks a build on a missing asset.
 *
 * ── THE CAPTION RULE ───────────────────────────────────────────────────────
 * `siteSpecific` must stay `false` for any image that is not a photograph of
 * the Muchenje site or of a Yala Energy asset. When it is false the component
 * renders an explicit "illustrative, not the Muchenje site" caption. Publishing
 * someone else's operating plant as though it were this project is precisely
 * the kind of claim the rest of this site is built to avoid.
 */
export interface Photo {
  /** Filename in `src/assets/media/`, including extension. */
  readonly file: string;
  /** Meaningful alternative text describing what the image shows. */
  readonly alt: string;
  /** Short editorial caption shown beneath the image where captions are used. */
  readonly caption: string;
  /** True only for photographs of the Muchenje site or a Yala Energy asset. */
  readonly siteSpecific: boolean;
  /** `object-position` value, so the subject survives aggressive cropping. */
  readonly focus?: string;
}

export const PHOTOS = {
  /** Aerial view across an operating utility-scale plant. The hero image. */
  aerial: {
    file: 'aerial-solar-plant.jpg',
    alt: 'Aerial view across an operating utility-scale solar plant: long rows of ground-mounted modules following the contours of the land, with service tracks, a transformer station and two ponds inside the site boundary.',
    caption:
      'Illustrative photograph of an operating utility-scale solar plant. Not the Muchenje site.',
    siteSpecific: false,
    focus: '50% 48%',
  },

  /** Golden-hour row of modules with the moon rising. */
  dusk: {
    file: 'panel-row-dusk.jpg',
    alt: 'A long row of ground-mounted solar modules photographed at dusk, with a clear gradient sky, the moon rising above the array and a service track running alongside.',
    caption:
      'Illustrative photograph of an operating solar plant at dusk. Not the Muchenje site.',
    siteSpecific: false,
    focus: '50% 62%',
  },

  /** Low-angle array with sun glint — engineering and detail contexts. */
  array: {
    file: 'array-sun-glint.jpg',
    alt: 'Low-angle view along a row of solar modules, sunlight glinting off the glass and catching the cell grid lines, with trees and a distribution pole beyond the array.',
    caption: 'Illustrative photograph of a solar array. Not the Muchenje site.',
    siteSpecific: false,
    focus: '45% 55%',
  },

  /** Close module detail — used for technical sections. */
  module: {
    file: 'module-detail.jpg',
    alt: 'Close view of a solar module surface showing the cell grid, busbars and mounting rails, with a second array and structural steelwork behind.',
    caption: 'Illustrative photograph of installed PV modules. Not the Muchenje site.',
    siteSpecific: false,
    focus: '50% 50%',
  },
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;
