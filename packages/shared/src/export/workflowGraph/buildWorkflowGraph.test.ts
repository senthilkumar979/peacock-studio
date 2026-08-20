import { describe, expect, it } from 'vitest';
import type { FlowOutlineItem } from '../../types/events';
import { buildWorkflowGraph } from './buildWorkflowGraph';

describe('buildWorkflowGraph', () => {
  it('builds root, section, branch, path, and step nodes', () => {
    const outline: FlowOutlineItem[] = [
      { id: 'sec-1', kind: 'section', title: '', description: '  desc  ' },
      {
        id: 'branch-1',
        kind: 'branch',
        title: '',
        description: '',
        paths: [
          {
            id: 'path-1',
            label: '',
            targetDocumentId: 'doc-b',
            targetTitle: '  ',
            targetDescription: '',
            fromStepId: 'step-1',
            toStepId: 'step-1',
            order: 0,
          },
        ],
      },
      {
        id: 'step-1',
        title: '',
        notes: '',
        generatedTitle: '',
        generatedDescription: '',
        screenshotId: 'shot-1',
        event: {
          id: 'ev-1',
          type: 'page-view',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Home',
          viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
          screenshotId: 'shot-1',
        },
      },
    ];

    const graph = buildWorkflowGraph('', outline);
    expect(graph.title).toBe('Untitled flow');
    expect(graph.nodes.map((n) => n.kind)).toEqual([
      'root',
      'section',
      'branch',
      'path',
      'step',
    ]);
    expect(graph.nodes.find((n) => n.kind === 'section')?.label).toBe('Section');
    expect(graph.nodes.find((n) => n.kind === 'branch')?.label).toBe('Branch');
    expect(graph.nodes.find((n) => n.kind === 'path')?.label).toBe('Path');
    expect(graph.nodes.find((n) => n.kind === 'step')?.label).toBe('Step 1');
    expect(graph.nodes.find((n) => n.kind === 'section')?.description).toBe('desc');
  });

  it('sanitizes mermaid-sensitive characters in labels', () => {
    const outline: FlowOutlineItem[] = [
      {
        id: 'step-1',
        title: 'A[B]|{C}"D"',
        notes: '',
        generatedTitle: '',
        generatedDescription: '',
        screenshotId: 'shot-1',
        event: {
          id: 'ev-1',
          type: 'page-view',
          timestamp: 1,
          url: 'https://example.com',
          title: 'Home',
          viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
          screenshotId: 'shot-1',
        },
      },
    ];

    const graph = buildWorkflowGraph('T"itle', outline);
    expect(graph.nodes[0]?.label).toBe('T itle');
    expect(graph.nodes[1]?.label).toBe('A B C D');
  });
});
