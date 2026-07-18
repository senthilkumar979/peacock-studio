import { useCallback, useEffect, useState } from 'react';
import { useSessionMode } from '@/hooks/useSessionMode';
import { deleteProductTour, listProductTourSummaries } from '@/services/productTourLibraryService';
import type { ProductTourSummary } from '@/types/productTour';

export function useProductTourLibrary() {
  const sessionMode = useSessionMode();
  const [summaries, setSummaries] = useState<ProductTourSummary[]>([]);
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
      const next = await listProductTourSummaries();
      setSummaries(next);
    } catch (err) {
      console.error('[Peacock] Failed to load product tours', err);
      setError('Could not load product tours.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canLoad) return;
    void refresh();
  }, [canLoad, refresh]);

  const deleteTourById = useCallback(
    async (id: string) => {
      if (sessionMode === 'guest') return;
      await deleteProductTour(id);
      await refresh();
    },
    [refresh, sessionMode],
  );

  return { summaries, isLoading, error, refresh, deleteTourById };
}
