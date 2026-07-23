import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useConsent } from '@/hooks/useConsent';
import { useCloudAuthContext } from '@/hooks/useOrganization';
import {
  disableAnalytics,
  enableAnalytics,
  identifyAnalyticsUser,
  resetAnalyticsUser,
  setAnalyticsSink,
  trackEvent,
  trackPageView,
} from '@/analytics/analyticsClient';
import { isPostHogConfigured } from '@/analytics/config';
import { AnalyticsEvents } from '@/analytics/events';
import { isCloudSyncEnabled } from '@/cloud/config';

let posthogSinkPromise: Promise<void> | null = null;

function ensurePostHogSink(): Promise<void> {
  if (!isPostHogConfigured()) return Promise.resolve();
  if (!posthogSinkPromise) {
    posthogSinkPromise = import('@/analytics/posthogSink').then((m) => {
      setAnalyticsSink(m.createPostHogSink());
    });
  }
  return posthogSinkPromise;
}

/**
 * Bridges cookie consent to the analytics client: enables/disables analytics
 * when the user's choice changes, reports SPA page views, and identifies the
 * signed-in user. Renders nothing. PostHog is loaded only after consent.
 */
export const AnalyticsTracker = () => {
  const { isAnalyticsAllowed } = useConsent();
  const location = useLocation();
  const cloudAuth = useCloudAuthContext();
  const wasEnabledRef = useRef(false);
  const identifiedUserRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (isAnalyticsAllowed) {
      void ensurePostHogSink().then(() => {
        if (cancelled) return;
        const firstEnable = !wasEnabledRef.current;
        enableAnalytics();
        wasEnabledRef.current = true;
        if (firstEnable) {
          trackEvent(AnalyticsEvents.analyticsEnabled, {
            provider: isPostHogConfigured() ? 'posthog' : 'console',
          });
        }
      });
      return () => {
        cancelled = true;
      };
    }

    if (wasEnabledRef.current) {
      resetAnalyticsUser();
      identifiedUserRef.current = null;
    }
    disableAnalytics();
    wasEnabledRef.current = false;
  }, [isAnalyticsAllowed]);

  useEffect(() => {
    if (!isAnalyticsAllowed) return;
    trackPageView(`${location.pathname}${location.search}`);
  }, [isAnalyticsAllowed, location.pathname, location.search]);

  useEffect(() => {
    if (!isAnalyticsAllowed || !isCloudSyncEnabled()) return;

    const userId = cloudAuth?.clerkUserId ?? null;
    if (!userId) {
      if (identifiedUserRef.current) {
        resetAnalyticsUser();
        identifiedUserRef.current = null;
      }
      return;
    }

    if (identifiedUserRef.current === userId) return;
    identifyAnalyticsUser(userId, {
      email: cloudAuth?.userEmail,
      name: cloudAuth?.userDisplayName,
      organization_id: cloudAuth?.organizationId ?? undefined,
      organization_name: cloudAuth?.organizationName ?? undefined,
      workspace_type: cloudAuth?.workspaceType ?? undefined,
    });
    identifiedUserRef.current = userId;
  }, [isAnalyticsAllowed, cloudAuth]);

  return null;
};
