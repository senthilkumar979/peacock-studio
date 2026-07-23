import posthog from 'posthog-js';
import { getPostHogHost, getPostHogKey } from './config';
import type { AnalyticsSink } from './types';

/**
 * PostHog-backed analytics sink. Captures:
 * - Autocapture: clicks/buttons, forms, inputs (consent-gated)
 * - Manual pageviews (SPA-friendly via AnalyticsTracker)
 * - Pageleave + heatmaps + web vitals
 * - Exception autocapture + manual captureException
 * - Session replay (when allowed by project settings)
 *
 * Only activates when `VITE_POSTHOG_KEY` is set. Never pass secrets or
 * sensitive field values as props.
 */
export function createPostHogSink(): AnalyticsSink {
  let started = false;

  return {
    init: () => {
      const key = getPostHogKey();
      if (!key || started) return;

      posthog.init(key, {
        api_host: getPostHogHost(),
        // SPA pageviews are emitted manually from AnalyticsTracker.
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: true,
        capture_performance: true,
        capture_exceptions: true,
        persistence: 'localStorage+cookie',
        disable_session_recording: false,
        person_profiles: 'identified_only',
      });
      if (typeof posthog.startExceptionAutocapture === 'function') {
        posthog.startExceptionAutocapture();
      }
      started = true;
    },
    shutdown: () => {
      if (!started) return;
      posthog.reset();
      started = false;
    },
    track: (name, props) => {
      if (!started) return;
      posthog.capture(name, props);
    },
    page: (path) => {
      if (!started) return;
      posthog.capture('$pageview', {
        $current_url: `${window.location.origin}${path}`,
        path,
      });
    },
    captureException: (error, props) => {
      if (!started) return;
      posthog.captureException(error, props);
    },
    identify: (userId, traits) => {
      if (!started) return;
      posthog.identify(userId, traits);
    },
    reset: () => {
      if (!started) return;
      posthog.reset();
    },
  };
}

/**
 * Associates the current authenticated user with the analytics identity so
 * events and replays are attributed correctly. Prefer
 * `identifyAnalyticsUser` from analyticsClient (consent-gated).
 */
export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (!getPostHogKey()) return;
  posthog.identify(userId, traits);
}
