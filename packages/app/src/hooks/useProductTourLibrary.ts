import { useCallback, useEffect, useState } from 'react';
import { useSessionMode } from '@/hooks/useSessionMode';
import { deleteProductTour, listProductTourSummaries } from '@/services/productTourLibraryService';
import type { ProductTourSummary } from '@/types/productTour';
import { reportAppError } from '@/utils/appError';
import { notifyError, notifyPromise } from '@/utils/notify';
import { AnalyticsEvents } from '@/analytics/events';

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
      const classified = reportAppError('Failed to load product tours', err);
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

  const deleteTourById = useCallback(
    async (id: string) => {
      if (sessionMode === 'guest') return;
      await notifyPromise(deleteProductTour(id).then(() => refresh()), {
        loading: 'Deleting tour…',
        success: 'Tour deleted',
        successDescription: 'Removed from your library.',
        context: 'Delete product tour',
        event: AnalyticsEvents.tourDeleted,
        eventProps: { tour_id: id },
      });
    },
    [refresh, sessionMode],
  );

  return { summaries, isLoading, error, refresh, deleteTourById };
}
