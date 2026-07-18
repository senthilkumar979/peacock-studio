import {
  isFlowBranch,
  isFlowSection,
  isFlowStep,
  type FlowOutlineItem,
} from '../../types/events';
import type { WorkflowGraph, WorkflowGraphEdge, WorkflowGraphNode } from './types';

function sanitizeMermaidLabel(value: string): string {
  return value.replace(/["[\]|{}]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function buildWorkflowGraph(
  title: string,
  steps: FlowOutlineItem[],
): WorkflowGraph {
  const nodes: WorkflowGraphNode[] = [
    { id: 'root', kind: 'root', label: sanitizeMermaidLabel(title || 'Untitled flow') },
  ];
  const edges: WorkflowGraphEdge[] = [];
  let previousId = 'root';
  let stepNumber = 0;

  for (const item of steps) {
    if (isFlowSection(item)) {
      const id = `section-${item.id}`;
      nodes.push({
        id,
        kind: 'section',
        label: sanitizeMermaidLabel(item.title || 'Section'),
        description: item.description.trim() || undefined,
      });
      edges.push({ from: previousId, to: id });
      previousId = id;
      continue;
    }

    if (isFlowBranch(item)) {
      const branchId = `branch-${item.id}`;
      nodes.push({
        id: branchId,
        kind: 'branch',
        label: sanitizeMermaidLabel(item.title || 'Branch'),
        description: item.description.trim() || undefined,
      });
      edges.push({ from: previousId, to: branchId });

      for (const path of item.paths) {
        const pathId = `path-${path.id}`;
        nodes.push({
          id: pathId,
          kind: 'path',
          label: sanitizeMermaidLabel(path.label || 'Path'),
          description: path.targetTitle.trim() || undefined,
        });
        edges.push({ from: branchId, to: pathId, label: path.label || undefined });
      }

      previousId = branchId;
      continue;
    }

    if (!isFlowStep(item)) continue;

    stepNumber += 1;
    const id = `step-${item.id}`;
    nodes.push({
      id,
      kind: 'step',
      label: sanitizeMermaidLabel(item.generatedTitle || item.title || `Step ${stepNumber}`),
      stepNumber,
      description: item.generatedDescription.trim() || undefined,
    });
    edges.push({ from: previousId, to: id });
    previousId = id;
  }

  return { title: title || 'Untitled flow', nodes, edges };
}
