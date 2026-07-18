import { useCallback } from 'react';
import { trackEvent } from '@/analytics/analyticsClient';
import type { AnalyticsProps } from '@/analytics/types';

/**
 * Component-facing analytics API. `track` is a no-op unless the user has
 * consented to analytics (enforced centrally in `analyticsClient`).
 */
export const useAnalytics = () => {
  const track = useCallback((name: string, props?: AnalyticsProps) => {
    trackEvent(name, props);
  }, []);

  return { track };
};
