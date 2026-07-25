import { isPostHogConfigured, isSentryConfigured } from '@/analytics/config';
import { isSentryInitialized } from '@/observability/sentry';
import { healthResult } from '@/utils/health/healthResult';
import type { HealthCheckResult } from '@/types/health';

export function checkObservability(): HealthCheckResult[] {
  const sentryConfigured = isSentryConfigured();
  const sentryInit = isSentryInitialized();
  return [
    healthResult(
      'sentry',
      'connections',
      'Sentry error tracking',
      sentryConfigured ? (sentryInit ? 'pass' : 'warn') : 'skip',
      sentryConfigured
        ? sentryInit
          ? 'Sentry DSN configured and initialized.'
          : 'Sentry DSN present but not initialized yet.'
        : 'VITE_SENTRY_DSN not set — error reporting disabled.',
    ),
    healthResult(
      'posthog',
      'connections',
      'PostHog analytics',
      isPostHogConfigured() ? 'pass' : 'skip',
      isPostHogConfigured()
        ? 'PostHog key configured (subject to consent).'
        : 'VITE_POSTHOG_KEY not set — product analytics disabled.',
    ),
  ];
}
