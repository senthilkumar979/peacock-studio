import {
  getDocumentStepIndexItemId,
  type DocumentStepIndexItem,
  type DocumentStepIndexLinkedPathItem,
  type DocumentStepIndexStepItem,
} from './documentStepIndexTypes';

export interface DocumentStepIndexLinkedPathGroup {
  type: 'linkedPathGroup';
  pathId: string;
  pathItem: DocumentStepIndexLinkedPathItem;
  steps: DocumentStepIndexStepItem[];
}

export type DocumentStepIndexEntry =
  | { type: 'item'; item: DocumentStepIndexItem }
  | DocumentStepIndexLinkedPathGroup;

export function groupDocumentStepIndexItems(
  items: DocumentStepIndexItem[],
): DocumentStepIndexEntry[] {
  const entries: DocumentStepIndexEntry[] = [];
  let index = 0;

  while (index < items.length) {
    const item = items[index];
    if (!item) break;

    if (item.type === 'linkedPath') {
      const pathItem = item;
      const steps: DocumentStepIndexStepItem[] = [];
      index += 1;

      while (index < items.length) {
        const nextItem = items[index];
        if (
          !nextItem ||
          nextItem.type !== 'step' ||
          !nextItem.isLinkedPathStep ||
          nextItem.pathId !== pathItem.pathId
        ) {
          break;
        }

        steps.push(nextItem);
        index += 1;
      }

      entries.push({
        type: 'linkedPathGroup',
        pathId: pathItem.pathId,
        pathItem,
        steps,
      });
      continue;
    }

    entries.push({ type: 'item', item });
    index += 1;
  }

  return entries;
}

export function isLinkedPathGroupActive(
  group: DocumentStepIndexLinkedPathGroup,
  activeItemId: string | null,
): boolean {
  if (!activeItemId) return false;
  if (getDocumentStepIndexItemId(group.pathItem) === activeItemId) return true;
  return group.steps.some((step) => step.stepId === activeItemId);
}
