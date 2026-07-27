export const INTERACTIVE_TARGET_SELECTOR =
  'button, a, input, select, textarea, label, ' +
  '[role="button"], [role="link"], [role="menuitem"], [role="tab"], [role="option"], ' +
  '[role="checkbox"], [role="radio"], [role="combobox"]';

export const GENERIC_HTML_ANCESTOR_SELECTOR =
  'div, span, p, li, td, th, nav, header, section, article, main, [role]';

export function getEventTargetElement(event: Event): Element | null {
  const path = event.composedPath();
  for (const node of path) {
    if (node instanceof Element) return node;
  }

  return event.target instanceof Element ? event.target : null;
}

export function resolveClickTarget(rawTarget: EventTarget | null): HTMLElement | null {
  if (!(rawTarget instanceof Element)) return null;

  const interactive = rawTarget.closest(INTERACTIVE_TARGET_SELECTOR);
  if (interactive instanceof HTMLElement) return interactive;

  if (rawTarget instanceof HTMLElement) return rawTarget;

  const htmlAncestor = rawTarget.closest(GENERIC_HTML_ANCESTOR_SELECTOR);
  return htmlAncestor instanceof HTMLElement ? htmlAncestor : null;
}
