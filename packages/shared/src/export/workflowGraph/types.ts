export type WorkflowGraphNodeKind = 'root' | 'section' | 'step' | 'branch' | 'path';

export interface WorkflowGraphNode {
  id: string;
  kind: WorkflowGraphNodeKind;
  label: string;
  stepNumber?: number;
  description?: string;
}

export interface WorkflowGraphEdge {
  from: string;
  to: string;
  label?: string;
}

export interface WorkflowGraph {
  title: string;
  nodes: WorkflowGraphNode[];
  edges: WorkflowGraphEdge[];
}
