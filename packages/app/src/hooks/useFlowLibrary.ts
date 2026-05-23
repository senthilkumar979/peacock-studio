import { useCallback, useEffect, useState } from 'react';
import { listFlowSummaries, removeFlowDocument } from '@/services/flowLibraryService';
import { computeDashboardStats, type DashboardStats } from '@/utils/dashboardStats';
import type { SavedFlowSummary } from '@/types/savedFlow';

export function useFlowLibrary() {
  const [summaries, setSummaries] = useState<SavedFlowSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats>(computeDashboardStats([]));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await listFlowSummaries();
      setSummaries(next);
      setStats(computeDashboardStats(next));
    } catch (err) {
      console.error('[Peacock] Failed to load flow library', err);
      setError('Could not load saved documentation.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const deleteDocument = useCallback(
    async (id: string) => {
      await removeFlowDocument(id);
      await refresh();
    },
    [refresh]
  );

  return { summaries, stats, isLoading, error, refresh, deleteDocument };
}
