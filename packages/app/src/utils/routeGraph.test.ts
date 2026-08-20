import { describe, expect, it, vi } from 'vitest';
import type { SavedRoute } from '@/types/route';
import { createEmptyPathChoices } from '@/types/route';
import {
  countRouteBranches,
  countRoutePeacocks,
  createLinearEdgesForNodes,
  flattenRouteSegments,
  flattenRouteSegmentsForPath,
  getChapterNodes,
  getChapterNodesInPathOrder,
  getIncomingEdges,
  getOutgoingEdges,
  getRouteNode,
  migrateSavedRoute,
  needsRouteMigration,
  resolveNextNodeId,
  segmentIndexForNodePeacock,
} from './routeGraph';

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  let n = 0;
  return {
    ...actual,
    createId: () => `gid-${++n}`,
  };
});

function baseRoute(overrides: Partial<SavedRoute> = {}): SavedRoute {
  return {
    id: 'r1',
    title: 'Route',
    description: '',
    status: 'draft',
    entryNodeId: 'c1',
    nodes: [
      {
        id: 'c1',
        type: 'chapter',
        title: 'Intro',
        description: 'd1',
        peacocks: [
          { id: 'p1', documentId: 'doc-1', order: 1 },
          { id: 'p0', documentId: 'doc-0', order: 0 },
        ],
        position: { x: 0, y: 0 },
      },
      {
        id: 'c2',
        type: 'chapter',
        title: 'Next',
        description: 'd2',
        peacocks: [{ id: 'p2', documentId: 'doc-2', order: 0 }],
        position: { x: 0, y: 100 },
      },
    ],
    edges: [{ id: 'e1', sourceNodeId: 'c1', targetNodeId: 'c2' }],
    createdAt: 1,
    updatedAt: 2,
    ...overrides,
  };
}

describe('migrateSavedRoute / needsRouteMigration', () => {
  it('detects legacy routes without nodes', () => {
    const legacy = {
      ...baseRoute(),
      nodes: [],
      chapters: [
        {
          id: 'ch1',
          title: 'Legacy',
          description: '',
          peacocks: [{ id: 'p', documentId: 'd', order: 0 }],
        },
        {
          id: 'ch2',
          title: 'Two',
          description: '',
          peacocks: [],
        },
      ],
    } as SavedRoute;
    expect(needsRouteMigration(legacy)).toBe(true);
    const migrated = migrateSavedRoute(legacy);
    expect(migrated.nodes).toHaveLength(2);
    expect(migrated.edges).toHaveLength(1);
    expect(migrated.entryNodeId).toBe('ch1');
    expect(migrated.chapters).toBeUndefined();
  });

  it('creates a default chapter when legacy has no chapters', () => {
    const empty = { ...baseRoute(), nodes: [], chapters: [] } as SavedRoute;
    const migrated = migrateSavedRoute(empty);
    expect(migrated.nodes).toHaveLength(1);
    expect(migrated.nodes[0]?.type).toBe('chapter');
  });

  it('normalizes entryNodeId for already-migrated routes', () => {
    const route = baseRoute({ entryNodeId: '' });
    expect(migrateSavedRoute(route).entryNodeId).toBe('c1');
    expect(needsRouteMigration(route)).toBe(false);
  });
});

describe('route graph queries', () => {
  it('gets nodes, chapters, counts, and edges', () => {
    const route = baseRoute({
      nodes: [
        ...baseRoute().nodes,
        {
          id: 'b1',
          type: 'branch',
          title: 'Choose',
          description: '',
          options: [
            { id: 'opt-a', label: 'A' },
            { id: 'opt-b', label: 'B' },
          ],
          position: { x: 0, y: 0 },
        },
      ],
    });

    expect(getRouteNode(route, 'c1')?.type).toBe('chapter');
    expect(getChapterNodes(route)).toHaveLength(2);
    expect(countRoutePeacocks(route)).toBe(3);
    expect(countRouteBranches(route)).toBe(1);
    expect(getOutgoingEdges(route, 'c1')).toHaveLength(1);
    expect(getIncomingEdges(route, 'c2')).toHaveLength(1);
  });

  it('orders chapters along the primary path and appends remaining', () => {
    const ordered = getChapterNodesInPathOrder(baseRoute());
    expect(ordered.map((c) => c.id)).toEqual(['c1', 'c2']);
  });

  it('resolves next node for chapter, branch, and interest', () => {
    const route = baseRoute({
      nodes: [
        {
          id: 'b1',
          type: 'branch',
          title: 'B',
          description: '',
          options: [
            { id: 'left', label: 'L' },
            { id: 'right', label: 'R' },
          ],
          position: { x: 0, y: 0 },
        },
        {
          id: 'i1',
          type: 'interest',
          title: 'I',
          description: '',
          topics: [{ id: 't1', label: 'T' }],
          allowMultiple: false,
          position: { x: 0, y: 0 },
        },
        {
          id: 'c1',
          type: 'chapter',
          title: 'C',
          description: '',
          peacocks: [],
          position: { x: 0, y: 0 },
        },
      ],
      edges: [
        { id: 'e1', sourceNodeId: 'b1', targetNodeId: 'c1', sourceHandle: 'left' },
        { id: 'e2', sourceNodeId: 'i1', targetNodeId: 'c1', sourceHandle: 't1' },
      ],
      entryNodeId: 'b1',
    });

    expect(resolveNextNodeId(route, 'missing', createEmptyPathChoices())).toBeNull();
    expect(
      resolveNextNodeId(route, 'b1', {
        branchChoices: { b1: 'left' },
        interestChoices: {},
      }),
    ).toBe('c1');
    expect(
      resolveNextNodeId(route, 'b1', {
        branchChoices: {},
        interestChoices: {},
      }),
    ).toBeNull();
    expect(
      resolveNextNodeId(route, 'i1', {
        branchChoices: {},
        interestChoices: { i1: ['t1'] },
      }),
    ).toBe('c1');
  });

  it('flattens segments in peacock order and finds segment indexes', () => {
    const segments = flattenRouteSegments(baseRoute());
    expect(segments.map((s) => s.documentId)).toEqual(['doc-0', 'doc-1', 'doc-2']);
    expect(segmentIndexForNodePeacock(segments, 'c1', 1)).toBe(1);
    expect(flattenRouteSegmentsForPath(baseRoute(), createEmptyPathChoices())).toEqual(segments);
  });

  it('creates linear edges between nodes', () => {
    const edges = createLinearEdgesForNodes([
      { id: 'a', type: 'chapter', title: '', description: '', peacocks: [], position: { x: 0, y: 0 } },
      { id: 'b', type: 'chapter', title: '', description: '', peacocks: [], position: { x: 0, y: 0 } },
    ]);
    expect(edges).toEqual([
      expect.objectContaining({ sourceNodeId: 'a', targetNodeId: 'b' }),
    ]);
    expect(edges[0]?.id).toMatch(/^gid-/);
  });
});
