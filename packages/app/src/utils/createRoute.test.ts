import { describe, expect, it, vi } from 'vitest';
import {
  createBranchNode,
  createBranchOption,
  createChapterNode,
  createEmptyChapter,
  createEmptyRoute,
  createFormField,
  createFormNode,
  createInterestNode,
  createInterestTopic,
  createPeacockRef,
  createRouteEdge,
  getNextChapterPosition,
} from './createRoute';

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  let n = 0;
  return {
    ...actual,
    createId: () => `rid-${++n}`,
  };
});

describe('createRoute helpers', () => {
  it('creates peacock refs and chapter nodes', () => {
    expect(createPeacockRef('doc-1', 3)).toEqual({
      id: expect.stringMatching(/^rid-/),
      documentId: 'doc-1',
      order: 3,
    });
    expect(createChapterNode('Ch', { x: 1, y: 2 })).toMatchObject({
      type: 'chapter',
      title: 'Ch',
      peacocks: [],
      position: { x: 1, y: 2 },
    });
    expect(createEmptyChapter()).toMatchObject({ type: 'chapter', title: 'New chapter' });
  });

  it('creates branch, form, and interest nodes with defaults', () => {
    const branch = createBranchNode('Decide', { x: 0, y: 0 });
    expect(branch.type).toBe('branch');
    expect(branch.options).toHaveLength(2);
    expect(createBranchOption('Alt').label).toBe('Alt');

    const form = createFormNode('Signup', { x: 0, y: 0 });
    expect(form.fields).toHaveLength(2);
    expect(createFormField('Phone', 'email')).toMatchObject({
      label: 'Phone',
      type: 'email',
      required: false,
    });

    const interest = createInterestNode('Topics', { x: 0, y: 0 });
    expect(interest.topics).toHaveLength(2);
    expect(createInterestTopic('Other').label).toBe('Other');
  });

  it('creates edges and empty routes with entry chapter', () => {
    const edge = createRouteEdge('a', 'b', 'handle');
    expect(edge).toMatchObject({
      sourceNodeId: 'a',
      targetNodeId: 'b',
      sourceHandle: 'handle',
    });

    const empty = createEmptyRoute();
    expect(empty.status).toBe('draft');
    expect(empty.nodes).toHaveLength(1);
    expect(empty.entryNodeId).toBe(empty.nodes[0]?.id);
  });

  it('computes next chapter positions on a 3-column grid', () => {
    expect(getNextChapterPosition([])).toEqual({ x: 120, y: 80 });
    expect(getNextChapterPosition([{ id: '1' } as never])).toEqual({ x: 400, y: 80 });
    expect(getNextChapterPosition([{ id: '1' } as never, { id: '2' } as never, { id: '3' } as never])).toEqual({
      x: 120,
      y: 300,
    });
  });
});
