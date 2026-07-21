import posthog from 'posthog-js';
import { getPostHogHost, getPostHogKey } from './config';
import type { AnalyticsSink } from './types';

/**
 * PostHog-backed analytics sink. Replaces GA + Hotjar: product analytics,
 * autocapture-free manual events, and consent-gated session replay. Only
 * activates when `VITE_POSTHOG_KEY` is set; otherwise callers should keep the
 * console sink. Never pass secrets or sensitive field values as props.
 */
export function createPostHogSink(): AnalyticsSink {
  let started = false;

  return {
    init: () => {
      const key = getPostHogKey();
      if (!key || started) return;

      posthog.init(key, {
        api_host: getPostHogHost(),
        capture_pageview: false,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        disable_session_recording: false,
      });
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
      posthog.capture('$pageview', { $current_url: path });
    },
  };
}

/**
 * Associates the current authenticated user with the analytics identity so
 * events and replays are attributed correctly. Safe to call when PostHog is
 * not configured (no-op).
 */
export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (!getPostHogKey()) return;
  posthog.identify(userId, traits);
}
