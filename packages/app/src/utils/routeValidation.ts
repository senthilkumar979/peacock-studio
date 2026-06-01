import type { RouteValidationIssue, SavedRoute } from '@/types/route';
import { migrateSavedRoute } from '@/utils/routeGraph';

export function validateRoute(route: SavedRoute): RouteValidationIssue[] {
  const graph = migrateSavedRoute(route);
  const issues: RouteValidationIssue[] = [];

  if (!graph.entryNodeId) {
    issues.push({
      id: 'missing-entry',
      severity: 'error',
      message: 'Route is missing an entry node.',
    });
  }

  const entryNode = graph.nodes.find((node) => node.id === graph.entryNodeId);
  if (graph.entryNodeId && !entryNode) {
    issues.push({
      id: 'invalid-entry',
      severity: 'error',
      message: 'Entry node no longer exists on the canvas.',
    });
  }

  const reachable = collectReachableNodeIds(graph);
  graph.nodes.forEach((node) => {
    if (!reachable.has(node.id)) {
      issues.push({
        id: `unreachable-${node.id}`,
        severity: 'warning',
        nodeId: node.id,
        message: `"${node.title}" is not reachable from the entry node.`,
      });
    }
  });

  graph.nodes.forEach((node) => {
    if (node.type === 'chapter' && node.peacocks.length === 0) {
      issues.push({
        id: `empty-chapter-${node.id}`,
        severity: 'warning',
        nodeId: node.id,
        message: `Chapter "${node.title}" has no demos attached.`,
      });
    }

    if (node.type === 'branch') {
      node.options.forEach((option) => {
        const connected = graph.edges.some(
          (edge) => edge.sourceNodeId === node.id && edge.sourceHandle === option.id
        );
        if (!connected) {
          issues.push({
            id: `branch-option-${node.id}-${option.id}`,
            severity: 'warning',
            nodeId: node.id,
            message: `Branch option "${option.label}" in "${node.title}" is not connected.`,
          });
        }
      });
    }

    if (node.type === 'interest') {
      node.topics.forEach((topic) => {
        const connected = graph.edges.some(
          (edge) => edge.sourceNodeId === node.id && edge.sourceHandle === topic.id
        );
        if (!connected) {
          issues.push({
            id: `interest-topic-${node.id}-${topic.id}`,
            severity: 'warning',
            nodeId: node.id,
            message: `Interest topic "${topic.label}" in "${node.title}" is not connected.`,
          });
        }
      });
    }

    if (node.type === 'form' && node.fields.length === 0) {
      issues.push({
        id: `empty-form-${node.id}`,
        severity: 'warning',
        nodeId: node.id,
        message: `Form "${node.title}" has no fields.`,
      });
    }

    const incoming = graph.edges.filter((edge) => edge.targetNodeId === node.id);
    if (node.id !== graph.entryNodeId && incoming.length === 0) {
      issues.push({
        id: `no-incoming-${node.id}`,
        severity: 'warning',
        nodeId: node.id,
        message: `"${node.title}" has no incoming connection.`,
      });
    }
  });

  return issues;
}

function collectReachableNodeIds(route: SavedRoute): Set<string> {
  const reachable = new Set<string>();
  const queue = [route.entryNodeId];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId || reachable.has(nodeId)) continue;
    reachable.add(nodeId);

    route.edges
      .filter((edge) => edge.sourceNodeId === nodeId)
      .forEach((edge) => queue.push(edge.targetNodeId));
  }

  return reachable;
}

export function getNodeValidationIssues(
  issues: RouteValidationIssue[],
  nodeId: string
): RouteValidationIssue[] {
  return issues.filter((issue) => issue.nodeId === nodeId);
}
