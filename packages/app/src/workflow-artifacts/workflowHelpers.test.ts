import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Position, type Node } from '@xyflow/react';
import type { WorkflowGraph } from '@peacock/shared';
import {
  getBranchPathSourceHandleIndex,
  getBranchSpineEdgeHandles,
  getEdgeHandleIds,
  getEdgePathOffset,
  getFlowHandlePositions,
  getRowLaneKey,
  positionToId,
} from './flowMapEdgeRouting';
import {
  getFlowMapFitViewOptions,
  getFlowMapFocusNodes,
  getFlowMapInitialViewOptions,
  getReadableMinZoom,
  shouldUseCompactLayout,
} from './flowMapViewportUtils';
import {
  FLOW_MAP_KIND_THEMES,
  FLOW_MAP_STATUS_OPTIONS,
  getWorkflowGraphStats,
} from './flowMapCanvasTheme';
import {
  buildOverlayFromNodes,
  parseStickyNoteId,
  stickyNoteId,
  workflowGraphToFlowCanvas,
} from './workflowGraphLayout';
import {
  buildFlowMapPngFilename,
  exportFlowMapCanvasPng,
  FLOW_MAP_EXPORT_SIZE,
  waitForFlowMapLayout,
} from './exportFlowMapCanvasPng';

vi.mock('html-to-image', () => ({
  toPng: vi.fn(async () => 'data:image/png;base64,aaa'),
}));

describe('flowMapEdgeRouting', () => {
  it('maps positions and chooses handle sides', () => {
    expect(positionToId(Position.Top)).toBe('top');
    expect(positionToId(Position.Right)).toBe('right');
    expect(positionToId(Position.Bottom)).toBe('bottom');
    expect(positionToId(Position.Left)).toBe('left');

    expect(getFlowHandlePositions({ x: 0, y: 0 }, { x: 100, y: 5 })).toEqual({
      source: Position.Right,
      target: Position.Left,
    });
    expect(getFlowHandlePositions({ x: 100, y: 0 }, { x: 0, y: 5 })).toEqual({
      source: Position.Left,
      target: Position.Right,
    });
    expect(getFlowHandlePositions({ x: 0, y: 0 }, { x: 5, y: 100 })).toEqual({
      source: Position.Bottom,
      target: Position.Top,
    });
    expect(getFlowHandlePositions({ x: 0, y: 100 }, { x: 5, y: 0 })).toEqual({
      source: Position.Top,
      target: Position.Bottom,
    });
  });

  it('builds edge handle ids with overrides and branch rules', () => {
    expect(getEdgeHandleIds({ x: 0, y: 0 }, { x: 100, y: 0 })).toEqual({
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
    });
    expect(
      getEdgeHandleIds({ x: 0, y: 0 }, { x: 100, y: 0 }, {
        sourceOverride: 'source-custom',
        targetOverride: 'target-custom',
      }),
    ).toEqual({ sourceHandle: 'source-custom', targetHandle: 'target-custom' });

    expect(getBranchSpineEdgeHandles({ x: 0, y: 0 }, { x: 10, y: 80 })).toEqual({
      sourceHandle: 'source-right',
      targetHandle: 'target-top',
    });
    expect(getBranchSpineEdgeHandles({ x: 0, y: 0 }, { x: -10, y: 80 })).toEqual({
      sourceHandle: 'source-left',
      targetHandle: 'target-top',
    });
    expect(getBranchPathSourceHandleIndex(1, 3)).toBe('source-path-1-3');
    expect(getRowLaneKey({ x: 1, y: 24 })).toBe(20);
  });

  it('computes path offsets for lanes and wraps', () => {
    expect(getEdgePathOffset({ from: { x: 0, y: 0 }, to: { x: 10, y: 10 }, pathIndex: 2 })).toBe(
      32 + 28 + 44,
    );
    expect(
      getEdgePathOffset({ from: { x: 0, y: 0 }, to: { x: 100, y: 5 }, rowLane: 1 }),
    ).toBe(32 + 12 + 20);
    expect(getEdgePathOffset({ from: { x: 0, y: 0 }, to: { x: 10, y: 100 } })).toBe(32 + 36);
    expect(getEdgePathOffset({ from: { x: 0, y: 0 }, to: { x: 200, y: 200 } })).toBe(32);
  });
});

describe('flowMapViewportUtils', () => {
  it('scales zoom and focus helpers', () => {
    expect(getReadableMinZoom(3)).toBe(0.42);
    expect(getReadableMinZoom(8)).toBe(0.64);
    expect(getReadableMinZoom(12)).toBe(0.76);
    expect(getReadableMinZoom(20)).toBe(0.84);
    expect(getFlowMapFitViewOptions(8).minZoom).toBe(0.64);
    expect(getFlowMapInitialViewOptions(99).minZoom).toBe(0.82);
    expect(shouldUseCompactLayout(11)).toBe(true);
    expect(shouldUseCompactLayout(5)).toBe(false);

    const nodes: Node[] = [
      { id: 'b', position: { x: 2, y: 20 }, data: {} },
      { id: 'a', position: { x: 1, y: 10 }, data: {} },
      { id: 'c', position: { x: 0, y: 10 }, data: {} },
    ];
    expect(getFlowMapFocusNodes(nodes, 2).map((n) => n.id)).toEqual(['c', 'a']);
  });
});

describe('flowMapCanvasTheme', () => {
  it('exposes themes and graph stats', () => {
    expect(FLOW_MAP_KIND_THEMES.root.label).toBe('Flow start');
    expect(FLOW_MAP_STATUS_OPTIONS.some((option) => option.value === 'approved')).toBe(true);
    const graph: WorkflowGraph = {
      title: 'Demo',
      nodes: [
        { id: 'root', kind: 'root', label: 'Start' },
        { id: 's1', kind: 'section', label: 'Sec' },
        { id: 'step-1', kind: 'step', label: 'Click', stepNumber: 1 },
        { id: 'branch-1', kind: 'branch', label: 'Role' },
        { id: 'path-1', kind: 'path', label: 'Admin' },
      ],
      edges: [],
    };
    expect(getWorkflowGraphStats(graph)).toEqual({
      steps: 1,
      sections: 1,
      branches: 1,
      paths: 1,
    });
  });
});

describe('workflowGraphLayout', () => {
  const linearGraph: WorkflowGraph = {
    title: 'Linear',
    nodes: [
      { id: 'root', kind: 'root', label: 'Start' },
      { id: 'step-1', kind: 'step', label: 'One', stepNumber: 1 },
      { id: 'step-2', kind: 'step', label: 'Two', stepNumber: 2 },
    ],
    edges: [
      { from: 'root', to: 'step-1' },
      { from: 'step-1', to: 'step-2', label: 'next' },
    ],
  };

  const branchedGraph: WorkflowGraph = {
    title: 'Branched',
    nodes: [
      { id: 'root', kind: 'root', label: 'Start' },
      { id: 'branch-1', kind: 'branch', label: 'Choose' },
      { id: 'path-a', kind: 'path', label: 'A' },
      { id: 'path-b', kind: 'path', label: 'B' },
      { id: 'step-1', kind: 'step', label: 'Continue', stepNumber: 1 },
      ...Array.from({ length: 8 }, (_, index) => ({
        id: `step-extra-${index}`,
        kind: 'step' as const,
        label: `Extra ${index}`,
        stepNumber: index + 2,
      })),
    ],
    edges: [
      { from: 'root', to: 'branch-1' },
      { from: 'branch-1', to: 'path-a' },
      { from: 'branch-1', to: 'path-b' },
      { from: 'branch-1', to: 'step-1' },
      ...Array.from({ length: 7 }, (_, index) => ({
        from: index === 0 ? 'step-1' : `step-extra-${index - 1}`,
        to: `step-extra-${index}`,
      })),
    ],
  };

  it('layouts linear and compact branched graphs', () => {
    const linear = workflowGraphToFlowCanvas(linearGraph);
    expect(linear.nodes).toHaveLength(3);
    expect(linear.edges).toHaveLength(2);
    expect(linear.edges[1]?.label).toBe('next');

    const branched = workflowGraphToFlowCanvas(branchedGraph, {
      isEditMode: true,
      overlay: {
        version: 1,
        nodePositions: {},
        nodeStatuses: { 'step-1': 'approved' },
        nodeNotes: { 'step-1': 'Looks good' },
        stickyNotes: [{ id: 'note-1', x: 10, y: 20, text: 'Sticky', color: '#fff' }],
      },
      onDeleteSticky: vi.fn(),
    });
    expect(branched.nodes.some((node) => node.type === 'stickyNote')).toBe(true);
    expect(branched.nodes.find((node) => node.id === 'step-1')?.data).toMatchObject({
      status: 'approved',
      reviewerNote: 'Looks good',
    });
    expect(branched.nodes.find((node) => node.id === 'branch-1')?.data.pathHandleCount).toBe(2);
  });

  it('parses sticky ids and builds overlays from nodes', () => {
    expect(stickyNoteId('abc')).toBe('sticky-abc');
    expect(parseStickyNoteId('sticky-abc')).toBe('abc');
    expect(parseStickyNoteId('flow-1')).toBeNull();

    const canvas = workflowGraphToFlowCanvas(linearGraph, {
      overlay: {
        version: 1,
        nodePositions: {},
        nodeStatuses: {},
        nodeNotes: {},
        stickyNotes: [{ id: 'n1', x: 1, y: 2, text: 'Hi' }],
      },
    });
    const overlay = buildOverlayFromNodes(
      {
        version: 1,
        nodePositions: {},
        nodeStatuses: {},
        nodeNotes: {},
        stickyNotes: [],
      },
      canvas.nodes,
    );
    expect(overlay.stickyNotes).toHaveLength(1);
    expect(overlay.nodePositions.root).toBeDefined();
  });
});

describe('exportFlowMapCanvasPng', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds filenames and waits for layout', async () => {
    expect(buildFlowMapPngFilename(' My Flow ')).toBe('my-flow.png');
    expect(buildFlowMapPngFilename('   ')).toBe('flow-map.png');
    expect(FLOW_MAP_EXPORT_SIZE.width).toBe(4000);
    await expect(waitForFlowMapLayout()).resolves.toBeUndefined();
  });

  it('exports a composed png download', async () => {
    const click = vi.fn();
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return { download: '', href: '', click } as unknown as HTMLElement;
      }
      const canvas = originalCreate('canvas') as HTMLCanvasElement;
      const ctx = {
        fillRect: vi.fn(),
        fillText: vi.fn(),
        drawImage: vi.fn(),
        measureText: vi.fn((text: string) => ({ width: String(text).length * 10 })),
        font: '',
        fillStyle: '',
        textAlign: 'left',
        textBaseline: 'alphabetic',
      };
      canvas.getContext = vi.fn(() => ctx as never);
      canvas.toDataURL = vi.fn(() => 'data:image/png;base64,composed');
      Object.defineProperty(canvas, 'width', { writable: true, value: 0 });
      Object.defineProperty(canvas, 'height', { writable: true, value: 0 });
      return canvas;
    });

    class FakeImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      width = 400;
      height = 200;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('Image', FakeImage);

    await exportFlowMapCanvasPng({
      viewportElement: document.createElement('div'),
      filename: 'demo.png',
      title: 'Demo Flow Map Title',
    });
    expect(click).toHaveBeenCalled();
  });
});
