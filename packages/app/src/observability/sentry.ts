import * as Sentry from '@sentry/react';
import { getSentryDsn } from '@/analytics/config';

let initialized = false;

/**
 * Initializes Sentry error + performance monitoring when a DSN is configured.
 * Session replay is sampled lightly and always captured on error. No-op when
 * `VITE_SENTRY_DSN` is absent, so local/dev runs stay quiet.
 */
export function initSentry(): void {
  const dsn = getSentryDsn();
  if (!dsn || initialized) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Chromium layout-churn quirk; not an application failure.
    ignoreErrors: [/ResizeObserver loop/i],
  });

  initialized = true;
}

export function isSentryInitialized(): boolean {
  return initialized;
}
