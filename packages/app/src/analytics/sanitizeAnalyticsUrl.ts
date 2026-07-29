const SENSITIVE_PATH_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /^\/s\/[^/]+/, replacement: '/s/[token]' },
  { pattern: /^\/docs\/[^/]+/, replacement: '/docs/[id]' },
  { pattern: /^\/tours\/[^/]+/, replacement: '/tours/[id]' },
  { pattern: /^\/capture\/[^/]+/, replacement: '/capture/[id]' },
];

function sanitizePathname(pathname: string): string {
  for (const { pattern, replacement } of SENSITIVE_PATH_PATTERNS) {
    if (pattern.test(pathname)) {
      return pathname.replace(pattern, replacement);
    }
  }
  return pathname;
}

/** Redacts share tokens and user-content IDs from analytics URLs. */
export function sanitizeAnalyticsUrl(url: string): string {
  try {
    const parsed = new URL(url, 'https://peacock.local');
    parsed.pathname = sanitizePathname(parsed.pathname);
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return parsed.toString();
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url.replace(/^\/s\/[^/?#]+/, '/s/[token]');
  }
}
