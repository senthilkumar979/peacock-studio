import type { RouteLearnerGraphState, RoutePathChoices, RouteSegment, SavedRoute } from '@/types/route';
import {
  flattenRouteSegments,
  flattenRouteSegmentsForPath,
} from '@/utils/routeGraph';

export { countRoutePeacocks, flattenRouteSegments, flattenRouteSegmentsForPath } from '@/utils/routeGraph';

export function getRouteLearnerLabel(
  segments: RouteSegment[],
  segmentIndex: number
): string {
  const segment = segments[segmentIndex];
  if (!segment) return 'Route';

  return `Chapter ${segment.chapterIndex + 1} · Demo ${segment.peacockIndexInChapter + 1}`;
}

/** @deprecated Linear-only helpers retained for compatibility. */
export interface RouteLearnerPosition {
  segmentIndex: number;
  stepIndex: number;
}

export function canAdvanceRouteLearner(
  segments: RouteSegment[],
  position: RouteLearnerPosition,
  stepCount: number
): boolean {
  if (stepCount === 0) return position.segmentIndex < segments.length - 1;
  if (position.stepIndex < stepCount - 1) return true;
  return position.segmentIndex < segments.length - 1;
}

export function canRetreatRouteLearner(position: RouteLearnerPosition): boolean {
  if (position.stepIndex > 0) return true;
  return position.segmentIndex > 0;
}

export function getNextRouteLearnerPosition(
  segments: RouteSegment[],
  position: RouteLearnerPosition,
  stepCount: number
): RouteLearnerPosition | null {
  if (stepCount > 0 && position.stepIndex < stepCount - 1) {
    return { ...position, stepIndex: position.stepIndex + 1 };
  }

  if (position.segmentIndex >= segments.length - 1) return null;

  return {
    segmentIndex: position.segmentIndex + 1,
    stepIndex: 0,
  };
}

export function getPreviousRouteLearnerPosition(
  position: RouteLearnerPosition,
  previousSegmentStepCount: number
): RouteLearnerPosition | null {
  if (position.stepIndex > 0) {
    return { ...position, stepIndex: position.stepIndex - 1 };
  }

  if (position.segmentIndex <= 0) return null;

  return {
    segmentIndex: position.segmentIndex - 1,
    stepIndex: Math.max(previousSegmentStepCount - 1, 0),
  };
}

export function buildLearnerSegments(
  route: SavedRoute,
  state: RouteLearnerGraphState
): RouteSegment[] {
  return flattenRouteSegmentsForPath(route, {
    branchChoices: state.branchChoices,
    interestChoices: state.interestChoices,
  });
}

export function getDefaultLearnerSegments(route: SavedRoute): RouteSegment[] {
  return flattenRouteSegments(route);
}
