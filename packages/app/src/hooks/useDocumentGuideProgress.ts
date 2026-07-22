import { useMemo } from 'react';
import type { DocumentStepIndexItem } from '@/player/DocumentStepIndex';
import { getDocumentGuideViewedStepCount } from '@/player/documentOutline';

interface DocumentGuideProgress {
  progressPercent: number;
  viewedStepCount: number;
}

export function useDocumentGuideProgress(
  indexItems: DocumentStepIndexItem[],
  activeItemId: string | null,
  totalStepCount: number,
): DocumentGuideProgress {
  return useMemo(() => {
    const viewedStepCount = getDocumentGuideViewedStepCount(indexItems, activeItemId);
    const progressPercent =
      totalStepCount > 0
        ? Math.min(100, Math.round((viewedStepCount / totalStepCount) * 100))
        : 0;

    return { progressPercent, viewedStepCount };
  }, [indexItems, activeItemId, totalStepCount]);
}
