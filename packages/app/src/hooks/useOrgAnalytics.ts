import { useEffect, useState } from 'react';
import { fetchOrgAnalyticsSummary } from '@/cloud/repositories/analyticsRepository';
import { useSessionMode } from '@/hooks/useSessionMode';
import { EMPTY_ANALYTICS_SUMMARY, type OrgAnalyticsSummary } from '@/types/analytics';

interface UseOrgAnalyticsResult {
  summary: OrgAnalyticsSummary;
  isLoading: boolean;
  isAvailable: boolean;
}

/**
 * Loads the aggregated analytics summary for the active organization. Only
 * fetches when the cloud library is connected; otherwise reports unavailable so
 * the dashboard can hide the section for local-only sessions. Failures soft-fail
 * to an empty summary (e.g. analytics migration not applied yet).
 */
export function useOrgAnalytics(days = 30): UseOrgAnalyticsResult {
  const sessionMode = useSessionMode();
  const available = sessionMode === 'cloud';
  const [summary, setSummary] = useState<OrgAnalyticsSummary>(EMPTY_ANALYTICS_SUMMARY);
  const [isLoading, setIsLoading] = useState(available);

  useEffect(() => {
    if (!available) {
      setSummary(EMPTY_ANALYTICS_SUMMARY);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchOrgAnalyticsSummary(days)
      .then((result) => {
        if (!cancelled) setSummary(result);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [available, days]);

  return { summary, isLoading, isAvailable: available };
}
