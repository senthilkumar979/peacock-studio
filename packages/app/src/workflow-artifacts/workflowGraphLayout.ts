import type { Edge, Node } from '@xyflow/react';
import type { WorkflowGraph, WorkflowGraphNode } from '@peacock/shared';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 76;
const GAP_Y = 56;
const GAP_X = 32;

const KIND_STYLES: Record<
  WorkflowGraphNode['kind'],
  { border: string; bg: string; text: string }
> = {
  root: { border: 'border-peacock-300', bg: 'bg-peacock-50', text: 'text-peacock-900' },
  section: { border: 'border-violet-200', bg: 'bg-violet-50', text: 'text-violet-900' },
  step: { border: 'border-slate-200', bg: 'bg-white', text: 'text-slate-900' },
  branch: { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-950' },
  path: { border: 'border-cyan-200', bg: 'bg-cyan-50', text: 'text-cyan-950' },
};

export interface FlowMapNodeStyle {
  border: string;
  bg: string;
  text: string;
}

export interface FlowMapNodeData extends Record<string, unknown> {
  label: string;
  kind: WorkflowGraphNode['kind'];
  stepNumber?: number;
  description?: string;
  style: FlowMapNodeStyle;
}

function layoutGraph(graph: WorkflowGraph): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const children = new Map<string, string[]>();

  for (const edge of graph.edges) {
    const list = children.get(edge.from) ?? [];
    list.push(edge.to);
    children.set(edge.from, list);
  }

  function layoutSubtree(nodeId: string, depth: number, xOffset: number): number {
    const kids = children.get(nodeId) ?? [];

    if (kids.length === 0) {
      positions.set(nodeId, { x: xOffset, y: depth * (NODE_HEIGHT + GAP_Y) });
      return NODE_WIDTH;
    }

    if (kids.length === 1) {
      const onlyChild = kids[0];
      if (!onlyChild) return NODE_WIDTH;
      layoutSubtree(onlyChild, depth + 1, xOffset);
      const child = positions.get(onlyChild);
      if (!child) return NODE_WIDTH;
      positions.set(nodeId, { x: child.x, y: depth * (NODE_HEIGHT + GAP_Y) });
      return NODE_WIDTH;
    }

    let cursor = xOffset;
    let totalWidth = 0;
    for (const kid of kids) {
      const width = layoutSubtree(kid, depth + 1, cursor);
      totalWidth += width;
      cursor += width + GAP_X;
    }
    totalWidth -= GAP_X;

    const centerX = xOffset + totalWidth / 2 - NODE_WIDTH / 2;
    positions.set(nodeId, { x: centerX, y: depth * (NODE_HEIGHT + GAP_Y) });
    return Math.max(NODE_WIDTH, totalWidth);
  }

  layoutSubtree('root', 0, 0);

  const xs = [...positions.values()].map((point) => point.x);
  const minX = Math.min(...xs);
  const shiftX = -minX + 40;
  positions.forEach((point, id) => {
    positions.set(id, { x: point.x + shiftX, y: point.y + 24 });
  });

  return positions;
}

export function workflowGraphToFlowCanvas(graph: WorkflowGraph): {
  nodes: Node<FlowMapNodeData>[];
  edges: Edge[];
} {
  const positions = layoutGraph(graph);
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));

  const nodes: Node<FlowMapNodeData>[] = graph.nodes.map((node) => {
    const position = positions.get(node.id) ?? { x: 0, y: 0 };
    const style = KIND_STYLES[node.kind];

    return {
      id: node.id,
      type: 'flowMap',
      position,
      data: {
        label: node.label,
        kind: node.kind,
        stepNumber: node.stepNumber,
        description: node.description,
        style,
      },
      draggable: false,
      selectable: true,
    };
  });

  const edges: Edge[] = graph.edges.map((edge, index) => ({
    id: `edge-${index}-${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    label: edge.label,
    type: 'smoothstep',
    animated: edge.label ? true : false,
    style: { stroke: '#64748b', strokeWidth: 2 },
    labelStyle: { fill: '#475569', fontSize: 11, fontWeight: 600 },
  }));

  void nodeById;
  return { nodes, edges };
}

export const FLOW_MAP_NODE_WIDTH = NODE_WIDTH;
export const FLOW_MAP_NODE_HEIGHT = NODE_HEIGHT;
