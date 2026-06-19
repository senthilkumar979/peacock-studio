import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPlayableStepRange,
  getPlayerOutlineSegments,
  sortBranchPaths,
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
  isAtIntro: boolean;
  isAtFinale: boolean;
  linkedPlayback: LinkedPlayback | null;
  isLoadingLinked: boolean;
  linkedError: string | null;
  playableStepCount: number;
  sectionCount: number;
  branchCount: number;
  selectBranchPath: (path: LinkedPeacockPath) => void;
  selectedPathByBranchId: Record<string, string>;
  setBranchPathSelection: (branchId: string, pathId: string) => void;
  goNext: () => void;
  goPrevious: () => void;
  replay: () => void;
  setCurrentIndex: (index: number) => void;
}

function getSegmentIndex(currentIndex: number): number {
  return currentIndex - 1;
}

export function useBranchingPlayback(): UseBranchingPlaybackResult {
  const outline = useViewerOutline();
  const segments = useMemo(() => getPlayerOutlineSegments(outline), [outline]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [linkedPlayback, setLinkedPlayback] = useState<LinkedPlayback | null>(null);
  const [isLoadingLinked, setIsLoadingLinked] = useState(false);
  const [linkedError, setLinkedError] = useState<string | null>(null);
  const [selectedPathByBranchId, setSelectedPathByBranchId] = useState<Record<string, string>>(
    {},
  );

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

  const finaleIndex = segments.length + 1;
  const totalNavigableSegments = segments.length + 2;
  const isAtIntro = !linkedPlayback && currentIndex === 0;
  const isAtFinale = !linkedPlayback && currentIndex >= finaleIndex;
  const segmentIndex = getSegmentIndex(currentIndex);
  const currentSegment =
    linkedPlayback || isAtIntro || isAtFinale ? null : (segments[segmentIndex] ?? null);

  useEffect(() => {
    for (const segment of segments) {
      if (segment.type !== 'branch') continue;
      const firstPath = sortBranchPaths(segment.branch.paths)[0];
      if (!firstPath) continue;

      setSelectedPathByBranchId((current) => {
        if (current[segment.branch.id]) return current;
        return { ...current, [segment.branch.id]: firstPath.id };
      });
    }
  }, [segments]);

  const setBranchPathSelection = useCallback((branchId: string, pathId: string) => {
    setSelectedPathByBranchId((current) => ({ ...current, [branchId]: pathId }));
  }, []);

  const getSelectedBranchPath = useCallback(
    (branch: PlayerOutlineSegment & { type: 'branch' }): LinkedPeacockPath | null => {
      const paths = sortBranchPaths(branch.branch.paths);
      if (!paths.length) return null;

      const selectedPathId = selectedPathByBranchId[branch.branch.id];
      return paths.find((path) => path.id === selectedPathId) ?? paths[0] ?? null;
    },
    [selectedPathByBranchId],
  );

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
      setCurrentIndex((index) => Math.min(index + 1, finaleIndex));
      return;
    }

    setCurrentIndex((index) => {
      const segment = segments[getSegmentIndex(index)];
      if (segment?.type === 'branch') {
        const path = getSelectedBranchPath(segment);
        if (path) {
          selectBranchPath(path);
          return index;
        }
      }
      return Math.min(index + 1, finaleIndex);
    });
  }, [linkedPlayback, finaleIndex, clearLinked, segments, getSelectedBranchPath, selectBranchPath]);

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
    if (currentIndex > finaleIndex) {
      setCurrentIndex(finaleIndex);
    }
  }, [currentIndex, finaleIndex]);

  return {
    segments,
    currentSegment,
    currentIndex,
    totalNavigableSegments,
    isAtIntro,
    isAtFinale,
    linkedPlayback,
    isLoadingLinked,
    linkedError,
    playableStepCount,
    sectionCount,
    branchCount,
    selectBranchPath,
    selectedPathByBranchId,
    setBranchPathSelection,
    goNext,
    goPrevious,
    replay,
    setCurrentIndex,
  };
}
