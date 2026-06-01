import type { RouteLearnerGraphState, RouteSegment, SavedRoute } from '@/types/route';
import { getRouteNode } from '@/utils/routeGraph';
import { segmentIndexForNodePeacock } from '@/utils/routeGraph';
import { buildTransitionForSegment } from '@/utils/routeLearnerTransitions';
import type { RouteLearnerTransition } from '@/utils/routeLearnerTransitions';

export function getActiveSegmentIndex(
  segments: RouteSegment[],
  state: RouteLearnerGraphState
): number {
  const index = segmentIndexForNodePeacock(
    segments,
    state.currentNodeId,
    state.peacockIndex
  );
  return index;
}

export function isOnChapterSegment(
  route: SavedRoute,
  state: RouteLearnerGraphState,
  segments: RouteSegment[]
): boolean {
  const node = getRouteNode(route, state.currentNodeId);
  if (!node || node.type !== 'chapter') return false;
  return getActiveSegmentIndex(segments, state) >= 0;
}

export function learnerStateForSegment(
  state: RouteLearnerGraphState,
  segment: RouteSegment,
  stepIndex: number
): RouteLearnerGraphState {
  return {
    ...state,
    currentNodeId: segment.nodeId,
    peacockIndex: segment.peacockIndexInChapter,
    stepIndex,
  };
}

export function segmentForTransition(
  segments: RouteSegment[],
  transition: RouteLearnerTransition
): RouteSegment | undefined {
  if (transition.kind === 'chapter') {
    return segments.find(
      (segment) =>
        segment.nodeId === transition.nodeId && segment.peacockIndexInChapter === 0
    );
  }

  return segments.find(
    (segment) =>
      segment.nodeId === transition.nodeId &&
      segment.peacockIndexInChapter === transition.peacockIndex
  );
}

export function getForwardSegmentTransition(
  route: SavedRoute,
  segments: RouteSegment[],
  state: RouteLearnerGraphState,
  stepCount: number
): RouteLearnerTransition | null {
  const segmentIndex = getActiveSegmentIndex(segments, state);
  if (segmentIndex < 0) return null;

  const atLastStep = stepCount === 0 || state.stepIndex >= stepCount - 1;
  if (!atLastStep) return null;

  const nextSegment = segments[segmentIndex + 1];
  if (!nextSegment) return null;

  return buildTransitionForSegment(route, nextSegment);
}

export interface SegmentRetreatTarget {
  segment: RouteSegment;
  stepIndex: number;
  showIntro: boolean;
}

export function getSegmentRetreatTarget(
  segments: RouteSegment[],
  state: RouteLearnerGraphState,
  stepCount: number
): SegmentRetreatTarget | null {
  const segmentIndex = getActiveSegmentIndex(segments, state);
  if (segmentIndex < 0) return null;

  if (state.stepIndex > 0) {
    const segment = segments[segmentIndex];
    if (!segment) return null;
    return { segment, stepIndex: state.stepIndex - 1, showIntro: false };
  }

  if (segmentIndex <= 0) return null;

  const segment = segments[segmentIndex - 1];
  if (!segment) return null;
  return { segment, stepIndex: 0, showIntro: true };
}

export function canRetreatBySegment(
  segments: RouteSegment[],
  state: RouteLearnerGraphState,
  stepCount: number
): boolean {
  return getSegmentRetreatTarget(segments, state, stepCount) !== null;
}

export function canAdvanceBySegment(
  segments: RouteSegment[],
  state: RouteLearnerGraphState,
  stepCount: number
): boolean {
  const segmentIndex = getActiveSegmentIndex(segments, state);
  if (segmentIndex < 0) return false;

  if (stepCount > 0 && state.stepIndex < stepCount - 1) return true;
  return segmentIndex < segments.length - 1;
}

export function isAtFirstRouteStop(
  segments: RouteSegment[],
  state: RouteLearnerGraphState
): boolean {
  if (segments.length === 0) return true;
  return getActiveSegmentIndex(segments, state) === 0 && state.stepIndex === 0;
}

export function isAtLastRouteStop(
  segments: RouteSegment[],
  state: RouteLearnerGraphState,
  stepCount: number
): boolean {
  if (segments.length === 0) return false;
  const segmentIndex = getActiveSegmentIndex(segments, state);
  if (segmentIndex < 0 || segmentIndex < segments.length - 1) return false;
  return stepCount === 0 || state.stepIndex >= stepCount - 1;
}

export function getHighlightedSegmentIndex(
  segments: RouteSegment[],
  state: RouteLearnerGraphState,
  pendingTransition: RouteLearnerTransition | null
): number {
  if (pendingTransition) {
    const target = segmentForTransition(segments, pendingTransition);
    if (target) {
      const index = segments.findIndex(
        (segment) =>
          segment.nodeId === target.nodeId &&
          segment.peacockIndexInChapter === target.peacockIndexInChapter
      );
      if (index >= 0) return index;
    }
  }
  return getActiveSegmentIndex(segments, state);
}

export interface LearnerChapterOutlineDemo {
  segmentIndex: number;
  label: string;
}

export interface LearnerChapterOutline {
  chapterId: string;
  chapterIndex: number;
  title: string;
  description: string;
  demos: LearnerChapterOutlineDemo[];
}

export function buildLearnerChapterOutline(segments: RouteSegment[]): LearnerChapterOutline[] {
  const byChapterIndex = new Map<number, LearnerChapterOutline>();

  segments.forEach((segment, segmentIndex) => {
    let chapter = byChapterIndex.get(segment.chapterIndex);
    if (!chapter) {
      chapter = {
        chapterId: segment.nodeId,
        chapterIndex: segment.chapterIndex,
        title: segment.chapterTitle,
        description: segment.chapterDescription,
        demos: [],
      };
      byChapterIndex.set(segment.chapterIndex, chapter);
    }

    chapter.demos.push({
      segmentIndex,
      label: `Demo ${segment.peacockIndexInChapter + 1}`,
    });
  });

  return [...byChapterIndex.values()].sort((a, b) => a.chapterIndex - b.chapterIndex);
}
