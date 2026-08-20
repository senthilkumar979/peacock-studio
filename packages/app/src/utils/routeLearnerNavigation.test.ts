import { describe, expect, it } from 'vitest';
import type { RouteLearnerGraphState, RouteSegment, SavedRoute } from '@/types/route';
import {
  buildLearnerChapterOutline,
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
} from './routeLearnerNavigation';

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
      title: 'Ch1',
      description: 'd',
      peacocks: [
        { id: 'p0', documentId: 'd0', order: 0 },
        { id: 'p1', documentId: 'd1', order: 1 },
      ],
      position: { x: 0, y: 0 },
    },
    {
      id: 'c2',
      type: 'chapter',
      title: 'Ch2',
      description: '',
      peacocks: [{ id: 'p2', documentId: 'd2', order: 0 }],
      position: { x: 0, y: 0 },
    },
  ],
  edges: [{ id: 'e1', sourceNodeId: 'c1', targetNodeId: 'c2' }],
  createdAt: 1,
  updatedAt: 2,
};

const segments: RouteSegment[] = [
  {
    nodeId: 'c1',
    chapterTitle: 'Ch1',
    chapterDescription: 'd',
    chapterIndex: 0,
    peacockRefId: 'p0',
    documentId: 'd0',
    peacockIndexInChapter: 0,
  },
  {
    nodeId: 'c1',
    chapterTitle: 'Ch1',
    chapterDescription: 'd',
    chapterIndex: 0,
    peacockRefId: 'p1',
    documentId: 'd1',
    peacockIndexInChapter: 1,
  },
  {
    nodeId: 'c2',
    chapterTitle: 'Ch2',
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

describe('routeLearnerNavigation', () => {
  it('tracks active segment and chapter membership', () => {
    expect(getActiveSegmentIndex(segments, state)).toBe(0);
    expect(isOnChapterSegment(route, state, segments)).toBe(true);
    expect(
      learnerStateForSegment(state, segments[1]!, 2),
    ).toMatchObject({ currentNodeId: 'c1', peacockIndex: 1, stepIndex: 2 });
  });

  it('maps transitions to segments and highlights pending targets', () => {
    const chapterTransition = { kind: 'chapter' as const, nodeId: 'c2', title: 'Ch2', description: '', chapterIndex: 1, demoCount: 1 };
    expect(segmentForTransition(segments, chapterTransition)?.documentId).toBe('d2');
    const demoTransition = {
      kind: 'demo' as const,
      nodeId: 'c1',
      documentId: 'd1',
      peacockIndex: 1,
      chapterTitle: 'Ch1',
      chapterIndex: 0,
      demoNumber: 2,
      demoCount: 2,
    };
    expect(segmentForTransition(segments, demoTransition)?.peacockIndexInChapter).toBe(1);
    expect(getHighlightedSegmentIndex(segments, state, chapterTransition)).toBe(2);
    expect(getHighlightedSegmentIndex(segments, state, null)).toBe(0);
  });

  it('computes forward/retreat and first/last stop helpers', () => {
    expect(getForwardSegmentTransition(route, segments, state, 2)).toBeNull();
    expect(
      getForwardSegmentTransition(route, segments, { ...state, stepIndex: 1 }, 2)?.kind,
    ).toBe('demo');
    expect(
      getForwardSegmentTransition(
        route,
        segments,
        { ...state, peacockIndex: 1, stepIndex: 0 },
        1,
      )?.kind,
    ).toBe('chapter');

    expect(getSegmentRetreatTarget(segments, { ...state, stepIndex: 1 }, 2)).toEqual({
      segment: segments[0],
      stepIndex: 0,
      showIntro: false,
    });
    expect(
      getSegmentRetreatTarget(segments, { ...state, peacockIndex: 1, currentNodeId: 'c1' }, 1),
    ).toMatchObject({ showIntro: true, stepIndex: 0 });

    expect(canRetreatBySegment(segments, state, 1)).toBe(false);
    expect(canAdvanceBySegment(segments, state, 2)).toBe(true);
    expect(isAtFirstRouteStop(segments, state)).toBe(true);
    expect(isAtLastRouteStop(segments, { ...state, currentNodeId: 'c2', peacockIndex: 0 }, 1)).toBe(
      true,
    );
    expect(isAtLastRouteStop([], state, 0)).toBe(false);
    expect(isAtFirstRouteStop([], state)).toBe(true);
  });

  it('builds chapter outline from segments', () => {
    const outline = buildLearnerChapterOutline(segments);
    expect(outline).toHaveLength(2);
    expect(outline[0]?.demos).toHaveLength(2);
    expect(outline[1]?.title).toBe('Ch2');
  });
});
