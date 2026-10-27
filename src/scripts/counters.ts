/**
 * Animated metric values.
 *
 * Accessibility contract: the final value is always present in the DOM as the
 * element's text content before this runs, and the animating span is
 * `aria-hidden`. Screen readers and search engines read the real number; the
 * animation is a purely visual flourish on top of it.
 */
export function initCounters(): void {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-count-to]'));
  if (targets.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        animate(el);
      }
    },
    { threshold: 0.5 },
  );

  targets.forEach((el) => observer.observe(el));
}

function animate(el: HTMLElement): void {
  const to = Number(el.dataset.countTo);
  if (!Number.isFinite(to)) return;

  const finalText = el.textContent ?? '';
  const decimals = Number(el.dataset.countDecimals ?? 0);
  // Prefixes such as the dash in "40–60" must survive the animation.
  const prefix = el.dataset.countPrefix ?? '';
  const duration = 1100;
  const begin = performance.now();

  const live = document.createElement('span');
  live.setAttribute('aria-hidden', 'true');
  const stable = document.createElement('span');
  stable.className = 'visually-hidden';
  stable.textContent = finalText;

  el.textContent = '';
  el.append(stable, live);

  const step = (now: number) => {
    const t = Math.min(1, (now - begin) / duration);
    // easeOutExpo — fast settle, no overshoot.
    const eased = t === 1 ? 1 : 1 - 2 ** (-9 * t);
    live.textContent = prefix + (to * eased).toFixed(decimals);
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      // Restore the exact authored string, dashes and all.
      el.textContent = finalText;
    }
  };

  requestAnimationFrame(step);
}
