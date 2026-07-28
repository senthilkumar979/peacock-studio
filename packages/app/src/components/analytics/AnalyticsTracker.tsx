import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { useConsent } from '@/hooks/useConsent';
import { useCloudAuthContext } from '@/hooks/useOrganization';
import {
  disableAnalytics,
  enableAnalytics,
  flushAcquisitionToAnalytics,
  groupAnalytics,
  identifyAnalyticsUser,
  resetAnalyticsUser,
  setAnalyticsSink,
  trackEvent,
  trackPageView,
} from '@/analytics/analyticsClient';
import { isPostHogConfigured } from '@/analytics/config';
import { AnalyticsEvents } from '@/analytics/events';
import { isCloudSyncEnabled } from '@/cloud/config';
import { isSentryInitialized } from '@/observability/sentry';
import {
  captureAcquisitionContext,
  readAcquisitionContext,
  toAcquisitionTraits,
} from '@/utils/acquisitionContext';

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
  const groupedOrgRef = useRef<string | null>(null);
  const signedInTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    captureAcquisitionContext();
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (isAnalyticsAllowed) {
      void ensurePostHogSink().then(() => {
        if (cancelled) return;
        const firstEnable = !wasEnabledRef.current;
        enableAnalytics();
        wasEnabledRef.current = true;
        if (firstEnable) {
          trackEvent(AnalyticsEvents.consentAccepted, {
            source: 'consent_gate',
          });
          trackEvent(AnalyticsEvents.analyticsEnabled, {
            provider: isPostHogConfigured() ? 'posthog' : 'console',
          });
          flushAcquisitionToAnalytics();
        }
      });
      return () => {
        cancelled = true;
      };
    }

    if (wasEnabledRef.current) {
      trackEvent(AnalyticsEvents.consentRejected, {
        source: 'consent_withdrawn',
      });
      resetAnalyticsUser();
      identifiedUserRef.current = null;
      groupedOrgRef.current = null;
      signedInTrackedRef.current = null;
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
        groupedOrgRef.current = null;
        signedInTrackedRef.current = null;
      }
      return;
    }

    if (identifiedUserRef.current !== userId) {
      identifyAnalyticsUser(userId, {
        ...toAcquisitionTraits(readAcquisitionContext()),
        email: cloudAuth?.userEmail,
        name: cloudAuth?.userDisplayName,
        organization_id: cloudAuth?.organizationId ?? undefined,
        organization_name: cloudAuth?.organizationName ?? undefined,
        workspace_type: cloudAuth?.workspaceType ?? undefined,
      });
      identifiedUserRef.current = userId;
      if (signedInTrackedRef.current !== userId) {
        trackEvent(AnalyticsEvents.userSignedIn, {
          workspace_type: cloudAuth?.workspaceType ?? undefined,
        });
        signedInTrackedRef.current = userId;
      }
    }

    const orgId = cloudAuth?.organizationId ?? null;
    if (orgId && groupedOrgRef.current !== orgId) {
      groupAnalytics('organization', orgId, {
        name: cloudAuth?.organizationName ?? undefined,
        workspace_type: cloudAuth?.workspaceType ?? undefined,
      });
      groupedOrgRef.current = orgId;
    }
  }, [isAnalyticsAllowed, cloudAuth]);

  // Sentry user attribution is independent of analytics cookie consent.
  useEffect(() => {
    if (!isCloudSyncEnabled() || !isSentryInitialized()) return;
    const userId = cloudAuth?.clerkUserId ?? null;
    if (!userId) {
      Sentry.setUser(null);
      return;
    }
    Sentry.setUser({ id: userId });
  }, [cloudAuth?.clerkUserId]);

  return null;
};
