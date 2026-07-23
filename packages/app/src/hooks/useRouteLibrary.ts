import { useCallback, useEffect, useState } from 'react';
import { deleteRoute, listRouteSummaries } from '@/services/routeLibraryService';
import type { SavedRouteSummary } from '@/types/route';
import { reportAppError } from '@/utils/appError';
import { notifyError, notifyPromise } from '@/utils/notify';
import { AnalyticsEvents } from '@/analytics/events';

export function useRouteLibrary() {
  const [summaries, setSummaries] = useState<SavedRouteSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await listRouteSummaries();
      setSummaries(next);
    } catch (err) {
      const classified = reportAppError('Failed to load routes', err);
      setError(classified.userMessage);
      notifyError(classified.title, classified.userMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const deleteRouteById = useCallback(
    async (id: string) => {
      await notifyPromise(deleteRoute(id).then(() => refresh()), {
        loading: 'Deleting route…',
        success: 'Route deleted',
        successDescription: 'Removed from your library.',
        context: 'Delete route',
        event: AnalyticsEvents.routeDeleted,
        eventProps: { route_id: id },
      });
    },
    [refresh],
  );

  return { summaries, isLoading, error, refresh, deleteRouteById };
}
