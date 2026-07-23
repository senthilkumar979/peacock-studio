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
import { createPostHogSink } from '@/analytics/posthogSink';
import { isCloudSyncEnabled } from '@/cloud/config';

// Swap the console sink for PostHog once, before any consent-gated enable.
if (isPostHogConfigured()) {
  setAnalyticsSink(createPostHogSink());
}

/**
 * Bridges cookie consent to the analytics client: enables/disables analytics
 * when the user's choice changes, reports SPA page views, and identifies the
 * signed-in user. Renders nothing.
 */
export const AnalyticsTracker = () => {
  const { isAnalyticsAllowed } = useConsent();
  const location = useLocation();
  const cloudAuth = useCloudAuthContext();
  const wasEnabledRef = useRef(false);
  const identifiedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAnalyticsAllowed) {
      const firstEnable = !wasEnabledRef.current;
      enableAnalytics();
      wasEnabledRef.current = true;
      if (firstEnable) {
        trackEvent(AnalyticsEvents.analyticsEnabled, {
          provider: isPostHogConfigured() ? 'posthog' : 'console',
        });
      }
      return;
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
