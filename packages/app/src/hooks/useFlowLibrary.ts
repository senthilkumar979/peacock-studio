import { useCallback, useEffect, useState } from 'react';
import { useSessionMode } from '@/hooks/useSessionMode';
import { listFlowSummaries, removeFlowDocument } from '@/services/flowLibraryService';
import { computeDashboardStats, type DashboardStats } from '@/utils/dashboardStats';
import type { SavedFlowSummary } from '@/types/savedFlow';

export function useFlowLibrary() {
  const sessionMode = useSessionMode();
  const [summaries, setSummaries] = useState<SavedFlowSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats>(computeDashboardStats([]));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canLoad =
    sessionMode === 'local' ||
    sessionMode === 'guest' ||
    sessionMode === 'cloud';

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
    if (!canLoad) return;
    void refresh();
  }, [canLoad, refresh]);

  const deleteDocument = useCallback(
    async (id: string) => {
      if (sessionMode === 'guest') return;
      await removeFlowDocument(id);
      await refresh();
    },
    [refresh, sessionMode],
  );

  return { summaries, stats, isLoading, error, refresh, deleteDocument, sessionMode };
}
