import { useCallback, useEffect, useState } from 'react';
import { useSessionMode } from '@/hooks/useSessionMode';
import { listFlowSummaries, removeFlowDocument } from '@/services/flowLibraryService';
import { computeDashboardStats, type DashboardStats } from '@/utils/dashboardStats';
import type { SavedFlowSummary } from '@/types/savedFlow';
import { reportAppError } from '@/utils/appError';
import { notifyError, notifyPromise } from '@/utils/notify';
import { AnalyticsEvents } from '@/analytics/events';

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
      const classified = reportAppError('Failed to load flow library', err);
      setError(classified.userMessage);
      notifyError(classified.title, classified.userMessage);
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
      await notifyPromise(removeFlowDocument(id).then(() => refresh()), {
        loading: 'Deleting document…',
        success: 'Document deleted',
        successDescription: 'Removed from your library.',
        context: 'Delete flow document',
        event: AnalyticsEvents.documentDeleted,
        eventProps: { document_id: id },
      });
    },
    [refresh, sessionMode],
  );

  return { summaries, stats, isLoading, error, refresh, deleteDocument, sessionMode };
}
