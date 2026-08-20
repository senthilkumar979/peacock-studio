import { describe, expect, it } from 'vitest';
import type { RouteLearnerGraphState, RouteSegment, SavedRoute } from '@/types/route';
import {
  buildChapterTransition,
  buildDemoTransition,
  buildTransitionForSegment,
  getForwardTransition,
  getTransitionForCurrentPosition,
  isTransitionAtCurrentPosition,
} from './routeLearnerTransitions';

const route: SavedRoute = {
  id: 'r1',
  title: 'R',
  description: '',
  status: 'draft',
  entryNodeId: 'c1',
  nodes: [
    {
      id: 'c1',
      type: 'chapter',
      title: 'Intro',
      description: 'hello',
      peacocks: [
        { id: 'p0', documentId: 'd0', order: 0, label: 'First' },
        { id: 'p1', documentId: 'd1', order: 1, label: 'Second' },
      ],
      position: { x: 0, y: 0 },
    },
    {
      id: 'b1',
      type: 'branch',
      title: 'Branch',
      description: '',
      options: [{ id: 'go', label: 'Go' }],
      position: { x: 0, y: 0 },
    },
    {
      id: 'c2',
      type: 'chapter',
      title: 'Outro',
      description: '',
      peacocks: [{ id: 'p2', documentId: 'd2', order: 0 }],
      position: { x: 0, y: 0 },
    },
  ],
  edges: [
    { id: 'e1', sourceNodeId: 'c1', targetNodeId: 'b1' },
    { id: 'e2', sourceNodeId: 'b1', targetNodeId: 'c2', sourceHandle: 'go' },
  ],
  createdAt: 1,
  updatedAt: 2,
};

const segments: RouteSegment[] = [
  {
    nodeId: 'c1',
    chapterTitle: 'Intro',
    chapterDescription: 'hello',
    chapterIndex: 0,
    peacockRefId: 'p0',
    documentId: 'd0',
    peacockIndexInChapter: 0,
  },
  {
    nodeId: 'c1',
    chapterTitle: 'Intro',
    chapterDescription: 'hello',
    chapterIndex: 0,
    peacockRefId: 'p1',
    documentId: 'd1',
    peacockIndexInChapter: 1,
  },
  {
    nodeId: 'c2',
    chapterTitle: 'Outro',
    chapterDescription: '',
    chapterIndex: 1,
    peacockRefId: 'p2',
    documentId: 'd2',
    peacockIndexInChapter: 0,
  },
];

const state: RouteLearnerGraphState = {
  currentNodeId: 'c1',
  peacockIndex: 0,
  stepIndex: 0,
  branchChoices: {},
  interestChoices: {},
  formResponses: {},
  history: [],
};

describe('routeLearnerTransitions', () => {
  it('builds chapter and demo transitions', () => {
    const chapter = route.nodes[0];
    if (chapter?.type !== 'chapter') throw new Error('expected chapter');
    expect(buildChapterTransition(route, chapter, 0)).toMatchObject({
      kind: 'chapter',
      nodeId: 'c1',
      demoCount: 2,
    });
    expect(buildDemoTransition(route, segments[1]!)).toMatchObject({
      kind: 'demo',
      demoLabel: 'Second',
      demoNumber: 2,
    });
    expect(buildTransitionForSegment(route, segments[0]!).kind).toBe('chapter');
    expect(buildTransitionForSegment(route, segments[1]!).kind).toBe('demo');
  });

  it('returns intro transition only at step 0 of a chapter stop', () => {
    expect(getTransitionForCurrentPosition(route, state, segments)?.kind).toBe('chapter');
    expect(
      getTransitionForCurrentPosition(route, { ...state, peacockIndex: 1 }, segments)?.kind,
    ).toBe('demo');
    expect(getTransitionForCurrentPosition(route, { ...state, stepIndex: 1 }, segments)).toBeNull();
  });

  it('computes forward transitions across demos and branch nodes', () => {
    expect(getForwardTransition(route, state, 2, segments)).toBeNull();
    expect(
      getForwardTransition(route, { ...state, stepIndex: 1 }, 2, segments),
    ).toMatchObject({ kind: 'demo', peacockIndex: 1 });

    expect(
      getForwardTransition(
        route,
        { ...state, peacockIndex: 1, stepIndex: 0 },
        1,
        segments,
      ),
    ).toBeNull();

    expect(
      getForwardTransition(
        route,
        {
          ...state,
          currentNodeId: 'b1',
          branchChoices: { b1: 'go' },
        },
        0,
        segments,
      ),
    ).toMatchObject({ kind: 'chapter', nodeId: 'c2' });
  });

  it('checks whether a transition matches the current position', () => {
    const chapter = buildChapterTransition(
      route,
      route.nodes[0] as Extract<(typeof route.nodes)[number], { type: 'chapter' }>,
      0,
    );
    expect(isTransitionAtCurrentPosition(route, state, chapter)).toBe(true);
    expect(
      isTransitionAtCurrentPosition(route, state, {
        kind: 'demo',
        nodeId: 'c1',
        documentId: 'd1',
        peacockIndex: 1,
        chapterTitle: 'Intro',
        chapterIndex: 0,
        demoNumber: 2,
        demoCount: 2,
      }),
    ).toBe(false);
  });
});
