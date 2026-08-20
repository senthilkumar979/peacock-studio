import { describe, expect, it } from 'vitest';
import type { SavedRoute } from '@/types/route';
import { buildCanvasEdges, buildCanvasNodes } from './routeCanvasMapper';

const route: SavedRoute = {
  id: 'r1',
  title: 'Route',
  description: '',
  status: 'draft',
  entryNodeId: 'chapter-1',
  nodes: [
    {
      id: 'chapter-1',
      type: 'chapter',
      title: 'Chapter',
      description: '',
      peacocks: [{ id: 'p1', documentId: 'd1', order: 0 }],
      position: { x: 0, y: 0 },
    },
    {
      id: 'branch-1',
      type: 'branch',
      title: 'Branch',
      description: '',
      options: [
        { id: 'opt-a', label: 'Admin' },
        { id: 'opt-b', label: 'User' },
      ],
      position: { x: 100, y: 0 },
    },
    {
      id: 'form-1',
      type: 'form',
      title: 'Form',
      description: '',
      fields: [{ id: 'f1', label: 'Name', type: 'text', required: true }],
      position: { x: 200, y: 0 },
    },
    {
      id: 'interest-1',
      type: 'interest',
      title: 'Interests',
      description: '',
      allowMultiple: false,
      topics: [{ id: 't1', label: 'Billing' }],
      position: { x: 300, y: 0 },
    },
  ],
  edges: [
    {
      id: 'e1',
      sourceNodeId: 'chapter-1',
      targetNodeId: 'branch-1',
    },
    {
      id: 'e2',
      sourceNodeId: 'branch-1',
      targetNodeId: 'form-1',
      sourceHandle: 'opt-a',
    },
    {
      id: 'e3',
      sourceNodeId: 'interest-1',
      targetNodeId: 'chapter-1',
      sourceHandle: 't1',
    },
  ],
  createdAt: 1,
  updatedAt: 2,
};

describe('routeCanvasMapper', () => {
  it('builds typed canvas nodes for all route node kinds', () => {
    const nodes = buildCanvasNodes(route, 'branch-1', []);
    expect(nodes).toHaveLength(4);
    expect(nodes.find((node) => node.id === 'chapter-1')?.type).toBe('chapter');
    expect(nodes.find((node) => node.id === 'branch-1')?.data).toMatchObject({
      selected: true,
      options: [
        { id: 'opt-a', label: 'Admin' },
        { id: 'opt-b', label: 'User' },
      ],
    });
    expect(nodes.find((node) => node.id === 'form-1')?.data).toMatchObject({ fieldCount: 1 });
    expect(nodes.find((node) => node.id === 'interest-1')?.data).toMatchObject({
      topics: [{ id: 't1', label: 'Billing' }],
    });
  });

  it('labels edges from branch options and interest topics', () => {
    const edges = buildCanvasEdges(route);
    expect(edges).toHaveLength(3);
    expect(edges[1]?.label).toBe('Admin');
    expect(edges[2]?.label).toBe('Billing');
    expect(edges[0]?.label).toBeUndefined();
  });
});
