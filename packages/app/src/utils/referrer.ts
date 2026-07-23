/**
 * Returns the hostname of the document referrer, or `null` for direct traffic
 * or same-origin navigations (which are not meaningful referral sources).
 */
export function getReferrerDomain(): string | null {
  if (typeof document === 'undefined' || !document.referrer) return null;

  try {
    const url = new URL(document.referrer);
    if (url.hostname === window.location.hostname) return null;
    return url.hostname;
  } catch {
    return null;
  }
}

/**
 * Best-effort host of the page embedding this app (iframe parent).
 * Prefers `location.ancestorOrigins` (Chromium), then document.referrer.
 */
export function getEmbedHostDomain(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const ancestors = window.location.ancestorOrigins;
    if (ancestors && ancestors.length > 0) {
      const top = ancestors[ancestors.length - 1];
      if (top) {
        const host = new URL(top).hostname;
        if (host && host !== window.location.hostname) return host;
      }
    }
  } catch {
    // ancestorOrigins may be restricted.
  }

  return getReferrerDomain();
}

/** Extracts UTM campaign parameters from the current URL as a flat record. */
export function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    if (key.toLowerCase().startsWith('utm_') && value) {
      utm[key.toLowerCase()] = value;
    }
  }

  return utm;
}
