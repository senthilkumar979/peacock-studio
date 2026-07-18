import { MarkerType, type Edge, type Node } from '@xyflow/react';
import type { WorkflowGraph, WorkflowGraphNode } from '@peacock/shared';
import {
  FLOW_MAP_KIND_THEMES,
  FLOW_MAP_LAYOUT,
  FLOW_MAP_NODE_HEIGHT,
  FLOW_MAP_NODE_WIDTH,
} from '@/workflow-artifacts/flowMapCanvasTheme';
import { shouldUseCompactLayout } from '@/workflow-artifacts/flowMapViewportUtils';
import {
  getBranchPathSourceHandleIndex,
  getBranchSpineEdgeHandles,
  getEdgeHandleIds,
  getEdgePathOffset,
  getRowLaneKey,
} from '@/workflow-artifacts/flowMapEdgeRouting';

const { gapX: GAP_X, gapY: GAP_Y, marginX, marginY, compactCols: COMPACT_COLS, compactGapX: COMPACT_GAP_X, compactGapY: COMPACT_GAP_Y, branchPathExtraY } =
  FLOW_MAP_LAYOUT;

export interface FlowMapNodeData extends Record<string, unknown> {
  label: string;
  kind: WorkflowGraphNode['kind'];
  stepNumber?: number;
  description?: string;
  pathHandleCount?: number;
}

function getMainSpineOrder(graph: WorkflowGraph, children: Map<string, string[]>): string[] {
  const spine: string[] = ['root'];
  let current = 'root';

  while (true) {
    const kids = children.get(current) ?? [];
    if (kids.length === 0) break;

    if (kids.length === 1) {
      const next = kids[0];
      if (!next) break;
      spine.push(next);
      current = next;
      continue;
    }

    const branchLike = kids.find((id) => id.startsWith('branch-'));
    if (branchLike) {
      spine.push(branchLike);
      current = branchLike;
      continue;
    }

    break;
  }

  return spine;
}

function layoutCompactGrid(
  spineIds: string[],
  positions: Map<string, { x: number; y: number }>,
): void {
  spineIds.forEach((nodeId, index) => {
    const row = Math.floor(index / COMPACT_COLS);
    const colInRow = index % COMPACT_COLS;
    const col = row % 2 === 0 ? colInRow : COMPACT_COLS - 1 - colInRow;

    positions.set(nodeId, {
      x: col * (FLOW_MAP_NODE_WIDTH + COMPACT_GAP_X) + marginX,
      y: row * (FLOW_MAP_NODE_HEIGHT + COMPACT_GAP_Y) + marginY,
    });
  });
}

function layoutSubtree(
  nodeId: string,
  depth: number,
  xOffset: number,
  children: Map<string, string[]>,
  positions: Map<string, { x: number; y: number }>,
  spineSet: Set<string>,
): number {
  if (spineSet.has(nodeId)) {
    return FLOW_MAP_NODE_WIDTH;
  }

  const kids = children.get(nodeId) ?? [];

  if (kids.length === 0) {
    positions.set(nodeId, { x: xOffset, y: depth * (FLOW_MAP_NODE_HEIGHT + GAP_Y) + marginY });
    return FLOW_MAP_NODE_WIDTH;
  }

  if (kids.length === 1) {
    const onlyChild = kids[0];
    if (!onlyChild) return FLOW_MAP_NODE_WIDTH;
    if (spineSet.has(onlyChild)) {
      return FLOW_MAP_NODE_WIDTH;
    }
    layoutSubtree(onlyChild, depth + 1, xOffset, children, positions, spineSet);
    const child = positions.get(onlyChild);
    if (!child) return FLOW_MAP_NODE_WIDTH;
    positions.set(nodeId, { x: child.x, y: depth * (FLOW_MAP_NODE_HEIGHT + GAP_Y) + marginY });
    return FLOW_MAP_NODE_WIDTH;
  }

  let cursor = xOffset;
  let totalWidth = 0;
  for (const kid of kids) {
    if (spineSet.has(kid)) continue;
    const width = layoutSubtree(kid, depth + 1, cursor, children, positions, spineSet);
    totalWidth += width;
    cursor += width + GAP_X;
  }
  if (totalWidth === 0) {
    positions.set(nodeId, { x: xOffset, y: depth * (FLOW_MAP_NODE_HEIGHT + GAP_Y) + marginY });
    return FLOW_MAP_NODE_WIDTH;
  }
  totalWidth -= GAP_X;

  const centerX = xOffset + totalWidth / 2 - FLOW_MAP_NODE_WIDTH / 2;
  positions.set(nodeId, { x: centerX, y: depth * (FLOW_MAP_NODE_HEIGHT + GAP_Y) + marginY });
  return Math.max(FLOW_MAP_NODE_WIDTH, totalWidth);
}

function layoutBranchPaths(
  graph: WorkflowGraph,
  children: Map<string, string[]>,
  positions: Map<string, { x: number; y: number }>,
  spineSet: Set<string>,
): void {
  for (const node of graph.nodes) {
    if (!node.id.startsWith('branch-')) continue;
    const branchPos = positions.get(node.id);
    if (!branchPos) continue;

    const paths = (children.get(node.id) ?? []).filter((id) => !spineSet.has(id));
    if (paths.length === 0) continue;

    let cursor = branchPos.x - ((paths.length - 1) * (FLOW_MAP_NODE_WIDTH + GAP_X)) / 2;
    for (const pathId of paths) {
      positions.set(pathId, {
        x: cursor,
        y: branchPos.y + FLOW_MAP_NODE_HEIGHT + GAP_Y + branchPathExtraY,
      });
      cursor += FLOW_MAP_NODE_WIDTH + GAP_X;
    }
  }
}

function layoutGraph(graph: WorkflowGraph): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const children = new Map<string, string[]>();

  for (const edge of graph.edges) {
    const list = children.get(edge.from) ?? [];
    list.push(edge.to);
    children.set(edge.from, list);
  }

  const useCompact = shouldUseCompactLayout(graph.nodes.length);

  if (useCompact) {
    const spine = getMainSpineOrder(graph, children);
    const spineSet = new Set(spine);
    layoutCompactGrid(spine, positions);
    layoutBranchPaths(graph, children, positions, spineSet);

    for (const node of graph.nodes) {
      if (positions.has(node.id)) continue;
      layoutSubtree(node.id, 0, marginX, children, positions, spineSet);
    }
  } else {
    layoutSubtree('root', 0, 0, children, positions, new Set());
  }

  const xs = [...positions.values()].map((point) => point.x);
  if (xs.length === 0) return positions;

  const minX = Math.min(...xs);
  const shiftX = -minX + marginX;
  positions.forEach((point, id) => {
    positions.set(id, { x: point.x + shiftX, y: point.y });
  });

  return positions;
}

function getEdgeStyle(fromKind: WorkflowGraphNode['kind'] | undefined): {
  stroke: string;
  animated: boolean;
} {
  const theme = fromKind ? FLOW_MAP_KIND_THEMES[fromKind] : FLOW_MAP_KIND_THEMES.step;
  return {
    stroke: theme.edgeStroke,
    animated: fromKind === 'branch',
  };
}

export function workflowGraphToFlowCanvas(graph: WorkflowGraph): {
  nodes: Node<FlowMapNodeData>[];
  edges: Edge[];
} {
  const positions = layoutGraph(graph);
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));

  const branchPathCounts = new Map<string, number>();
  for (const edge of graph.edges) {
    const target = nodeById.get(edge.to);
    if (!edge.from.startsWith('branch-') || target?.kind !== 'path') continue;
    branchPathCounts.set(edge.from, (branchPathCounts.get(edge.from) ?? 0) + 1);
  }

  const branchPathIndexByBranch = new Map<string, number>();
  const rowEdgeLanes = new Map<number, number>();

  const nodes: Node<FlowMapNodeData>[] = graph.nodes.map((node) => {
    const position = positions.get(node.id) ?? { x: 0, y: 0 };

    return {
      id: node.id,
      type: 'flowMap',
      position,
      width: FLOW_MAP_NODE_WIDTH,
      height: FLOW_MAP_NODE_HEIGHT,
      data: {
        label: node.label,
        kind: node.kind,
        stepNumber: node.stepNumber,
        description: node.description,
        pathHandleCount:
          node.kind === 'branch' ? branchPathCounts.get(node.id) : undefined,
      },
      draggable: false,
      selectable: true,
    };
  });

  const edges: Edge[] = graph.edges.map((edge, index) => {
    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);
    const fromPos = positions.get(edge.from);
    const toPos = positions.get(edge.to);
    const edgeStyle = getEdgeStyle(fromNode?.kind);
    const hasLabel = Boolean(edge.label?.trim());

    let sourceHandle: string | undefined;
    let targetHandle: string | undefined;
    let pathOffset: number | undefined;
    let rowLane: number | undefined;

    if (fromPos && toPos) {
      if (fromNode?.kind === 'branch' && toNode?.kind === 'path') {
        const pathCount = branchPathCounts.get(edge.from) ?? 1;
        const pathIndex = branchPathIndexByBranch.get(edge.from) ?? 0;
        branchPathIndexByBranch.set(edge.from, pathIndex + 1);
        sourceHandle = getBranchPathSourceHandleIndex(pathIndex, pathCount);
        targetHandle = 'target-top';
        pathOffset = pathIndex;
      } else if (fromNode?.kind === 'branch') {
        const handles = getBranchSpineEdgeHandles(fromPos, toPos);
        sourceHandle = handles.sourceHandle;
        targetHandle = handles.targetHandle;
      } else {
        const handles = getEdgeHandleIds(fromPos, toPos);
        sourceHandle = handles.sourceHandle;
        targetHandle = handles.targetHandle;

        const rowKey = getRowLaneKey(fromPos);
        const dy = Math.abs(fromPos.y - toPos.y);
        const dx = Math.abs(fromPos.x - toPos.x);
        if (dy < 28 && dx > 40) {
          rowLane = rowEdgeLanes.get(rowKey) ?? 0;
          rowEdgeLanes.set(rowKey, rowLane + 1);
        }
      }
    }

    const offset = fromPos && toPos
      ? getEdgePathOffset({
          from: fromPos,
          to: toPos,
          pathIndex: pathOffset,
          rowLane,
        })
      : 32;

    return {
      id: `edge-${index}-${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      sourceHandle,
      targetHandle,
      label: hasLabel ? edge.label : undefined,
      type: 'smoothstep',
      animated: edgeStyle.animated,
      pathOptions: { borderRadius: 28, offset },
      markerEnd: { type: MarkerType.ArrowClosed, color: edgeStyle.stroke, width: 22, height: 22 },
      style: { stroke: edgeStyle.stroke, strokeWidth: 2.5 },
      ...(hasLabel
        ? {
            labelStyle: { fill: '#ffffff', fontSize: 11, fontWeight: 700 },
            labelBgStyle: { fill: '#d97706', fillOpacity: 0.95 },
            labelBgPadding: [8, 6] as [number, number],
            labelBgBorderRadius: 8,
          }
        : {}),
    };
  });

  return { nodes, edges };
}
