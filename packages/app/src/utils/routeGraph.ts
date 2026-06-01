import { createId } from '@peacock/shared';
import type {
  RouteChapterNode,
  RouteEdge,
  RouteNode,
  RoutePathChoices,
  RouteSegment,
  SavedRoute,
} from '@/types/route';
import { createEmptyPathChoices } from '@/types/route';
import { createChapterNode, createRouteEdge } from '@/utils/createRoute';

export function needsRouteMigration(route: SavedRoute): boolean {
  return !route.nodes?.length;
}

function normalizeMigratedRoute(route: SavedRoute): SavedRoute {
  return {
    ...route,
    entryNodeId: route.entryNodeId || route.nodes[0]?.id || '',
    nodes: route.nodes,
    edges: route.edges ?? [],
  };
}

export function migrateSavedRoute(route: SavedRoute): SavedRoute {
  if (route.nodes?.length) {
    return normalizeMigratedRoute(route);
  }

  const legacyChapters = route.chapters ?? [];
  if (legacyChapters.length === 0) {
    const entry = createChapterNode('Chapter 1', { x: 120, y: 80 });
    return {
      ...route,
      entryNodeId: entry.id,
      nodes: [entry],
      edges: [],
      chapters: undefined,
    };
  }

  const nodes: RouteNode[] = legacyChapters.map((chapter, index) => ({
    id: chapter.id,
    type: 'chapter' as const,
    title: chapter.title,
    description: chapter.description,
    peacocks: chapter.peacocks,
    position: { x: 120, y: 80 + index * 220 },
  }));

  const edges: RouteEdge[] = [];
  for (let index = 0; index < nodes.length - 1; index += 1) {
    const source = nodes[index];
    const target = nodes[index + 1];
    if (!source || !target) continue;
    edges.push(createRouteEdge(source.id, target.id));
  }

  return {
    ...route,
    entryNodeId: nodes[0]?.id ?? '',
    nodes,
    edges,
    chapters: undefined,
  };
}

export function getRouteNode(route: SavedRoute, nodeId: string): RouteNode | undefined {
  return migrateSavedRoute(route).nodes.find((node) => node.id === nodeId);
}

export function getChapterNodes(route: SavedRoute): RouteChapterNode[] {
  return migrateSavedRoute(route).nodes.filter(
    (node): node is RouteChapterNode => node.type === 'chapter'
  );
}

export function countRoutePeacocks(route: SavedRoute): number {
  return getChapterNodes(route).reduce((total, chapter) => total + chapter.peacocks.length, 0);
}

export function countRouteBranches(route: SavedRoute): number {
  return migrateSavedRoute(route).nodes.filter((node) => node.type === 'branch').length;
}

export function getOutgoingEdges(route: SavedRoute, nodeId: string): RouteEdge[] {
  return migrateSavedRoute(route).edges.filter((edge) => edge.sourceNodeId === nodeId);
}

export function getIncomingEdges(route: SavedRoute, nodeId: string): RouteEdge[] {
  return migrateSavedRoute(route).edges.filter((edge) => edge.targetNodeId === nodeId);
}

export function getChapterNodesInPathOrder(route: SavedRoute): RouteChapterNode[] {
  const graph = migrateSavedRoute(route);
  const visited = new Set<string>();
  const ordered: RouteChapterNode[] = [];
  let currentId: string | null = graph.entryNodeId;

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = getRouteNode(graph, currentId);
    if (!node) break;

    if (node.type === 'chapter') {
      ordered.push(node);
      const nextEdges = getOutgoingEdges(graph, currentId);
      currentId = nextEdges[0]?.targetNodeId ?? null;
      continue;
    }

    const nextEdges = getOutgoingEdges(graph, currentId);
    currentId = nextEdges[0]?.targetNodeId ?? null;
  }

  const remaining = getChapterNodes(graph).filter((chapter) => !visited.has(chapter.id));
  return [...ordered, ...remaining];
}

export function resolveNextNodeId(
  route: SavedRoute,
  currentNodeId: string,
  choices: RoutePathChoices
): string | null {
  const node = getRouteNode(route, currentNodeId);
  if (!node) return null;

  const outgoing = getOutgoingEdges(route, currentNodeId);
  if (outgoing.length === 0) return null;

  if (node.type === 'branch') {
    const choiceId = choices.branchChoices[node.id];
    if (!choiceId) return null;
    const matched = outgoing.find((edge) => edge.sourceHandle === choiceId);
    return matched?.targetNodeId ?? null;
  }

  if (node.type === 'interest') {
    const selected = choices.interestChoices[node.id] ?? [];
    const choiceId = selected[0];
    if (!choiceId) return null;
    const matched = outgoing.find((edge) => edge.sourceHandle === choiceId);
    return matched?.targetNodeId ?? null;
  }

  return outgoing[0]?.targetNodeId ?? null;
}

export function flattenRouteSegments(route: SavedRoute): RouteSegment[] {
  return flattenRouteSegmentsForPath(route, createEmptyPathChoices());
}

export function flattenRouteSegmentsForPath(
  route: SavedRoute,
  choices: RoutePathChoices
): RouteSegment[] {
  const graph = migrateSavedRoute(route);
  const segments: RouteSegment[] = [];
  const visited = new Set<string>();
  let currentId: string | null = graph.entryNodeId;
  let chapterIndex = 0;

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = getRouteNode(graph, currentId);
    if (!node) break;

    if (node.type === 'chapter') {
      const sorted = [...node.peacocks].sort((a, b) => a.order - b.order);
      sorted.forEach((peacock, peacockIndexInChapter) => {
        segments.push({
          nodeId: node.id,
          chapterTitle: node.title,
          chapterDescription: node.description,
          chapterIndex,
          peacockRefId: peacock.id,
          documentId: peacock.documentId,
          peacockIndexInChapter,
        });
      });
      chapterIndex += 1;
      currentId = resolveNextNodeId(graph, currentId, choices);
      continue;
    }

    currentId = resolveNextNodeId(graph, currentId, choices);
  }

  return segments;
}

export function segmentIndexForNodePeacock(
  segments: RouteSegment[],
  nodeId: string,
  peacockIndex: number
): number {
  return segments.findIndex(
    (segment) => segment.nodeId === nodeId && segment.peacockIndexInChapter === peacockIndex
  );
}

export function createLinearEdgesForNodes(nodes: RouteNode[]): RouteEdge[] {
  const edges: RouteEdge[] = [];
  for (let index = 0; index < nodes.length - 1; index += 1) {
    const source = nodes[index];
    const target = nodes[index + 1];
    if (!source || !target) continue;
    edges.push({
      id: createId(),
      sourceNodeId: source.id,
      targetNodeId: target.id,
    });
  }
  return edges;
}
