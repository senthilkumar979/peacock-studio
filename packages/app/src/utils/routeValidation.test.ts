import { describe, expect, it } from 'vitest';
import type { SavedRoute } from '@/types/route';
import { getNodeValidationIssues, validateRoute } from './routeValidation';

function baseRoute(overrides: Partial<SavedRoute> = {}): SavedRoute {
  return {
    id: 'route-1',
    title: 'Route',
    description: '',
    status: 'draft',
    entryNodeId: 'entry',
    nodes: [
      {
        id: 'entry',
        type: 'chapter',
        title: 'Intro',
        description: '',
        peacocks: [{ id: 'p1', documentId: 'doc-1', order: 0 }],
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
    createdAt: 1,
    updatedAt: 2,
    ...overrides,
  };
}

describe('validateRoute', () => {
  it('does not flag missing-entry when migrate fills entry from first node', () => {
    const issues = validateRoute(baseRoute({ entryNodeId: '' }));
    expect(issues.some((i) => i.id === 'missing-entry')).toBe(false);
    expect(issues.some((i) => i.id === 'invalid-entry')).toBe(false);
  });

  it('flags invalid entry when entry id is absent from nodes', () => {
    const issues = validateRoute(baseRoute({ entryNodeId: 'ghost' }));
    expect(issues.some((i) => i.id === 'invalid-entry')).toBe(true);
  });

  it('warns on empty chapters, unreachable nodes, and dangling branch options', () => {
    const route = baseRoute({
      nodes: [
        {
          id: 'entry',
          type: 'chapter',
          title: 'Intro',
          description: '',
          peacocks: [],
          position: { x: 0, y: 0 },
        },
        {
          id: 'orphan',
          type: 'chapter',
          title: 'Orphan',
          description: '',
          peacocks: [{ id: 'p', documentId: 'd', order: 0 }],
          position: { x: 0, y: 0 },
        },
        {
          id: 'branch',
          type: 'branch',
          title: 'Choose',
          description: '',
          options: [{ id: 'opt-a', label: 'A' }],
          position: { x: 0, y: 0 },
        },
      ],
      edges: [{ id: 'e1', sourceNodeId: 'entry', targetNodeId: 'branch' }],
    });

    const issues = validateRoute(route);
    expect(issues.some((i) => i.id === 'empty-chapter-entry')).toBe(true);
    expect(issues.some((i) => i.id === 'unreachable-orphan')).toBe(true);
    expect(issues.some((i) => i.id === 'branch-option-branch-opt-a')).toBe(true);
    expect(issues.some((i) => i.id === 'no-incoming-orphan')).toBe(true);
  });
});

describe('getNodeValidationIssues', () => {
  it('filters issues for a node', () => {
    const issues = validateRoute(
      baseRoute({
        nodes: [
          {
            id: 'entry',
            type: 'chapter',
            title: 'Intro',
            description: '',
            peacocks: [],
            position: { x: 0, y: 0 },
          },
        ],
      }),
    );
    expect(getNodeValidationIssues(issues, 'entry').every((i) => i.nodeId === 'entry')).toBe(true);
  });
});
