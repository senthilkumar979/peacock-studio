import {
  isFlowBranch,
  isFlowSection,
  isFlowStep,
  type FlowBranch,
  type FlowOutlineItem,
  type FlowSection,
  type FlowStep,
  type LinkedPeacockPath,
} from '../../types/events';

export type WorkflowGraphNodeContext =
  | { kind: 'root' }
  | { kind: 'section'; section: FlowSection }
  | { kind: 'step'; step: FlowStep }
  | { kind: 'branch'; branch: FlowBranch }
  | { kind: 'path'; path: LinkedPeacockPath };

export function buildWorkflowGraphContextMap(
  steps: FlowOutlineItem[],
): Map<string, WorkflowGraphNodeContext> {
  const map = new Map<string, WorkflowGraphNodeContext>();
  map.set('root', { kind: 'root' });

  for (const item of steps) {
    if (isFlowSection(item)) {
      map.set(`section-${item.id}`, { kind: 'section', section: item });
      continue;
    }

    if (isFlowBranch(item)) {
      map.set(`branch-${item.id}`, { kind: 'branch', branch: item });
      for (const path of item.paths) {
        map.set(`path-${path.id}`, { kind: 'path', path });
      }
      continue;
    }

    if (isFlowStep(item)) {
      map.set(`step-${item.id}`, { kind: 'step', step: item });
    }
  }

  return map;
}
