import { describe, expect, it } from 'vitest';
import type { FlowBranch } from '@peacock/shared';
import {
  buildDefaultPdfPathSelections,
  hasCompletePdfPathSelections,
} from './pdfPathSelection';

function branch(id: string, pathIds: string[]): FlowBranch {
  return {
    id,
    kind: 'branch',
    title: id,
    description: '',
    paths: pathIds.map((pathId, order) => ({
      id: pathId,
      label: pathId,
      targetDocumentId: `doc-${pathId}`,
      targetTitle: pathId,
      targetDescription: '',
      fromStepId: 'from',
      toStepId: 'to',
      order,
    })),
  };
}

describe('pdfPathSelection', () => {
  it('defaults each branch to the lowest-order path', () => {
    // pathIds map to order by index, so first listed path wins after sortBranchPaths
    expect(buildDefaultPdfPathSelections([branch('b1', ['p2', 'p1'])])).toEqual({
      b1: 'p2',
    });
    expect(buildDefaultPdfPathSelections([branch('empty', [])])).toEqual({});
  });

  it('requires a valid selection for every branch that has paths', () => {
    const branches = [branch('b1', ['p1', 'p2']), branch('b2', [])];
    expect(hasCompletePdfPathSelections(branches, { b1: 'p2' })).toBe(true);
    expect(hasCompletePdfPathSelections(branches, { b1: 'missing' })).toBe(false);
    expect(hasCompletePdfPathSelections(branches, {})).toBe(false);
  });
});
