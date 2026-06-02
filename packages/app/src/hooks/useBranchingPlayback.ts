import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPlayableStepRange,
  getPlayerOutlineSegments,
  type FlowStep,
  type LinkedPeacockPath,
  type PlayerOutlineSegment,
} from '@peacock/shared';
import { getFlowDocument } from '@/services/flowLibraryService';
import { useViewerOutline } from '@/store/flowStore';

interface LinkedPlayback {
  path: LinkedPeacockPath;
  steps: FlowStep[];
  screenshotUrls: Record<string, string>;
  stepIndex: number;
}

interface UseBranchingPlaybackResult {
  segments: PlayerOutlineSegment[];
  currentSegment: PlayerOutlineSegment | null;
  currentIndex: number;
  linkedPlayback: LinkedPlayback | null;
  isLoadingLinked: boolean;
  linkedError: string | null;
  playableStepCount: number;
  selectBranchPath: (path: LinkedPeacockPath) => void;
  goNext: () => void;
  goPrevious: () => void;
  setCurrentIndex: (index: number) => void;
}

export function useBranchingPlayback(): UseBranchingPlaybackResult {
  const outline = useViewerOutline();
  const segments = useMemo(() => getPlayerOutlineSegments(outline), [outline]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [linkedPlayback, setLinkedPlayback] = useState<LinkedPlayback | null>(null);
  const [isLoadingLinked, setIsLoadingLinked] = useState(false);
  const [linkedError, setLinkedError] = useState<string | null>(null);

  const playableStepCount = useMemo(
    () => segments.filter((segment) => segment.type === 'step').length,
    [segments],
  );

  const currentSegment = linkedPlayback ? null : (segments[currentIndex] ?? null);

  const selectBranchPath = useCallback((path: LinkedPeacockPath) => {
    setIsLoadingLinked(true);
    setLinkedError(null);
    void getFlowDocument(path.targetDocumentId)
      .then((doc) => {
        if (!doc) {
          setLinkedError('This linked demo is no longer available.');
          return;
        }
        const slice = getPlayableStepRange(doc.steps, path.fromStepId, path.toStepId);
        if (!slice?.length) {
          setLinkedError('The selected step range is empty.');
          return;
        }
        setLinkedPlayback({
          path,
          steps: slice,
          screenshotUrls: doc.screenshotUrls,
          stepIndex: 0,
        });
      })
      .finally(() => setIsLoadingLinked(false));
  }, []);

  const clearLinked = useCallback(() => {
    setLinkedPlayback(null);
    setLinkedError(null);
  }, []);

  const goNext = useCallback(() => {
    if (linkedPlayback) {
      if (linkedPlayback.stepIndex < linkedPlayback.steps.length - 1) {
        setLinkedPlayback((state) =>
          state ? { ...state, stepIndex: state.stepIndex + 1 } : state,
        );
        return;
      }
      clearLinked();
      setCurrentIndex((index) => Math.min(index + 1, segments.length - 1));
      return;
    }
    setCurrentIndex((index) => Math.min(index + 1, segments.length - 1));
  }, [linkedPlayback, segments.length, clearLinked]);

  const goPrevious = useCallback(() => {
    if (linkedPlayback) {
      if (linkedPlayback.stepIndex > 0) {
        setLinkedPlayback((state) =>
          state ? { ...state, stepIndex: state.stepIndex - 1 } : state,
        );
        return;
      }
      clearLinked();
      return;
    }
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, [linkedPlayback, clearLinked]);

  useEffect(() => {
    if (currentIndex > segments.length - 1) {
      setCurrentIndex(Math.max(segments.length - 1, 0));
    }
  }, [currentIndex, segments.length]);

  return {
    segments,
    currentSegment,
    currentIndex,
    linkedPlayback,
    isLoadingLinked,
    linkedError,
    playableStepCount,
    selectBranchPath,
    goNext,
    goPrevious,
    setCurrentIndex,
  };
}
