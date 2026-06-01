export type RouteStatus = 'draft' | 'live';

export type RouteNodeType = 'chapter' | 'branch' | 'form' | 'interest';

export type RouteBuilderViewMode = 'list' | 'canvas';

export interface RouteCanvasPosition {
  x: number;
  y: number;
}

export interface RoutePeacockRef {
  id: string;
  documentId: string;
  order: number;
  label?: string;
}

/** @deprecated List MVP shape — migrated to chapter nodes on load. */
export interface RouteChapter {
  id: string;
  title: string;
  description: string;
  peacocks: RoutePeacockRef[];
}

export interface RouteChapterNode {
  id: string;
  type: 'chapter';
  title: string;
  description: string;
  peacocks: RoutePeacockRef[];
  position: RouteCanvasPosition;
}

export interface RouteBranchOption {
  id: string;
  label: string;
}

export interface RouteBranchNode {
  id: string;
  type: 'branch';
  title: string;
  description: string;
  options: RouteBranchOption[];
  position: RouteCanvasPosition;
}

export type RouteFormFieldType = 'text' | 'email' | 'textarea';

export interface RouteFormField {
  id: string;
  label: string;
  type: RouteFormFieldType;
  required: boolean;
}

export interface RouteFormNode {
  id: string;
  type: 'form';
  title: string;
  description: string;
  fields: RouteFormField[];
  position: RouteCanvasPosition;
}

export interface RouteInterestTopic {
  id: string;
  label: string;
}

export interface RouteInterestNode {
  id: string;
  type: 'interest';
  title: string;
  description: string;
  topics: RouteInterestTopic[];
  allowMultiple: boolean;
  position: RouteCanvasPosition;
}

export type RouteNode =
  | RouteChapterNode
  | RouteBranchNode
  | RouteFormNode
  | RouteInterestNode;

export interface RouteEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string;
}

export interface SavedRoute {
  id: string;
  title: string;
  description: string;
  status: RouteStatus;
  entryNodeId: string;
  nodes: RouteNode[];
  edges: RouteEdge[];
  /** @deprecated Migrated into `nodes` on load. */
  chapters?: RouteChapter[];
  createdAt: number;
  updatedAt: number;
}

export interface SavedRouteSummary {
  id: string;
  title: string;
  description: string;
  status: RouteStatus;
  chapterCount: number;
  peacockCount: number;
  branchCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface RouteSegment {
  nodeId: string;
  chapterTitle: string;
  chapterDescription: string;
  chapterIndex: number;
  peacockRefId: string;
  documentId: string;
  peacockIndexInChapter: number;
}

/** @deprecated Linear learner index — graph learner uses RouteLearnerGraphState. */
export interface RouteLearnerPosition {
  segmentIndex: number;
  stepIndex: number;
}

export interface RouteLearnerHistoryEntry {
  nodeId: string;
  peacockIndex: number;
  stepIndex: number;
}

export interface RouteLearnerGraphState {
  currentNodeId: string;
  peacockIndex: number;
  stepIndex: number;
  branchChoices: Record<string, string>;
  interestChoices: Record<string, string[]>;
  formResponses: Record<string, Record<string, string>>;
  history: RouteLearnerHistoryEntry[];
}

export interface RoutePathChoices {
  branchChoices: Record<string, string>;
  interestChoices: Record<string, string[]>;
}

export function createEmptyPathChoices(): RoutePathChoices {
  return { branchChoices: {}, interestChoices: {} };
}

export interface RouteValidationIssue {
  id: string;
  severity: 'warning' | 'error';
  nodeId?: string;
  message: string;
}

export function isChapterNode(node: RouteNode): node is RouteChapterNode {
  return node.type === 'chapter';
}

export function isBranchNode(node: RouteNode): node is RouteBranchNode {
  return node.type === 'branch';
}

export function isFormNode(node: RouteNode): node is RouteFormNode {
  return node.type === 'form';
}

export function isInterestNode(node: RouteNode): node is RouteInterestNode {
  return node.type === 'interest';
}

export function isChoiceNode(node: RouteNode): node is RouteBranchNode | RouteInterestNode {
  return node.type === 'branch' || node.type === 'interest';
}
