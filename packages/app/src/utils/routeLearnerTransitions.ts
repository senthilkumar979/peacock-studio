import type { RouteChapterNode, RouteLearnerGraphState, RouteSegment, SavedRoute } from '@/types/route';
import { getRouteNode, resolveNextNodeId } from '@/utils/routeGraph';

export interface RouteChapterTransition {
  kind: 'chapter';
  nodeId: string;
  title: string;
  description: string;
  chapterIndex: number;
  demoCount: number;
}

export interface RouteDemoTransition {
  kind: 'demo';
  nodeId: string;
  documentId: string;
  peacockIndex: number;
  chapterTitle: string;
  chapterIndex: number;
  demoNumber: number;
  demoCount: number;
  demoLabel?: string;
}

export type RouteLearnerTransition = RouteChapterTransition | RouteDemoTransition;

function getPathChoices(state: RouteLearnerGraphState) {
  return {
    branchChoices: state.branchChoices,
    interestChoices: state.interestChoices,
  };
}

export function buildChapterTransition(
  route: SavedRoute,
  chapter: RouteChapterNode,
  chapterIndex: number
): RouteChapterTransition {
  return {
    kind: 'chapter',
    nodeId: chapter.id,
    title: chapter.title,
    description: chapter.description,
    chapterIndex,
    demoCount: chapter.peacocks.length,
  };
}

export function buildDemoTransition(
  route: SavedRoute,
  segment: RouteSegment
): RouteDemoTransition {
  const chapter = getRouteNode(route, segment.nodeId);
  const demoCount =
    chapter?.type === 'chapter' ? chapter.peacocks.length : 1;
  const peacock =
    chapter?.type === 'chapter'
      ? [...chapter.peacocks]
          .sort((a, b) => a.order - b.order)
          .find((item) => item.id === segment.peacockRefId)
      : undefined;

  return {
    kind: 'demo',
    nodeId: segment.nodeId,
    documentId: segment.documentId,
    peacockIndex: segment.peacockIndexInChapter,
    chapterTitle: segment.chapterTitle,
    chapterIndex: segment.chapterIndex,
    demoNumber: segment.peacockIndexInChapter + 1,
    demoCount,
    demoLabel: peacock?.label,
  };
}

export function buildTransitionForSegment(
  route: SavedRoute,
  segment: RouteSegment
): RouteLearnerTransition {
  if (segment.peacockIndexInChapter === 0) {
    const chapter = getRouteNode(route, segment.nodeId);
    if (chapter?.type === 'chapter') {
      return buildChapterTransition(route, chapter, segment.chapterIndex);
    }
  }

  return buildDemoTransition(route, segment);
}

/** Intro for the current stop (chapter or demo) when at step 0 of that stop. */
export function getTransitionForCurrentPosition(
  route: SavedRoute,
  state: RouteLearnerGraphState,
  segments: RouteSegment[]
): RouteLearnerTransition | null {
  if (state.stepIndex !== 0) return null;

  const node = getRouteNode(route, state.currentNodeId);
  if (!node || node.type !== 'chapter' || node.peacocks.length === 0) return null;

  const segment = segments.find(
    (item) =>
      item.nodeId === state.currentNodeId &&
      item.peacockIndexInChapter === state.peacockIndex
  );
  if (!segment) return null;

  if (state.peacockIndex === 0) {
    return buildChapterTransition(route, node, segment.chapterIndex);
  }

  return buildDemoTransition(route, segment);
}

function chapterIndexFromSegments(segments: RouteSegment[], nodeId: string): number {
  return segments.find((segment) => segment.nodeId === nodeId)?.chapterIndex ?? 0;
}

export function getForwardTransition(
  route: SavedRoute,
  state: RouteLearnerGraphState,
  stepCount: number,
  segments: RouteSegment[]
): RouteLearnerTransition | null {
  const node = getRouteNode(route, state.currentNodeId);
  if (!node) return null;

  const choices = getPathChoices(state);

  if (node.type === 'branch' || node.type === 'form' || node.type === 'interest') {
    const nextNodeId = resolveNextNodeId(route, node.id, choices);
    if (!nextNodeId) return null;
    const nextNode = getRouteNode(route, nextNodeId);
    if (nextNode?.type === 'chapter' && nextNode.peacocks.length > 0) {
      return buildChapterTransition(
        route,
        nextNode,
        chapterIndexFromSegments(segments, nextNode.id)
      );
    }
    return null;
  }

  if (node.type !== 'chapter') return null;

  const sorted = [...node.peacocks].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) {
    const nextNodeId = resolveNextNodeId(route, node.id, choices);
    const nextNode = nextNodeId ? getRouteNode(route, nextNodeId) : undefined;
    if (nextNode?.type === 'chapter' && nextNode.peacocks.length > 0) {
      return buildChapterTransition(
        route,
        nextNode,
        chapterIndexFromSegments(segments, nextNode.id)
      );
    }
    return null;
  }

  const atLastStep = stepCount === 0 || state.stepIndex >= stepCount - 1;
  if (!atLastStep) return null;

  if (state.peacockIndex < sorted.length - 1) {
    const nextPeacock = sorted[state.peacockIndex + 1];
    if (!nextPeacock) return null;
    return {
      kind: 'demo',
      nodeId: node.id,
      documentId: nextPeacock.documentId,
      peacockIndex: state.peacockIndex + 1,
      chapterTitle: node.title,
      chapterIndex: chapterIndexFromSegments(segments, node.id),
      demoNumber: state.peacockIndex + 2,
      demoCount: sorted.length,
      demoLabel: nextPeacock.label,
    };
  }

  const nextNodeId = resolveNextNodeId(route, node.id, choices);
  const nextNode = nextNodeId ? getRouteNode(route, nextNodeId) : undefined;
  if (nextNode?.type === 'chapter' && nextNode.peacocks.length > 0) {
    return buildChapterTransition(
      route,
      nextNode,
      chapterIndexFromSegments(segments, nextNode.id)
    );
  }

  return null;
}

export function isTransitionAtCurrentPosition(
  route: SavedRoute,
  state: RouteLearnerGraphState,
  transition: RouteLearnerTransition
): boolean {
  if (transition.kind === 'chapter') {
    return (
      state.currentNodeId === transition.nodeId &&
      state.peacockIndex === 0 &&
      state.stepIndex === 0
    );
  }

  return (
    state.currentNodeId === transition.nodeId &&
    state.peacockIndex === transition.peacockIndex &&
    state.stepIndex === 0
  );
}
