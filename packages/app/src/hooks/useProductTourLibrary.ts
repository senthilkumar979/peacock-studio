import { useCallback, useEffect, useState } from 'react';
import { deleteProductTour, listProductTourSummaries } from '@/services/productTourLibraryService';
import type { ProductTourSummary } from '@/types/productTour';

export function useProductTourLibrary() {
  const [summaries, setSummaries] = useState<ProductTourSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    void refresh();
  }, [refresh]);

  const deleteTourById = useCallback(
    async (id: string) => {
      await deleteProductTour(id);
      await refresh();
    },
    [refresh],
  );

  return { summaries, isLoading, error, refresh, deleteTourById };
}
