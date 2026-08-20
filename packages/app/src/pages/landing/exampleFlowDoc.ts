import { getPublicSharePath } from "@/utils/shareLink";

/**
 * Paste a public share token after you publish a Live Flow Doc and create a
 * public embed (or link) share. Leave empty until then — the landing section
 * shows a safe placeholder.
 */

export const LANDING_EXAMPLE_FLOW_SHARE_TOKEN = "89d4d8707ae242a288bf8a5f81b6b44d".trim();

export const LANDING_EXAMPLE_FLOW_TITLE = "KachaBazar - eCommerce".trim();

export const LANDING_EXAMPLE_FLOW_DESCRIPTION =
  "Try a real interactive guide — the same player your team and customers will use.".trim();

const EXAMPLE_EMBED_PREFETCH_ATTR = "peacockExampleEmbed";

export function getLandingExampleEmbedPath(): string | null {
  const token = LANDING_EXAMPLE_FLOW_SHARE_TOKEN.trim();
  if (!token) return null;
  return getPublicSharePath(token, { embed: true });
}

export function getLandingExampleSharePath(): string | null {
  const token = LANDING_EXAMPLE_FLOW_SHARE_TOKEN.trim();
  if (!token) return null;
  return getPublicSharePath(token);
}

/** Start fetching the example embed as soon as the landing bundle evaluates. */
export function prefetchLandingExampleEmbed(): void {
  const href = getLandingExampleEmbedPath();
  if (!href || typeof document === "undefined") return;
  if (document.head.querySelector(`link[data-peacock-example-embed]`)) return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "document";
  link.href = href;
  link.dataset[EXAMPLE_EMBED_PREFETCH_ATTR] = "true";
  document.head.appendChild(link);
}
