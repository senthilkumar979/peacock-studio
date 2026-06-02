import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProductTour, TourLearnerSegment } from '@/types/productTour';
import { sortTourFeatures } from '@/utils/createProductTour';
import {
  buildTourLearnerSegments,
  buildTourStepCounts,
} from '@/utils/productTourLearner';

interface UseProductTourLearnerResult {
  segments: TourLearnerSegment[];
  currentIndex: number;
  currentSegment: TourLearnerSegment | null;
  stepCounts: number[][];
  isLoading: boolean;
  isAtComplete: boolean;
  goNext: () => void;
  goPrevious: () => void;
  replay: () => void;
  setCurrentIndex: (index: number) => void;
}

export function useProductTourLearner(tour: ProductTour | null): UseProductTourLearnerResult {
  const [stepCounts, setStepCounts] = useState<number[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!tour) return;
    let cancelled = false;
    setIsLoading(true);
    void buildTourStepCounts(tour)
      .then((counts) => {
        if (!cancelled) setStepCounts(counts);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tour]);

  const segments = useMemo(
    () => buildTourLearnerSegments(stepCounts),
    [stepCounts],
  );

  const currentSegment = segments[currentIndex] ?? null;
  const isAtComplete = currentSegment?.type === 'complete';

  useEffect(() => {
    if (currentIndex > segments.length - 1) {
      setCurrentIndex(Math.max(segments.length - 1, 0));
    }
  }, [currentIndex, segments.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, segments.length - 1));
  }, [segments.length]);

  const goPrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const replay = useCallback(() => setCurrentIndex(0), []);

  return {
    segments,
    currentIndex,
    currentSegment,
    stepCounts,
    isLoading,
    isAtComplete,
    goNext,
    goPrevious,
    replay,
    setCurrentIndex,
  };
}

export function getActiveFeatureIndex(tour: ProductTour, segment: TourLearnerSegment): number {
  if (!('featureIndex' in segment)) return 0;
  return Math.min(segment.featureIndex, sortTourFeatures(tour.features).length - 1);
}
