import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConsent } from '@/hooks/useConsent';
import {
  disableAnalytics,
  enableAnalytics,
  setAnalyticsSink,
  trackPageView,
} from '@/analytics/analyticsClient';
import { isPostHogConfigured } from '@/analytics/config';
import { createPostHogSink } from '@/analytics/posthogSink';

// Swap the console sink for PostHog once, before any consent-gated enable.
if (isPostHogConfigured()) {
  setAnalyticsSink(createPostHogSink());
}

/**
 * Bridges cookie consent to the analytics client: enables/disables analytics
 * when the user's choice changes and reports page views only while allowed.
 * Renders nothing.
 */
export const AnalyticsTracker = () => {
  const { isAnalyticsAllowed } = useConsent();
  const location = useLocation();

  useEffect(() => {
    if (isAnalyticsAllowed) {
      enableAnalytics();
      return;
    }
    disableAnalytics();
  }, [isAnalyticsAllowed]);

  useEffect(() => {
    if (!isAnalyticsAllowed) return;
    trackPageView(`${location.pathname}${location.search}`);
  }, [isAnalyticsAllowed, location.pathname, location.search]);

  return null;
};
