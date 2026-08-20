import { describe, expect, it } from 'vitest';
import { getDocumentStepIndexItemId } from './documentStepIndexTypes';
import type { DocumentStepIndexItem } from './documentStepIndexTypes';

describe('getDocumentStepIndexItemId', () => {
  const cases: Array<{ item: DocumentStepIndexItem; id: string }> = [
    {
      item: { type: 'overview', anchorId: 'a', itemId: 'flow-details', title: 'Details' },
      id: 'flow-details',
    },
    {
      item: { type: 'step', anchorId: 'a', stepId: 'step-1', stepNumber: 1, title: 'One' },
      id: 'step-1',
    },
    {
      item: { type: 'branch', anchorId: 'a', branchId: 'br-1', title: 'Branch' },
      id: 'br-1',
    },
    {
      item: {
        type: 'linkedPath',
        anchorId: 'a',
        branchId: 'br-1',
        pathId: 'path-1',
        itemId: 'path:path-1',
        pathLabel: 'Admin',
        fullPathLabel: 'Admin',
      },
      id: 'path:path-1',
    },
    {
      item: { type: 'section', anchorId: 'a', sectionId: 'sec-1', title: 'Chapter' },
      id: 'sec-1',
    },
  ];

  it.each(cases)('returns $id for $item.type items', ({ item, id }) => {
    expect(getDocumentStepIndexItemId(item)).toBe(id);
  });
});
