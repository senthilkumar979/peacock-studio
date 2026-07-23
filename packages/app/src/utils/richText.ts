const ALLOWED_TAGS = new Set([
  'P',
  'H1',
  'H2',
  'H3',
  'STRONG',
  'EM',
  'U',
  'B',
  'I',
  'BR',
  'UL',
  'OL',
  'LI',
  'HR',
]);

/** Strip tags for plain-text previews, search, and PDF. */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n')
    .replace(/<\/(p|h[1-3]|li)>/gi, '\n')
    .replace(/<\/?(ul|ol)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function isEmptyRichText(html: string): boolean {
  return stripHtmlTags(html).length === 0;
}

/** Persist empty TipTap docs as "" so existing empty checks keep working. */
export function normalizeRichText(html: string): string {
  return isEmptyRichText(html) ? '' : html.trim();
}

/**
 * Allowlist sanitize for TipTap HTML (p/h1–h3/lists/hr/strong/em/u/br).
 * Safe for browser display without adding DOMPurify.
 */
export function sanitizeRichHtml(html: string): string {
  if (!html || typeof DOMParser === 'undefined') return '';

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  return serializeAllowed(parsed.body);
}

function serializeAllowed(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as Element;
  const tag = el.tagName;

  if (!ALLOWED_TAGS.has(tag)) {
    return Array.from(el.childNodes).map(serializeAllowed).join('');
  }

  if (tag === 'BR') return '<br>';
  if (tag === 'HR') return '<hr>';

  const inner = Array.from(el.childNodes).map(serializeAllowed).join('');
  const lower = tag.toLowerCase();
  return `<${lower}>${inner}</${lower}>`;
}
