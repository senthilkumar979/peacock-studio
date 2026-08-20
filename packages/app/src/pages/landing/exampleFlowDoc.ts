/**
 * Static landing demo — served from packages/app/public/examples/kachabazar/
 * (document.json + shots/). No Supabase / resolve-share / /storage/images.
 */

export const LANDING_EXAMPLE_SLUG = 'kachabazar' as const;

export const LANDING_EXAMPLE_FLOW_TITLE = 'KachaBazar - eCommerce';

export const LANDING_EXAMPLE_FLOW_DESCRIPTION =
  'Try a real interactive guide — the same player your team and customers will use.';

export function getLandingExampleEmbedPath(): string {
  return `/examples/${LANDING_EXAMPLE_SLUG}`;
}

export function getLandingExampleSharePath(): string {
  return `/examples/${LANDING_EXAMPLE_SLUG}`;
}

const EXAMPLE_EMBED_PREFETCH_ATTR = 'peacockExampleEmbed';

/** Prefetch the static example document JSON as soon as the landing bundle evaluates. */
export function prefetchLandingExampleEmbed(): void {
  if (typeof document === 'undefined') return;
  if (document.head.querySelector('link[data-peacock-example-embed]')) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'fetch';
  link.href = `/examples/${LANDING_EXAMPLE_SLUG}/document.json`;
  link.crossOrigin = 'anonymous';
  link.dataset[EXAMPLE_EMBED_PREFETCH_ATTR] = 'true';
  document.head.appendChild(link);
}
