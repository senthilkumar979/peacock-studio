import { describe, expect, it } from 'vitest';
import type { RouteLearnerGraphState, SavedRoute } from '@/types/route';
import {
  canAdvanceLearner,
  canRetreatLearner,
  createInitialLearnerState,
  getActiveDocumentId,
  getActiveSegmentIndex,
  getNextLearnerState,
  getPreviousLearnerState,
  isBranchNodeActive,
  isFormComplete,
  isFormNodeActive,
  isInterestComplete,
  isInterestNodeActive,
} from './routeLearnerGraph';
import { flattenRouteSegments } from './routeGraph';

function makeRoute(): SavedRoute {
  return {
    id: 'r1',
    title: 'R',
    description: '',
    status: 'draft',
    entryNodeId: 'c1',
    nodes: [
      {
        id: 'c1',
        type: 'chapter',
        title: 'Start',
        description: '',
        peacocks: [
          { id: 'p0', documentId: 'd0', order: 0 },
          { id: 'p1', documentId: 'd1', order: 1 },
        ],
        position: { x: 0, y: 0 },
      },
      {
        id: 'b1',
        type: 'branch',
        title: 'Pick',
        description: '',
        options: [
          { id: 'opt-a', label: 'A' },
          { id: 'opt-b', label: 'B' },
        ],
        position: { x: 0, y: 0 },
      },
      {
        id: 'f1',
        type: 'form',
        title: 'Form',
        description: '',
        fields: [
          { id: 'name', label: 'Name', type: 'text', required: true },
          { id: 'note', label: 'Note', type: 'text', required: false },
        ],
        position: { x: 0, y: 0 },
      },
      {
        id: 'i1',
        type: 'interest',
        title: 'Topics',
        description: '',
        topics: [{ id: 't1', label: 'T' }],
        allowMultiple: false,
        position: { x: 0, y: 0 },
      },
      {
        id: 'c2',
        type: 'chapter',
        title: 'End',
        description: '',
        peacocks: [{ id: 'p2', documentId: 'd2', order: 0 }],
        position: { x: 0, y: 0 },
      },
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'c1', targetNodeId: 'b1' },
      { id: 'e2', sourceNodeId: 'b1', targetNodeId: 'c2', sourceHandle: 'opt-a' },
      { id: 'e3', sourceNodeId: 'f1', targetNodeId: 'c2' },
      { id: 'e4', sourceNodeId: 'i1', targetNodeId: 'c2', sourceHandle: 't1' },
    ],
    createdAt: 1,
    updatedAt: 2,
  };
}

describe('routeLearnerGraph', () => {
  it('creates initial state and detects active node types', () => {
    const route = makeRoute();
    const state = createInitialLearnerState(route);
    expect(state.currentNodeId).toBe('c1');
    expect(isBranchNodeActive(route, { ...state, currentNodeId: 'b1' })).toBe(true);
    expect(isFormNodeActive(route, { ...state, currentNodeId: 'f1' })).toBe(true);
    expect(isInterestNodeActive(route, { ...state, currentNodeId: 'i1' })).toBe(true);
  });

  it('validates form and interest completion', () => {
    const route = makeRoute();
    const base = createInitialLearnerState(route);
    const formState: RouteLearnerGraphState = { ...base, currentNodeId: 'f1' };
    expect(isFormComplete(route, formState)).toBe(false);
    expect(
      isFormComplete(route, {
        ...formState,
        formResponses: { f1: { name: 'Ada' } },
      }),
    ).toBe(true);

    const interestState: RouteLearnerGraphState = { ...base, currentNodeId: 'i1' };
    expect(isInterestComplete(route, interestState)).toBe(false);
    expect(
      isInterestComplete(route, {
        ...interestState,
        interestChoices: { i1: ['t1'] },
      }),
    ).toBe(true);
  });

  it('advances through chapter steps, peacocks, and next nodes', () => {
    const route = makeRoute();
    let state = createInitialLearnerState(route);
    expect(canAdvanceLearner(route, state, 3)).toBe(true);
    state = getNextLearnerState(route, state, 3)!;
    expect(state.stepIndex).toBe(1);
    state = getNextLearnerState(route, state, 3)!;
    expect(state.stepIndex).toBe(2);
    state = getNextLearnerState(route, state, 3)!;
    expect(state.peacockIndex).toBe(1);
    expect(state.stepIndex).toBe(0);
    state = getNextLearnerState(route, state, 1)!;
    expect(state.currentNodeId).toBe('b1');
    expect(canRetreatLearner(state)).toBe(true);
    const previous = getPreviousLearnerState(state);
    expect(previous).not.toBeNull();
    expect(previous!.history.length).toBe(state.history.length - 1);
  });

  it('requires branch choice before advancing', () => {
    const route = makeRoute();
    const state: RouteLearnerGraphState = {
      ...createInitialLearnerState(route),
      currentNodeId: 'b1',
    };
    expect(canAdvanceLearner(route, state, 0)).toBe(false);
    const chosen = {
      ...state,
      branchChoices: { b1: 'opt-a' },
    };
    expect(canAdvanceLearner(route, chosen, 0)).toBe(true);
    expect(getNextLearnerState(route, chosen, 0)?.currentNodeId).toBe('c2');
  });

  it('resolves active document and segment index', () => {
    const route = makeRoute();
    const state = createInitialLearnerState(route);
    expect(getActiveDocumentId(route, state)).toBe('d0');
    const segments = flattenRouteSegments(route);
    expect(getActiveSegmentIndex(segments, { ...state, peacockIndex: 1 })).toBe(1);
  });
});
