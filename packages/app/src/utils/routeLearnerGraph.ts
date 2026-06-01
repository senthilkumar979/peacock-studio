import type { RouteLearnerGraphState, RouteSegment, SavedRoute } from '@/types/route';
import { getRouteNode, resolveNextNodeId, segmentIndexForNodePeacock } from '@/utils/routeGraph';

export function createInitialLearnerState(route: SavedRoute): RouteLearnerGraphState {
  return {
    currentNodeId: route.entryNodeId,
    peacockIndex: 0,
    stepIndex: 0,
    branchChoices: {},
    interestChoices: {},
    formResponses: {},
    history: [],
  };
}

function getPathChoices(state: RouteLearnerGraphState) {
  return {
    branchChoices: state.branchChoices,
    interestChoices: state.interestChoices,
  };
}

export function isBranchNodeActive(route: SavedRoute, state: RouteLearnerGraphState): boolean {
  return getRouteNode(route, state.currentNodeId)?.type === 'branch';
}

export function isInterestNodeActive(route: SavedRoute, state: RouteLearnerGraphState): boolean {
  return getRouteNode(route, state.currentNodeId)?.type === 'interest';
}

export function isFormNodeActive(route: SavedRoute, state: RouteLearnerGraphState): boolean {
  return getRouteNode(route, state.currentNodeId)?.type === 'form';
}

export function isFormComplete(route: SavedRoute, state: RouteLearnerGraphState): boolean {
  const node = getRouteNode(route, state.currentNodeId);
  if (!node || node.type !== 'form') return true;

  const responses = state.formResponses[node.id] ?? {};
  return node.fields.every((field) => !field.required || responses[field.id]?.trim());
}

export function isInterestComplete(route: SavedRoute, state: RouteLearnerGraphState): boolean {
  const node = getRouteNode(route, state.currentNodeId);
  if (!node || node.type !== 'interest') return true;
  return (state.interestChoices[node.id]?.length ?? 0) > 0;
}

export function canAdvanceLearner(
  route: SavedRoute,
  state: RouteLearnerGraphState,
  stepCount: number
): boolean {
  const node = getRouteNode(route, state.currentNodeId);
  if (!node) return false;

  if (node.type === 'branch') {
    return Boolean(
      state.branchChoices[node.id] &&
        resolveNextNodeId(route, node.id, getPathChoices(state))
    );
  }

  if (node.type === 'interest') {
    return Boolean(
      isInterestComplete(route, state) &&
        resolveNextNodeId(route, node.id, getPathChoices(state))
    );
  }

  if (node.type === 'form') {
    return Boolean(
      isFormComplete(route, state) && resolveNextNodeId(route, node.id, getPathChoices(state))
    );
  }

  const sortedPeacocks = [...node.peacocks].sort((a, b) => a.order - b.order);
  if (sortedPeacocks.length === 0) {
    return Boolean(resolveNextNodeId(route, node.id, getPathChoices(state)));
  }

  if (stepCount > 0 && state.stepIndex < stepCount - 1) return true;
  if (state.peacockIndex < sortedPeacocks.length - 1) return true;

  return Boolean(resolveNextNodeId(route, node.id, getPathChoices(state)));
}

export function canRetreatLearner(state: RouteLearnerGraphState): boolean {
  return state.history.length > 0;
}

function pushLearnerHistory(state: RouteLearnerGraphState): RouteLearnerGraphState {
  return {
    ...state,
    history: [
      ...state.history,
      {
        nodeId: state.currentNodeId,
        peacockIndex: state.peacockIndex,
        stepIndex: state.stepIndex,
      },
    ],
  };
}

export function getNextLearnerState(
  route: SavedRoute,
  state: RouteLearnerGraphState,
  stepCount: number
): RouteLearnerGraphState | null {
  const node = getRouteNode(route, state.currentNodeId);
  if (!node) return null;

  if (node.type === 'branch' || node.type === 'interest' || node.type === 'form') {
    const nextNodeId = resolveNextNodeId(route, node.id, getPathChoices(state));
    if (!nextNodeId) return null;

    return pushLearnerHistory({
      ...state,
      currentNodeId: nextNodeId,
      peacockIndex: 0,
      stepIndex: 0,
    });
  }

  const sortedPeacocks = [...node.peacocks].sort((a, b) => a.order - b.order);

  if (sortedPeacocks.length === 0) {
    const nextNodeId = resolveNextNodeId(route, node.id, getPathChoices(state));
    if (!nextNodeId) return null;
    return pushLearnerHistory({
      ...state,
      currentNodeId: nextNodeId,
      peacockIndex: 0,
      stepIndex: 0,
    });
  }

  if (stepCount > 0 && state.stepIndex < stepCount - 1) {
    return pushLearnerHistory({ ...state, stepIndex: state.stepIndex + 1 });
  }

  if (state.peacockIndex < sortedPeacocks.length - 1) {
    return pushLearnerHistory({
      ...state,
      peacockIndex: state.peacockIndex + 1,
      stepIndex: 0,
    });
  }

  const nextNodeId = resolveNextNodeId(route, node.id, getPathChoices(state));
  if (!nextNodeId) return null;

  return pushLearnerHistory({
    ...state,
    currentNodeId: nextNodeId,
    peacockIndex: 0,
    stepIndex: 0,
  });
}

export function getPreviousLearnerState(state: RouteLearnerGraphState): RouteLearnerGraphState | null {
  if (state.history.length === 0) return null;

  const previous = state.history[state.history.length - 1];
  if (!previous) return null;

  return {
    ...state,
    currentNodeId: previous.nodeId,
    peacockIndex: previous.peacockIndex,
    stepIndex: previous.stepIndex,
    history: state.history.slice(0, -1),
  };
}

export function getActiveDocumentId(
  route: SavedRoute,
  state: RouteLearnerGraphState
): string | null {
  const node = getRouteNode(route, state.currentNodeId);
  if (!node || node.type !== 'chapter') return null;

  const sorted = [...node.peacocks].sort((a, b) => a.order - b.order);
  return sorted[state.peacockIndex]?.documentId ?? null;
}

export function getActiveSegmentIndex(
  segments: RouteSegment[],
  state: RouteLearnerGraphState
): number {
  const index = segmentIndexForNodePeacock(segments, state.currentNodeId, state.peacockIndex);
  return index >= 0 ? index : 0;
}
