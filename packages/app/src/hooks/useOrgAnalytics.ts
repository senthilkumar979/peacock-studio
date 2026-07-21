import { useEffect, useState } from 'react';
import { fetchOrgAnalyticsSummary } from '@/cloud/repositories/analyticsRepository';
import { isCloudLibraryActive } from '@/cloud/authContext';
import { EMPTY_ANALYTICS_SUMMARY, type OrgAnalyticsSummary } from '@/types/analytics';

interface UseOrgAnalyticsResult {
  summary: OrgAnalyticsSummary;
  isLoading: boolean;
  isAvailable: boolean;
  error: string | null;
}

/**
 * Loads the aggregated analytics summary for the active organization. Only
 * active when the cloud library is connected; otherwise reports unavailable so
 * the dashboard can hide the section for local-only sessions.
 */
export function useOrgAnalytics(days = 30): UseOrgAnalyticsResult {
  const available = isCloudLibraryActive();
  const [summary, setSummary] = useState<OrgAnalyticsSummary>(EMPTY_ANALYTICS_SUMMARY);
  const [isLoading, setIsLoading] = useState(available);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!available) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchOrgAnalyticsSummary(days)
      .then((result) => {
        if (!cancelled) setSummary(result);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load analytics right now.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [available, days]);

  return { summary, isLoading, isAvailable: available, error };
}
