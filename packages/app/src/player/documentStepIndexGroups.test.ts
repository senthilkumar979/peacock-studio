import { describe, expect, it } from 'vitest';
import {
  groupDocumentStepIndexItems,
  isLinkedPathGroupActive,
} from './documentStepIndexGroups';
import type { DocumentStepIndexItem } from './documentStepIndexTypes';

describe('groupDocumentStepIndexItems', () => {
  it('groups linked path items with following linked steps', () => {
    const items: DocumentStepIndexItem[] = [
      { type: 'overview', anchorId: 'o', itemId: 'flow-details', title: 'Details' },
      {
        type: 'linkedPath',
        anchorId: 'p',
        branchId: 'br',
        pathId: 'path-1',
        itemId: 'path:path-1',
        pathLabel: 'Admin',
        fullPathLabel: 'Admin',
      },
      {
        type: 'step',
        anchorId: 's1',
        stepId: 'path-1:l1',
        stepNumber: 1,
        title: 'Linked',
        isLinkedPathStep: true,
        pathId: 'path-1',
      },
      {
        type: 'step',
        anchorId: 's2',
        stepId: 'main-1',
        stepNumber: 2,
        title: 'Main',
      },
    ];

    const entries = groupDocumentStepIndexItems(items);
    expect(entries).toHaveLength(3);
    expect(entries[0]).toEqual({ type: 'item', item: items[0] });
    expect(entries[1]).toMatchObject({
      type: 'linkedPathGroup',
      pathId: 'path-1',
      steps: [items[2]],
    });
    expect(entries[2]).toEqual({ type: 'item', item: items[3] });
  });

  it('stops linked grouping when pathId mismatches or flag is missing', () => {
    const items: DocumentStepIndexItem[] = [
      {
        type: 'linkedPath',
        anchorId: 'p',
        branchId: 'br',
        pathId: 'path-1',
        itemId: 'path:path-1',
        pathLabel: 'Admin',
        fullPathLabel: 'Admin',
      },
      {
        type: 'step',
        anchorId: 's1',
        stepId: 'other:l1',
        stepNumber: 1,
        title: 'Other path',
        isLinkedPathStep: true,
        pathId: 'path-2',
      },
    ];

    const entries = groupDocumentStepIndexItems(items);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ type: 'linkedPathGroup', steps: [] });
    expect(entries[1]).toEqual({ type: 'item', item: items[1] });
  });
});

describe('isLinkedPathGroupActive', () => {
  const group = {
    type: 'linkedPathGroup' as const,
    pathId: 'path-1',
    pathItem: {
      type: 'linkedPath' as const,
      anchorId: 'p',
      branchId: 'br',
      pathId: 'path-1',
      itemId: 'path:path-1',
      pathLabel: 'Admin',
      fullPathLabel: 'Admin',
    },
    steps: [
      {
        type: 'step' as const,
        anchorId: 's1',
        stepId: 'path-1:l1',
        stepNumber: 1,
        title: 'Linked',
        isLinkedPathStep: true,
        pathId: 'path-1',
      },
    ],
  };

  it('is active for the path item or any step in the group', () => {
    expect(isLinkedPathGroupActive(group, null)).toBe(false);
    expect(isLinkedPathGroupActive(group, 'path:path-1')).toBe(true);
    expect(isLinkedPathGroupActive(group, 'path-1:l1')).toBe(true);
    expect(isLinkedPathGroupActive(group, 'other')).toBe(false);
  });
});
