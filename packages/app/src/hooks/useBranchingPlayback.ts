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
  totalNavigableSegments: number;
  isAtFinale: boolean;
  linkedPlayback: LinkedPlayback | null;
  isLoadingLinked: boolean;
  linkedError: string | null;
  playableStepCount: number;
  sectionCount: number;
  branchCount: number;
  selectBranchPath: (path: LinkedPeacockPath) => void;
  goNext: () => void;
  goPrevious: () => void;
  replay: () => void;
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
  const sectionCount = useMemo(
    () => segments.filter((segment) => segment.type === 'section').length,
    [segments],
  );
  const branchCount = useMemo(
    () => segments.filter((segment) => segment.type === 'branch').length,
    [segments],
  );

  const totalNavigableSegments = segments.length + 1;
  const isAtFinale = !linkedPlayback && segments.length > 0 && currentIndex >= segments.length;
  const currentSegment = linkedPlayback || isAtFinale ? null : (segments[currentIndex] ?? null);

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

  const replay = useCallback(() => {
    clearLinked();
    setCurrentIndex(0);
  }, [clearLinked]);

  const goNext = useCallback(() => {
    if (linkedPlayback) {
      if (linkedPlayback.stepIndex < linkedPlayback.steps.length - 1) {
        setLinkedPlayback((state) =>
          state ? { ...state, stepIndex: state.stepIndex + 1 } : state,
        );
        return;
      }
      clearLinked();
      setCurrentIndex((index) => Math.min(index + 1, segments.length));
      return;
    }
    setCurrentIndex((index) => Math.min(index + 1, segments.length));
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
    if (currentIndex > segments.length) {
      setCurrentIndex(Math.max(segments.length, 0));
    }
  }, [currentIndex, segments.length]);

  return {
    segments,
    currentSegment,
    currentIndex,
    totalNavigableSegments,
    isAtFinale,
    linkedPlayback,
    isLoadingLinked,
    linkedError,
    playableStepCount,
    sectionCount,
    branchCount,
    selectBranchPath,
    goNext,
    goPrevious,
    replay,
    setCurrentIndex,
  };
}
