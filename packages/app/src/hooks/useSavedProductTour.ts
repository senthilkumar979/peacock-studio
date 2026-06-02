import { useEffect, useState } from 'react';
import { getProductTour } from '@/services/productTourLibraryService';
import { useProductTourBuilderStore } from '@/store/productTourBuilderStore';

export function useSavedProductTour(tourId: string | undefined) {
  const isLoaded = useProductTourBuilderStore((state) => state.isLoaded);
  const storeTourId = useProductTourBuilderStore((state) => state.tour?.id);
  const hydrateFromTour = useProductTourBuilderStore((state) => state.hydrateFromTour);
  const resetTour = useProductTourBuilderStore((state) => state.resetTour);

  const [isLoading, setIsLoading] = useState(Boolean(tourId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tourId) {
      setIsLoading(false);
      setError('Missing tour id.');
      return;
    }

    if (isLoaded && storeTourId === tourId) {
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    if (storeTourId && storeTourId !== tourId) resetTour();

    void getProductTour(tourId).then((tour) => {
      if (cancelled) return;
      if (!tour) {
        setError('This product tour was not found.');
        setIsLoading(false);
        return;
      }
      hydrateFromTour(tour);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [tourId, isLoaded, storeTourId, hydrateFromTour, resetTour]);

  return {
    tour: useProductTourBuilderStore((state) => state.tour),
    isLoading,
    isLoaded: isLoaded && storeTourId === tourId,
    error,
  };
}
