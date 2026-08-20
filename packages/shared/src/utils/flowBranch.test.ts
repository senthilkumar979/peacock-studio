import { describe, expect, it } from 'vitest';
import type { FlowBranch, FlowOutlineItem, FlowStep, LinkedPeacockPath } from '../types/events';
import {
  collectAllBranches,
  collectLinkedDocumentIds,
  formatPathStepRange,
  getBranchPresentation,
  getPlayableStepRange,
  hasDuplicatePathLabels,
  sortBranchPaths,
  wouldCreateCircularLink,
} from './flowBranch';

function step(id: string): FlowStep {
  return {
    id,
    title: id,
    notes: '',
    generatedTitle: id,
    generatedDescription: '',
    screenshotId: `shot-${id}`,
    event: {
      id: `ev-${id}`,
      type: 'page-view',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Page',
      viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: `shot-${id}`,
    },
  };
}

function path(overrides: Partial<LinkedPeacockPath> = {}): LinkedPeacockPath {
  return {
    id: 'path-1',
    label: 'Path A',
    targetDocumentId: 'doc-b',
    targetTitle: 'Other',
    targetDescription: '',
    fromStepId: 's1',
    toStepId: 's2',
    order: 0,
    ...overrides,
  };
}

function branch(overrides: Partial<FlowBranch> = {}): FlowBranch {
  return {
    id: 'branch-1',
    kind: 'branch',
    title: 'Choose',
    description: '',
    paths: [],
    ...overrides,
  };
}

describe('sortBranchPaths', () => {
  it('sorts by order ascending without mutating input', () => {
    const paths = [path({ id: 'b', order: 2 }), path({ id: 'a', order: 1 })];
    const sorted = sortBranchPaths(paths);
    expect(sorted.map((p) => p.id)).toEqual(['a', 'b']);
    expect(paths[0]?.id).toBe('b');
  });
});

describe('getBranchPresentation', () => {
  it('returns explicit presentation when set', () => {
    expect(getBranchPresentation(branch({ presentation: 'grid', paths: [] }))).toBe('grid');
  });

  it('defaults to grid when there are four or more paths', () => {
    const paths = [0, 1, 2, 3].map((order) => path({ id: `p${order}`, order }));
    expect(getBranchPresentation(branch({ paths }))).toBe('grid');
  });

  it('defaults to list for fewer than four paths', () => {
    expect(getBranchPresentation(branch({ paths: [path()] }))).toBe('list');
  });
});

describe('getPlayableStepRange', () => {
  const outline: FlowOutlineItem[] = [step('s1'), step('s2'), step('s3')];

  it('returns inclusive range regardless of order', () => {
    expect(getPlayableStepRange(outline, 's3', 's1')?.map((s) => s.id)).toEqual([
      's1',
      's2',
      's3',
    ]);
  });

  it('returns null when either id is missing', () => {
    expect(getPlayableStepRange(outline, 'missing', 's1')).toBeNull();
    expect(getPlayableStepRange(outline, 's1', 'missing')).toBeNull();
  });
});

describe('formatPathStepRange', () => {
  const outline: FlowOutlineItem[] = [step('s1'), step('s2'), step('s3')];

  it('formats a single step', () => {
    expect(formatPathStepRange(outline, 's2', 's2')).toBe('Step 2');
  });

  it('formats a multi-step range', () => {
    expect(formatPathStepRange(outline, 's1', 's3')).toBe('Steps 1–3');
  });

  it('returns Invalid range for missing ids', () => {
    expect(formatPathStepRange(outline, 's1', 'nope')).toBe('Invalid range');
  });
});

describe('collectLinkedDocumentIds', () => {
  it('collects unique target document ids from branches', () => {
    const items: FlowOutlineItem[] = [
      step('s1'),
      branch({
        paths: [
          path({ targetDocumentId: 'doc-a' }),
          path({ id: 'p2', targetDocumentId: 'doc-b', order: 1 }),
          path({ id: 'p3', targetDocumentId: 'doc-a', order: 2 }),
        ],
      }),
    ];
    expect(collectLinkedDocumentIds(items).sort()).toEqual(['doc-a', 'doc-b']);
  });
});

describe('collectAllBranches', () => {
  it('returns only branch outline items', () => {
    const b = branch();
    expect(collectAllBranches([step('s1'), b])).toEqual([b]);
  });
});

describe('hasDuplicatePathLabels', () => {
  it('detects case-insensitive duplicate labels', () => {
    expect(
      hasDuplicatePathLabels([
        path({ label: 'Free' }),
        path({ id: 'p2', label: ' free ', order: 1 }),
      ]),
    ).toBe(true);
  });

  it('ignores blank labels and unique labels', () => {
    expect(
      hasDuplicatePathLabels([
        path({ label: '  ' }),
        path({ id: 'p2', label: 'Free', order: 1 }),
        path({ id: 'p3', label: 'Pro', order: 2 }),
      ]),
    ).toBe(false);
  });
});

describe('wouldCreateCircularLink', () => {
  it('is true only when host and target match', () => {
    expect(wouldCreateCircularLink('doc-1', 'doc-1')).toBe(true);
    expect(wouldCreateCircularLink('doc-1', 'doc-2')).toBe(false);
  });
});
