import { useEffect, useState } from 'react';
import { collectAllBranches } from '@peacock/shared';
import { useFlowStore, useViewerOutline } from '@/store/flowStore';
import { prefetchImages } from '@/utils/prefetchImages';
import {
  buildDefaultPdfPathSelections,
  type PdfPathSelections,
} from '@/utils/pdfPathSelection';
import { flattenVideoBeats } from './flattenVideoBeats';
import type { VideoBeat } from './videoBeats';

interface UseCinematicBeatsResult {
  beats: VideoBeat[] | null;
  isLoading: boolean;
  error: string | null;
}

export function useCinematicBeats(
  pathSelections: PdfPathSelections,
): UseCinematicBeatsResult {
  const steps = useViewerOutline();
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const [beats, setBeats] = useState<VideoBeat[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectionsKey = JSON.stringify(pathSelections);

  useEffect(() => {
    let cancelled = false;
    const parsed = JSON.parse(selectionsKey) as PdfPathSelections;
    const defaults = buildDefaultPdfPathSelections(collectAllBranches(steps));
    const merged: PdfPathSelections = { ...defaults, ...parsed };

    setIsLoading(true);
    setError(null);

    void flattenVideoBeats({ steps, screenshotUrls, pathSelections: merged })
      .then((result) => {
        if (cancelled) return;
        setBeats(result);
        const previewUrls = result
          .map((beat) => beat.screenshotUrl)
          .filter((url): url is string => Boolean(url))
          .slice(0, 2);
        void prefetchImages(previewUrls, { priorityUrl: previewUrls[0] ?? null });
      })
      .catch(() => {
        if (!cancelled) setError('Could not prepare this cinematic walkthrough.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [steps, screenshotUrls, selectionsKey]);

  return { beats, isLoading, error };
}
