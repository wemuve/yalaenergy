/**
 * Interactive PV + BESS system diagram.
 *
 * Implemented as a standard tabs widget rather than clickable SVG shapes:
 * screen-reader support for interactive SVG sub-elements is uneven, whereas
 * tablist/tab/tabpanel is understood everywhere and gives arrow-key navigation
 * for free. The SVG itself is decorative; the tabs are the real control, and
 * every panel's text is in the DOM from the start, so the diagram's information
 * is available without JavaScript.
 */
export function initDiagram(): void {
  const diagrams = Array.from(document.querySelectorAll<HTMLElement>('[data-diagram]'));
  diagrams.forEach(setup);
}

function setup(root: HTMLElement): void {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  const svg = root.querySelector<SVGElement>('[data-diagram-graphic]');
  if (tabs.length === 0 || panels.length !== tabs.length) return;

  root.dataset.enhanced = 'true';

  const select = (index: number, focus = true) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      panels[i]!.hidden = !active;
    });
    if (svg) {
      const key = tabs[index]!.dataset.node ?? '';
      svg.querySelectorAll<SVGElement>('[data-node]').forEach((node) => {
        const isActive = node.dataset.node === key;
        node.classList.toggle('is-active', isActive);
        node.classList.toggle('is-dimmed', !isActive);
      });
    }
    if (focus) tabs[index]!.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index, false));
    tab.addEventListener('keydown', (event) => {
      const map: Record<string, number> = {
        ArrowRight: index + 1,
        ArrowDown: index + 1,
        ArrowLeft: index - 1,
        ArrowUp: index - 1,
        Home: 0,
        End: tabs.length - 1,
      };
      const next = map[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select((next + tabs.length) % tabs.length);
    });
  });

  select(0, false);
}
