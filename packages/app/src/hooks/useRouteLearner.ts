import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useSavedRoute } from '@/hooks/useSavedRoute';
import { listFlowSummaries } from '@/services/flowLibraryService';
import type { RouteLearnerGraphState } from '@/types/route';
import { isBranchNode, isFormNode, isInterestNode } from '@/types/route';
import type { SavedFlowSummary } from '@/types/savedFlow';
import { buildLearnerSegments } from '@/utils/routeNavigation';
import { getRouteNode } from '@/utils/routeGraph';
import {
  canAdvanceLearner,
  canRetreatLearner,
  createInitialLearnerState,
  getActiveDocumentId,
  getNextLearnerState,
  getPreviousLearnerState,
  isBranchNodeActive,
  isFormNodeActive,
  isInterestNodeActive,
} from '@/utils/routeLearnerGraph';
import {
  canAdvanceBySegment,
  canRetreatBySegment,
  getActiveSegmentIndex,
  getForwardSegmentTransition,
  getHighlightedSegmentIndex,
  getSegmentRetreatTarget,
  isAtFirstRouteStop,
  isAtLastRouteStop,
  isOnChapterSegment,
  learnerStateForSegment,
  segmentForTransition,
} from '@/utils/routeLearnerNavigation';
import {
  buildTransitionForSegment,
  getForwardTransition,
  getTransitionForCurrentPosition,
  isTransitionAtCurrentPosition,
  type RouteLearnerTransition,
} from '@/utils/routeLearnerTransitions';

export const useRouteLearner = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const { route, isLoading, isLoaded, error } = useSavedRoute(routeId);
  const [state, setState] = useState<RouteLearnerGraphState | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [pendingTransition, setPendingTransition] = useState<RouteLearnerTransition | null>(null);
  const [flowSummaries, setFlowSummaries] = useState<SavedFlowSummary[]>([]);
  const initialIntroCheckedRef = useRef(false);

  useEffect(() => {
    void listFlowSummaries().then(setFlowSummaries);
  }, []);

  useEffect(() => {
    if (!route) return;
    setState(createInitialLearnerState(route));
    setStepCount(0);
    setPendingTransition(null);
    initialIntroCheckedRef.current = false;
  }, [route, routeId]);

  const summariesById = useMemo(
    () => new Map(flowSummaries.map((summary) => [summary.id, summary])),
    [flowSummaries]
  );

  const segments = useMemo(
    () => (route && state ? buildLearnerSegments(route, state) : []),
    [route, state]
  );

  const activeSegmentIndex = useMemo(
    () => (state ? getActiveSegmentIndex(segments, state) : -1),
    [segments, state]
  );

  const highlightedSegmentIndex = useMemo(
    () =>
      state ? getHighlightedSegmentIndex(segments, state, pendingTransition) : -1,
    [segments, state, pendingTransition]
  );

  const usesLinearSegmentNav = segments.length > 0;

  const onChapterPath = Boolean(
    route && state && isOnChapterSegment(route, state, segments)
  );

  const isAtRouteStart = Boolean(
    state && usesLinearSegmentNav && isAtFirstRouteStop(segments, state)
  );

  const isAtRouteEnd = Boolean(
    state &&
      usesLinearSegmentNav &&
      isAtLastRouteStop(segments, state, stepCount) &&
      !pendingTransition
  );

  useEffect(() => {
    if (!route || !state || initialIntroCheckedRef.current) return;
    if (segments.length === 0) return;

    initialIntroCheckedRef.current = true;
    const intro = getTransitionForCurrentPosition(route, state, segments);
    if (intro) setPendingTransition(intro);
  }, [route, state, segments]);

  const currentNode = route && state ? getRouteNode(route, state.currentNodeId) : undefined;
  const activeDocumentId =
    route && state && !pendingTransition ? getActiveDocumentId(route, state) : null;
  const branchActive = route && state ? isBranchNodeActive(route, state) : false;
  const formActive = route && state ? isFormNodeActive(route, state) : false;
  const interestActive = route && state ? isInterestNodeActive(route, state) : false;
  const isInteractiveNode = branchActive || formActive || interestActive;
  const isTransitionActive = pendingTransition !== null;

  const applySegmentTarget = useCallback(
    (segmentIndex: number, stepIndex: number, showIntro: boolean) => {
      if (!route || !state) return;
      const segment = segments[segmentIndex];
      if (!segment) return;

      const documentChanged =
        segment.nodeId !== state.currentNodeId ||
        segment.peacockIndexInChapter !== state.peacockIndex;

      setState(learnerStateForSegment(state, segment, stepIndex));
      if (documentChanged) setStepCount(0);
      setPendingTransition(showIntro ? buildTransitionForSegment(route, segment) : null);
    },
    [route, state, segments]
  );

  const handleDocumentLoaded = useCallback((count: number) => {
    setStepCount(count);
    setState((current) => {
      if (!current) return current;
      return {
        ...current,
        stepIndex: Math.min(current.stepIndex, Math.max(count - 1, 0)),
      };
    });
  }, []);

  const confirmTransition = useCallback(() => {
    if (!route || !state || !pendingTransition) return;

    if (isTransitionAtCurrentPosition(route, state, pendingTransition)) {
      setPendingTransition(null);
      return;
    }

    const targetSegment = segmentForTransition(segments, pendingTransition);
    if (targetSegment) {
      const targetIndex = segments.findIndex(
        (segment) =>
          segment.nodeId === targetSegment.nodeId &&
          segment.peacockIndexInChapter === targetSegment.peacockIndexInChapter
      );
      if (targetIndex >= 0) {
        applySegmentTarget(targetIndex, 0, false);
        return;
      }
    }

    const next = getNextLearnerState(route, state, stepCount);
    if (!next) {
      setPendingTransition(null);
      return;
    }

    setState(next);
    if (
      next.currentNodeId !== state.currentNodeId ||
      next.peacockIndex !== state.peacockIndex
    ) {
      setStepCount(0);
    }
    setPendingTransition(null);
  }, [route, state, stepCount, pendingTransition, segments, applySegmentTarget]);

  const canGoNext = useMemo(() => {
    if (!route || !state) return false;
    if (pendingTransition) return true;
    if (usesLinearSegmentNav && isAtLastRouteStop(segments, state, stepCount)) return false;
    if (isInteractiveNode) return canAdvanceLearner(route, state, stepCount);
    if (onChapterPath || activeSegmentIndex >= 0) {
      if (getForwardSegmentTransition(route, segments, state, stepCount)) return true;
      return canAdvanceBySegment(segments, state, stepCount);
    }
    const forwardTransition = getForwardTransition(route, state, stepCount, segments);
    if (forwardTransition) return true;
    return canAdvanceLearner(route, state, stepCount);
  }, [
    route,
    state,
    stepCount,
    pendingTransition,
    isInteractiveNode,
    segments,
    onChapterPath,
    activeSegmentIndex,
    usesLinearSegmentNav,
  ]);

  const canGoPrevious = useMemo(() => {
    if (!route || !state) return false;
    if (pendingTransition) {
      if (isTransitionAtCurrentPosition(route, state, pendingTransition)) {
        if (usesLinearSegmentNav) {
          return canRetreatBySegment(segments, state, stepCount);
        }
        return canRetreatLearner(state);
      }
      return true;
    }
    if (usesLinearSegmentNav && (onChapterPath || activeSegmentIndex >= 0)) {
      return canRetreatBySegment(segments, state, stepCount);
    }
    return canRetreatLearner(state);
  }, [
    route,
    state,
    pendingTransition,
    segments,
    stepCount,
    onChapterPath,
    activeSegmentIndex,
    usesLinearSegmentNav,
  ]);

  const isComplete = Boolean(
    route && state && isAtRouteEnd && !isInteractiveNode
  );

  const handleNext = useCallback(() => {
    if (!route || !state) return;
    if (pendingTransition) {
      confirmTransition();
      return;
    }

    if (onChapterPath) {
      const segmentForward = getForwardSegmentTransition(route, segments, state, stepCount);
      if (segmentForward) {
        setPendingTransition(segmentForward);
        return;
      }

      if (stepCount > 0 && state.stepIndex < stepCount - 1) {
        setState(getNextLearnerState(route, state, stepCount) ?? state);
        return;
      }
    } else {
      const forwardTransition = getForwardTransition(route, state, stepCount, segments);
      if (forwardTransition) {
        setPendingTransition(forwardTransition);
        return;
      }
    }

    const next = getNextLearnerState(route, state, stepCount);
    if (!next) return;
    setState(next);
    if (next.currentNodeId !== state.currentNodeId || next.peacockIndex !== state.peacockIndex) {
      setStepCount(0);
    }
  }, [
    route,
    state,
    stepCount,
    pendingTransition,
    confirmTransition,
    segments,
    onChapterPath,
  ]);

  const retreatBySegmentOrHistory = useCallback(() => {
    if (!route || !state) return;

    const segmentTarget = getSegmentRetreatTarget(segments, state, stepCount);
    if (segmentTarget && onChapterPath) {
      const segmentIndex = segments.findIndex(
        (segment) =>
          segment.nodeId === segmentTarget.segment.nodeId &&
          segment.peacockIndexInChapter === segmentTarget.segment.peacockIndexInChapter
      );
      if (segmentIndex >= 0) {
        applySegmentTarget(segmentIndex, segmentTarget.stepIndex, segmentTarget.showIntro);
        return;
      }
    }

    if (!usesLinearSegmentNav) {
      const previous = getPreviousLearnerState(state);
      if (!previous) return;

      setState(previous);
      if (
        previous.currentNodeId !== state.currentNodeId ||
        previous.peacockIndex !== state.peacockIndex
      ) {
        setStepCount(0);
      }
      setPendingTransition(getTransitionForCurrentPosition(route, previous, segments));
    }
  }, [route, state, segments, stepCount, onChapterPath, applySegmentTarget, usesLinearSegmentNav]);

  const handlePrevious = useCallback(() => {
    if (!route || !state) return;

    if (pendingTransition) {
      if (isTransitionAtCurrentPosition(route, state, pendingTransition)) {
        retreatBySegmentOrHistory();
        return;
      }
      setPendingTransition(null);
      return;
    }

    retreatBySegmentOrHistory();
  }, [route, state, pendingTransition, retreatBySegmentOrHistory]);

  const handleBranchSelect = useCallback((optionId: string) => {
    if (!state) return;
    setState({
      ...state,
      branchChoices: { ...state.branchChoices, [state.currentNodeId]: optionId },
    });
  }, [state]);

  const handleFormChange = useCallback((fieldId: string, value: string) => {
    if (!state) return;
    const nodeId = state.currentNodeId;
    setState({
      ...state,
      formResponses: {
        ...state.formResponses,
        [nodeId]: { ...(state.formResponses[nodeId] ?? {}), [fieldId]: value },
      },
    });
  }, [state]);

  const handleInterestToggle = useCallback(
    (topicId: string) => {
      if (!route || !state) return;
      const node = getRouteNode(route, state.currentNodeId);
      if (!node || node.type !== 'interest') return;

      const current = state.interestChoices[node.id] ?? [];
      const next = node.allowMultiple
        ? current.includes(topicId)
          ? current.filter((id) => id !== topicId)
          : [...current, topicId]
        : current.includes(topicId)
          ? []
          : [topicId];

      setState({
        ...state,
        interestChoices: { ...state.interestChoices, [node.id]: next },
      });
    },
    [route, state]
  );

  const handleSelectSegment = useCallback(
    (segmentIndex: number) => {
      if (!route || !state) return;
      const segment = segments[segmentIndex];
      if (!segment) return;
      applySegmentTarget(segmentIndex, 0, true);
    },
    [route, state, segments, applySegmentTarget]
  );

  const goToFirstSegment = useCallback(() => {
    if (segments.length > 0) handleSelectSegment(0);
  }, [segments.length, handleSelectSegment]);

  const goToLastSegment = useCallback(() => {
    if (segments.length > 0) handleSelectSegment(segments.length - 1);
  }, [segments.length, handleSelectSegment]);

  useKeyboard(
    useMemo(
      () => ({
        ArrowRight: () => {
          if (canGoNext) handleNext();
        },
        ArrowLeft: () => {
          if (canGoPrevious) handlePrevious();
        },
      }),
      [canGoNext, canGoPrevious, handleNext, handlePrevious]
    )
  );

  const hasPlayableContent = Boolean(
    route?.nodes.some(
      (node) =>
        (node.type === 'chapter' && node.peacocks.length > 0) ||
        node.type === 'branch' ||
        node.type === 'form' ||
        node.type === 'interest'
    )
  );

  const formResponses =
    formActive && currentNode && isFormNode(currentNode)
      ? state?.formResponses[currentNode.id] ?? {}
      : {};

  const selectedTopicIds =
    interestActive && currentNode && isInterestNode(currentNode)
      ? state?.interestChoices[currentNode.id] ?? []
      : [];

  const pendingDemoSummary =
    pendingTransition?.kind === 'demo'
      ? summariesById.get(pendingTransition.documentId)
      : undefined;

  const activeSegment = activeSegmentIndex >= 0 ? segments[activeSegmentIndex] : undefined;

  return {
    routeId,
    route,
    isLoading,
    isLoaded,
    error,
    state,
    segments,
    activeSegmentIndex,
    highlightedSegmentIndex,
    activeSegment,
    isAtRouteStart,
    isAtRouteEnd,
    stepCount,
    pendingTransition,
    pendingDemoSummary,
    currentNode,
    activeDocumentId,
    branchActive,
    formActive,
    interestActive,
    isInteractiveNode,
    isTransitionActive,
    isComplete,
    canGoNext,
    canGoPrevious,
    hasPlayableContent,
    formResponses,
    selectedTopicIds,
    handleDocumentLoaded,
    handleNext,
    handlePrevious,
    handleBranchSelect,
    handleFormChange,
    handleInterestToggle,
    handleSelectSegment,
    goToFirstSegment,
    goToLastSegment,
    confirmTransition,
  };
};
