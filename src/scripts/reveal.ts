/**
 * Scroll-triggered reveals.
 *
 * The hidden state is applied by the `js-reveal` class on <html>, which this
 * module adds. Without JavaScript the class is never added and every
 * `[data-reveal]` element renders at full opacity, so content is never gated
 * behind an animation that may not run.
 */
export function initReveal(): void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (elements.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  document.documentElement.classList.add('js-reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const group = el.closest<HTMLElement>('[data-reveal-group]');
        if (group) {
          // Stagger siblings within a group for a composed, filmic entrance.
          const siblings = Array.from(group.querySelectorAll<HTMLElement>('[data-reveal]'));
          const index = siblings.indexOf(el);
          el.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 85}ms`);
        }
        el.classList.add('is-revealed');
        observer.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  elements.forEach((el) => observer.observe(el));

  const revealAll = () => {
    observer.disconnect();
    document.documentElement.classList.remove('js-reveal');
    elements.forEach((el) => el.classList.add('is-revealed'));
  };

  // If the preference changes mid-session, stop hiding anything.
  reduced.addEventListener('change', (event) => {
    if (event.matches) revealAll();
  });

  // Printing lays the whole document out at once without ever scrolling it, so
  // the observer would never fire for anything below the fold and the printed
  // page would come out blank.
  window.addEventListener('beforeprint', revealAll);

  // Safety net. If the observer has not fired for an element within a few
  // seconds — an automated capture, an unusual scroll container, a browser
  // quirk — the content is shown anyway. An animation that did not play is a
  // cosmetic loss; content that stays invisible is a broken page.
  window.setTimeout(revealAll, 6000);
}
