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

/** Tawk.to property + widget ids for the support chat widget. */
export function getTawkConfig(): { propertyId: string; widgetId: string } | undefined {
  const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID?.trim();
  const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID?.trim();
  if (!propertyId || !widgetId) return undefined;
  return { propertyId, widgetId };
}
