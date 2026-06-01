import { useCallback, useEffect, useState } from 'react';
import { deleteRoute, listRouteSummaries } from '@/services/routeLibraryService';
import type { SavedRouteSummary } from '@/types/route';

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
      console.error('[Peacock] Failed to load routes', err);
      setError('Could not load saved routes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const deleteRouteById = useCallback(
    async (id: string) => {
      await deleteRoute(id);
      await refresh();
    },
    [refresh]
  );

  return { summaries, isLoading, error, refresh, deleteRouteById };
}
