export interface DocumentStepIndexOverviewItem {
  type: 'overview';
  anchorId: string;
  itemId: string;
  title: string;
}

export interface DocumentStepIndexStepItem {
  type: 'step';
  anchorId: string;
  stepId: string;
  stepNumber: number;
  title: string;
  isLinkedPathStep?: boolean;
  pathId?: string;
}

export interface DocumentStepIndexSectionItem {
  type: 'section';
  anchorId: string;
  sectionId: string;
  title: string;
}

export interface DocumentStepIndexBranchItem {
  type: 'branch';
  anchorId: string;
  branchId: string;
  title: string;
}

export interface DocumentStepIndexLinkedPathItem {
  type: 'linkedPath';
  anchorId: string;
  branchId: string;
  pathId: string;
  itemId: string;
  pathLabel: string;
  fullPathLabel: string;
}

export type DocumentStepIndexItem =
  | DocumentStepIndexOverviewItem
  | DocumentStepIndexStepItem
  | DocumentStepIndexSectionItem
  | DocumentStepIndexBranchItem
  | DocumentStepIndexLinkedPathItem;

export function getDocumentStepIndexItemId(item: DocumentStepIndexItem): string {
  if (item.type === 'overview') return item.itemId;
  if (item.type === 'step') return item.stepId;
  if (item.type === 'branch') return item.branchId;
  if (item.type === 'linkedPath') return item.itemId;
  return item.sectionId;
}
