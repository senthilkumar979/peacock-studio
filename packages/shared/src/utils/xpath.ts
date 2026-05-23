export function getXPath(element: Element): string {
  if (element === document.documentElement) {
    return '/html';
  }

  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = current.previousElementSibling;

    while (sibling) {
      if (sibling.tagName === current.tagName) {
        index += 1;
      }
      sibling = sibling.previousElementSibling;
    }

    const tagName = current.tagName.toLowerCase();
    segments.unshift(`${tagName}[${index}]`);
    current = current.parentElement;
  }

  return `/${segments.join('/')}`;
}
