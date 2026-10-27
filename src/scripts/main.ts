/**
 * Client entry point.
 *
 * Everything here is an enhancement: the site is fully readable, navigable and
 * usable with this bundle blocked. The heavy decorative layer (the animated
 * solar field) is code-split and only fetched when the device and the visitor's
 * preferences both justify it.
 */
import { initNav } from './nav';
import { initReveal } from './reveal';
import { initCounters } from './counters';
import { initForms } from './form';
import { initDiagram } from './diagram';

function boot(): void {
  initNav();
  initReveal();
  initCounters();
  initForms();
  initDiagram();
  maybeMountSolarField();
}

function maybeMountSolarField(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-solar-field]');
  if (!canvas) return;

  // Gate 1: the visitor has asked for less motion.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Gate 2: small viewports get the static artwork — it looks the same at rest
  // and costs nothing.
  if (window.matchMedia('(max-width: 47.99rem)').matches) return;
  // Gate 3: low-core devices and data-saver connections opt out.
  if ((navigator.hardwareConcurrency ?? 8) < 4) return;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return;

  const start = () => {
    void import('./solar-field').then(({ mountSolarField }) => mountSolarField(canvas));
  };

  // Never compete with the hero's own paint.
  const idle = (window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;

  if (idle) idle.call(window, start, { timeout: 2200 });
  else window.setTimeout(start, 900);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
