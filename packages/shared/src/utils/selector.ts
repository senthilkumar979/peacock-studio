function escapeCssIdentifier(value: string): string {
  if (typeof CSS !== 'undefined' && 'escape' in CSS) {
    return CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

function getNthChildSelector(element: Element): string {
  const tagName = element.tagName.toLowerCase();
  let index = 1;
  let sibling = element.previousElementSibling;

  while (sibling) {
    if (sibling.tagName === element.tagName) {
      index += 1;
    }
    sibling = sibling.previousElementSibling;
  }

  return `${tagName}:nth-of-type(${index})`;
}

export function getUniqueSelector(element: Element): string {
  if (element.id) {
    return `#${escapeCssIdentifier(element.id)}`;
  }

  const dataTestId = element.getAttribute('data-testid');
  if (dataTestId) {
    return `[data-testid="${dataTestId}"]`;
  }

  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.documentElement) {
    segments.unshift(getNthChildSelector(current));
    current = current.parentElement;
  }

  return segments.join(' > ');
}
