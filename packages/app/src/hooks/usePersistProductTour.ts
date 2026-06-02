import { useEffect, useRef } from 'react';
import { persistProductTour } from '@/services/productTourLibraryService';
import { useProductTourBuilderStore } from '@/store/productTourBuilderStore';

const PERSIST_MS = 1500;

export function usePersistProductTour(enabled: boolean): void {
  const tour = useProductTourBuilderStore((state) => state.tour);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !tour) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void persistProductTour(tour);
    }, PERSIST_MS);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [enabled, tour]);
}
