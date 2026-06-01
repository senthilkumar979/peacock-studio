import type { Edge, Node } from '@xyflow/react';
import type {
  RouteBranchNode,
  RouteChapterNode,
  RouteFormNode,
  RouteInterestNode,
  RouteNode,
  RouteValidationIssue,
  SavedRoute,
} from '@/types/route';
import { getNodeValidationIssues } from '@/utils/routeValidation';

interface RouteCanvasNodeBase extends Record<string, unknown> {
  nodeId: string;
  title: string;
  description: string;
  selected: boolean;
  isEntry: boolean;
  warningCount: number;
}

export interface ChapterCanvasNodeData extends RouteCanvasNodeBase {
  peacockCount: number;
}

export interface BranchCanvasNodeData extends RouteCanvasNodeBase {
  options: { id: string; label: string }[];
}

export interface FormCanvasNodeData extends RouteCanvasNodeBase {
  fieldCount: number;
}

export interface InterestCanvasNodeData extends RouteCanvasNodeBase {
  topics: { id: string; label: string }[];
}

function buildBaseData(
  node: RouteNode,
  route: SavedRoute,
  selectedNodeId: string | null,
  issues: RouteValidationIssue[]
) {
  return {
    nodeId: node.id,
    title: node.title,
    description: node.description,
    selected: selectedNodeId === node.id,
    isEntry: route.entryNodeId === node.id,
    warningCount: getNodeValidationIssues(issues, node.id).length,
  };
}

export function buildCanvasNodes(
  route: SavedRoute,
  selectedNodeId: string | null,
  issues: RouteValidationIssue[]
): Node[] {
  return route.nodes.map((node) => {
    const base = buildBaseData(node, route, selectedNodeId, issues);

    if (node.type === 'chapter') {
      return buildChapterFlowNode(node, base);
    }
    if (node.type === 'branch') {
      return buildBranchFlowNode(node, base);
    }
    if (node.type === 'form') {
      return buildFormFlowNode(node, base);
    }
    return buildInterestFlowNode(node, base);
  });
}

function buildChapterFlowNode(
  node: RouteChapterNode,
  base: ReturnType<typeof buildBaseData>
): Node<ChapterCanvasNodeData> {
  return {
    id: node.id,
    type: 'chapter',
    position: node.position,
    data: { ...base, peacockCount: node.peacocks.length },
  };
}

function buildBranchFlowNode(
  node: RouteBranchNode,
  base: ReturnType<typeof buildBaseData>
): Node<BranchCanvasNodeData> {
  return {
    id: node.id,
    type: 'branch',
    position: node.position,
    data: {
      ...base,
      options: node.options.map((option) => ({ id: option.id, label: option.label })),
    },
  };
}

function buildFormFlowNode(
  node: RouteFormNode,
  base: ReturnType<typeof buildBaseData>
): Node<FormCanvasNodeData> {
  return {
    id: node.id,
    type: 'form',
    position: node.position,
    data: { ...base, fieldCount: node.fields.length },
  };
}

function buildInterestFlowNode(
  node: RouteInterestNode,
  base: ReturnType<typeof buildBaseData>
): Node<InterestCanvasNodeData> {
  return {
    id: node.id,
    type: 'interest',
    position: node.position,
    data: {
      ...base,
      topics: node.topics.map((topic) => ({ id: topic.id, label: topic.label })),
    },
  };
}

export function buildCanvasEdges(route: SavedRoute): Edge[] {
  return route.edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    sourceHandle: edge.sourceHandle,
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
    label: getEdgeLabel(route, edge.sourceNodeId, edge.sourceHandle),
  }));
}

function getEdgeLabel(
  route: SavedRoute,
  sourceNodeId: string,
  sourceHandle?: string
): string | undefined {
  if (!sourceHandle) return undefined;
  const source = route.nodes.find((node) => node.id === sourceNodeId);
  if (!source) return undefined;
  if (source.type === 'branch') {
    return source.options.find((option) => option.id === sourceHandle)?.label;
  }
  if (source.type === 'interest') {
    return source.topics.find((topic) => topic.id === sourceHandle)?.label;
  }
  return undefined;
}
