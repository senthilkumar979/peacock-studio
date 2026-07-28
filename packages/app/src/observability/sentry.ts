import * as Sentry from '@sentry/react';
import { getSentryDsn } from '@/analytics/config';

let initialized = false;

const EXPECTED_CLIENT_NOISE: RegExp[] = [
  /ResizeObserver loop/i,
  /Please sign in again/i,
  /session expired/i,
  /session is not ready/i,
  /Turnstile challenge (?:failed|expired)/i,
  /Turnstile (?:is not available|failed to load|execute failed)/i,
  /Nothing to reset found for provided container/i,
  /Rate limit unavailable/i,
  /Multiple Sentry Session Replay instances are not supported/i,
];

function eventMessage(event: Sentry.ErrorEvent): string {
  const message = event.message ?? '';
  const exception = event.exception?.values?.[0]?.value ?? '';
  return `${message} ${exception}`;
}

function isReactRefreshNoise(event: Sentry.ErrorEvent): boolean {
  const frames =
    event.exception?.values?.flatMap((value) => value.stacktrace?.frames ?? []) ?? [];
  return frames.some((frame) => {
    const file = frame.filename ?? '';
    const fn = frame.function ?? '';
    return (
      /@react-refresh|performReactRefresh|scheduleRefresh/i.test(file) ||
      /performReactRefresh|scheduleRefresh/i.test(fn)
    );
  });
}

function resolveRelease(): string | undefined {
  const fromEnv = import.meta.env.VITE_SENTRY_RELEASE?.trim();
  return fromEnv || undefined;
}

/**
 * Initializes Sentry error + performance monitoring when a DSN is configured.
 * Session replay is sampled lightly and always captured on error. No-op when
 * `VITE_SENTRY_DSN` is absent, so local/dev runs stay quiet.
 *
 * Idempotent across HMR and concurrent callers: an existing client (or in-flight
 * init) skips a second `replayIntegration()`, which throws
 * "Multiple Sentry Session Replay instances are not supported"
 * (PEACOCK-STUDIO-19).
 */
export function initSentry(): void {
  const dsn = getSentryDsn();
  if (!dsn) return;
  if (initialized || Sentry.getClient()) {
    initialized = true;
    return;
  }

  // Set before init so overlapping DeferredSentry effects cannot double-boot.
  initialized = true;
  const release = resolveRelease();

  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release,
      integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      ignoreErrors: EXPECTED_CLIENT_NOISE,
      beforeSend(event) {
        if (isReactRefreshNoise(event)) return null;
        const text = eventMessage(event);
        if (EXPECTED_CLIENT_NOISE.some((pattern) => pattern.test(text))) return null;
        return event;
      },
    });
  } catch (error) {
    // HMR can leave a live Replay while this module's flag resets.
    if (
      error instanceof Error &&
      /Multiple Sentry Session Replay instances are not supported/i.test(error.message)
    ) {
      return;
    }
    initialized = false;
    throw error;
  }
}

export function isSentryInitialized(): boolean {
  return initialized;
}

/** Expected UX / bot-challenge failures — do not escalate to Sentry. */
export function isExpectedClientNoise(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message ?? '')
          : '';
  return EXPECTED_CLIENT_NOISE.some((pattern) => pattern.test(message));
}
