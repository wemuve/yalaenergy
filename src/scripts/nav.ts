/**
 * Site header: mobile drawer and scroll state.
 *
 * The drawer is a real focus trap with Escape handling, because a navigation a
 * keyboard user cannot leave is worse than no drawer at all. The markup works
 * without JavaScript: the toggle is a link to `#site-nav`, which is a visible
 * list further down the document.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initNav(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const drawer = document.querySelector<HTMLElement>('[data-nav-drawer]');

  if (header) initScrollState(header);
  if (!toggle || !drawer) return;

  let lastFocused: HTMLElement | null = null;

  const open = () => {
    lastFocused = document.activeElement as HTMLElement | null;
    drawer.hidden = false;
    // Allow the browser a frame so the transition has a starting state.
    requestAnimationFrame(() => drawer.setAttribute('data-open', 'true'));
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.style.setProperty('overflow', 'hidden');
    const first = drawer.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  };

  const close = (restoreFocus = true) => {
    drawer.removeAttribute('data-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.style.removeProperty('overflow');
    const finish = () => {
      drawer.hidden = true;
      drawer.removeEventListener('transitionend', finish);
    };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) finish();
    else drawer.addEventListener('transitionend', finish);
    if (restoreFocus) (lastFocused ?? toggle).focus();
  };

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    if (isOpen()) close();
    else open();
  });

  drawer.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-nav-close]') || target.closest('a')) close(false);
  });

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;

    const items = Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    );
    if (items.length === 0) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Close when the viewport grows past the breakpoint that hides the toggle.
  const desktop = window.matchMedia('(min-width: 60rem)');
  desktop.addEventListener('change', (event) => {
    if (event.matches && isOpen()) close(false);
  });
}

function initScrollState(header: HTMLElement): void {
  let ticking = false;
  const update = () => {
    ticking = false;
    header.dataset.scrolled = window.scrollY > 24 ? 'true' : 'false';
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
}
