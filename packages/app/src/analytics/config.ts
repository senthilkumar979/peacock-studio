/** Reads the PostHog project key, if configured. */
export function getPostHogKey(): string | undefined {
  return import.meta.env.VITE_POSTHOG_KEY?.trim() || undefined;
}

/** PostHog ingestion host; defaults to EU cloud when unset. */
export function getPostHogHost(): string {
  return import.meta.env.VITE_POSTHOG_HOST?.trim() || 'https://eu.i.posthog.com';
}

export function isPostHogConfigured(): boolean {
  return Boolean(getPostHogKey());
}

/** Reads the Sentry DSN, if configured. */
export function getSentryDsn(): string | undefined {
  return import.meta.env.VITE_SENTRY_DSN?.trim() || undefined;
}

export function isSentryConfigured(): boolean {
  return Boolean(getSentryDsn());
}

/** Freshchat/Freshworks web chat CDN script (Admin → Channels → Web chat embed). */
export function getFreshchatConfig(): { scriptSrc: string } | undefined {
  const configured = import.meta.env.VITE_FRESHCHAT_SCRIPT_SRC?.trim();
  // Empty string explicitly disables the widget; unset falls back to the EU embed used in production.
  if (configured === '') return undefined;
  const scriptSrc = configured || 'https://eu.fw-cdn.com/13649148/1552572.js';
  return { scriptSrc };
}
