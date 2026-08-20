import { describe, expect, it } from 'vitest';
import type { RouteLearnerGraphState, RouteSegment, SavedRoute } from '@/types/route';
import {
  buildLearnerSegments,
  canAdvanceRouteLearner,
  canRetreatRouteLearner,
  getDefaultLearnerSegments,
  getNextRouteLearnerPosition,
  getPreviousRouteLearnerPosition,
  getRouteLearnerLabel,
} from './routeNavigation';

const segments: RouteSegment[] = [
  {
    nodeId: 'c1',
    chapterTitle: 'One',
    chapterDescription: '',
    chapterIndex: 0,
    peacockRefId: 'p0',
    documentId: 'd0',
    peacockIndexInChapter: 0,
  },
  {
    nodeId: 'c1',
    chapterTitle: 'One',
    chapterDescription: '',
    chapterIndex: 0,
    peacockRefId: 'p1',
    documentId: 'd1',
    peacockIndexInChapter: 1,
  },
];

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
      title: 'One',
      description: '',
      peacocks: [
        { id: 'p0', documentId: 'd0', order: 0 },
        { id: 'p1', documentId: 'd1', order: 1 },
      ],
      position: { x: 0, y: 0 },
    },
  ],
  edges: [],
  createdAt: 1,
  updatedAt: 2,
};

describe('routeNavigation helpers', () => {
  it('labels segments and builds learner segments', () => {
    expect(getRouteLearnerLabel(segments, 0)).toBe('Chapter 1 · Demo 1');
    expect(getRouteLearnerLabel(segments, 99)).toBe('Route');
    expect(getDefaultLearnerSegments(route)).toHaveLength(2);
    expect(
      buildLearnerSegments(route, {
        currentNodeId: 'c1',
        peacockIndex: 0,
        stepIndex: 0,
        branchChoices: {},
        interestChoices: {},
        formResponses: {},
        history: [],
      } satisfies RouteLearnerGraphState),
    ).toHaveLength(2);
  });

  it('advances and retreats within and across segments', () => {
    expect(canAdvanceRouteLearner(segments, { segmentIndex: 0, stepIndex: 0 }, 2)).toBe(true);
    expect(canAdvanceRouteLearner(segments, { segmentIndex: 1, stepIndex: 1 }, 2)).toBe(false);
    expect(canAdvanceRouteLearner(segments, { segmentIndex: 0, stepIndex: 0 }, 0)).toBe(true);

    expect(canRetreatRouteLearner({ segmentIndex: 0, stepIndex: 0 })).toBe(false);
    expect(canRetreatRouteLearner({ segmentIndex: 0, stepIndex: 1 })).toBe(true);
    expect(canRetreatRouteLearner({ segmentIndex: 1, stepIndex: 0 })).toBe(true);

    expect(getNextRouteLearnerPosition(segments, { segmentIndex: 0, stepIndex: 0 }, 2)).toEqual({
      segmentIndex: 0,
      stepIndex: 1,
    });
    expect(getNextRouteLearnerPosition(segments, { segmentIndex: 0, stepIndex: 1 }, 2)).toEqual({
      segmentIndex: 1,
      stepIndex: 0,
    });
    expect(getNextRouteLearnerPosition(segments, { segmentIndex: 1, stepIndex: 0 }, 1)).toBeNull();

    expect(getPreviousRouteLearnerPosition({ segmentIndex: 0, stepIndex: 1 }, 2)).toEqual({
      segmentIndex: 0,
      stepIndex: 0,
    });
    expect(getPreviousRouteLearnerPosition({ segmentIndex: 1, stepIndex: 0 }, 3)).toEqual({
      segmentIndex: 0,
      stepIndex: 2,
    });
    expect(getPreviousRouteLearnerPosition({ segmentIndex: 0, stepIndex: 0 }, 1)).toBeNull();
  });
});
