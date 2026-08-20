import { describe, expect, it } from 'vitest';
import type { FlowOutlineItem, FlowStep } from '@peacock/shared';
import type { LinkedPathContent } from '@/hooks/useDocumentBranchPaths';
import {
  buildDocumentIndexItems,
  countDocumentViewPlayableSteps,
  getBranchRenderContext,
  getDocumentGuideViewedStepCount,
  truncateOutlinePathLabel,
} from './documentOutline';
import type { DocumentStepIndexItem } from './documentStepIndexTypes';

const pageViewStep = (id: string, title: string): FlowStep => ({
  id,
  title,
  notes: '',
  generatedTitle: title,
  generatedDescription: '',
  screenshotId: `${id}-shot`,
  event: {
    id: `${id}-ev`,
    type: 'page-view',
    timestamp: 1,
    url: 'https://example.com',
    title: 'Page',
    viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: `${id}-shot`,
  },
});

const linkedContent = (pathId: string, steps: FlowStep[]): LinkedPathContent => ({
  pathId,
  targetDocumentId: 'doc-2',
  steps,
  screenshotUrls: {},
});

describe('truncateOutlinePathLabel', () => {
  it('returns trimmed labels within the default max length', () => {
    expect(truncateOutlinePathLabel('  Short  ')).toBe('Short');
  });

  it('truncates long labels with an ellipsis', () => {
    const label = 'A'.repeat(40);
    expect(truncateOutlinePathLabel(label)).toBe(`${'A'.repeat(31)}…`);
    expect(truncateOutlinePathLabel(label, 10)).toBe(`${'A'.repeat(9)}…`);
  });
});

describe('buildDocumentIndexItems', () => {
  const section = { id: 'sec-1', kind: 'section' as const, title: 'Setup', description: '' };
  const branch = {
    id: 'br-1',
    kind: 'branch' as const,
    title: 'Choose path',
    description: '',
    paths: [
      {
        id: 'path-1',
        label: 'Admin route with a very long label that should truncate',
        targetDocumentId: 'doc-2',
        targetTitle: 'Admin',
        targetDescription: '',
        fromStepId: 'a',
        toStepId: 'b',
        order: 0,
      },
    ],
  };
  const step = pageViewStep('step-1', 'Open settings');

  it('includes overview and outline items with linked path steps', () => {
    const items = buildDocumentIndexItems({
      steps: [section, branch, step] as FlowOutlineItem[],
      flowTitle: 'Onboarding',
      flowDetailsAnchor: 'flow-details',
      selectedPathByBranchId: { 'br-1': 'path-1' },
      linkedContentByPathId: {
        'path-1': linkedContent('path-1', [pageViewStep('l1', 'Linked one')]),
      },
    });

    expect(items[0]).toMatchObject({
      type: 'overview',
      title: 'Onboarding',
      itemId: 'flow-details',
    });
    expect(items.map((item) => item.type)).toEqual([
      'overview',
      'section',
      'branch',
      'linkedPath',
      'step',
      'step',
    ]);
    const linkedPath = items.find((item) => item.type === 'linkedPath');
    expect(linkedPath).toMatchObject({
      type: 'linkedPath',
      pathId: 'path-1',
      fullPathLabel: 'Admin route with a very long label that should truncate',
    });
    if (linkedPath?.type === 'linkedPath') {
      expect(linkedPath.pathLabel.endsWith('…')).toBe(true);
    }
    const linkedStep = items.find(
      (item) => item.type === 'step' && item.isLinkedPathStep,
    );
    expect(linkedStep).toMatchObject({
      stepNumber: 1,
      title: 'Linked one',
      pathId: 'path-1',
    });
    const mainStep = items.find(
      (item) => item.type === 'step' && !item.isLinkedPathStep,
    );
    expect(mainStep).toMatchObject({ stepNumber: 2, stepId: 'step-1' });
  });

  it('omits overview and uses fallback titles when requested', () => {
    const items = buildDocumentIndexItems({
      steps: [step] as FlowOutlineItem[],
      flowDetailsAnchor: 'flow-details',
      selectedPathByBranchId: {},
      linkedContentByPathId: {},
      includeOverview: false,
    });
    expect(items).toHaveLength(1);
    expect(items[0]?.type).toBe('step');

    const withDefaultTitle = buildDocumentIndexItems({
      steps: [],
      flowDetailsAnchor: 'flow-details',
      selectedPathByBranchId: {},
      linkedContentByPathId: {},
    });
    expect(withDefaultTitle[0]).toMatchObject({ title: 'Flow details' });
  });

  it('skips linked path expansion when no path is selected', () => {
    const items = buildDocumentIndexItems({
      steps: [branch] as FlowOutlineItem[],
      flowDetailsAnchor: 'flow-details',
      selectedPathByBranchId: {},
      linkedContentByPathId: {},
      includeOverview: false,
    });
    expect(items.map((item) => item.type)).toEqual(['branch']);
  });
});

describe('countDocumentViewPlayableSteps', () => {
  it('counts playable steps plus selected linked path steps', () => {
    const steps = [
      pageViewStep('s1', 'One'),
      {
        id: 'br-1',
        kind: 'branch' as const,
        title: 'Branch',
        description: '',
        paths: [],
      },
    ] as FlowOutlineItem[];

    expect(countDocumentViewPlayableSteps(steps, {}, {})).toBe(1);
    expect(
      countDocumentViewPlayableSteps(
        steps,
        { 'br-1': 'path-1' },
        { 'path-1': linkedContent('path-1', [pageViewStep('l1', 'L'), pageViewStep('l2', 'L2')]) },
      ),
    ).toBe(3);
  });
});

describe('getDocumentGuideViewedStepCount', () => {
  const indexItems: DocumentStepIndexItem[] = [
    { type: 'overview', anchorId: 'a', itemId: 'flow-details', title: 'Details' },
    { type: 'step', anchorId: 's1', stepId: 'step-1', stepNumber: 1, title: 'One' },
    { type: 'section', anchorId: 'sec', sectionId: 'sec-1', title: 'Chapter' },
    { type: 'step', anchorId: 's2', stepId: 'step-2', stepNumber: 2, title: 'Two' },
  ];

  it('returns 0 without an active item', () => {
    expect(getDocumentGuideViewedStepCount(indexItems, null)).toBe(0);
    expect(getDocumentGuideViewedStepCount([], 'step-1')).toBe(0);
  });

  it('returns total steps when guide-complete is active', () => {
    expect(getDocumentGuideViewedStepCount(indexItems, 'guide-complete')).toBe(2);
  });

  it('returns the latest step number at or before the active item', () => {
    expect(getDocumentGuideViewedStepCount(indexItems, 'step-1')).toBe(1);
    expect(getDocumentGuideViewedStepCount(indexItems, 'sec-1')).toBe(1);
    expect(getDocumentGuideViewedStepCount(indexItems, 'step-2')).toBe(2);
  });
});

describe('getBranchRenderContext', () => {
  it('resolves selected path content, loading, error, and label', () => {
    const content = linkedContent('path-1', [pageViewStep('l1', 'L')]);
    expect(
      getBranchRenderContext(
        'br-1',
        [
          { id: 'path-1', label: 'Admin' },
          { id: 'path-2', label: 'User' },
        ],
        { 'br-1': 'path-1' },
        { 'path-1': content },
        new Set(['path-1']),
        { 'path-1': 'boom' },
      ),
    ).toEqual({
      selectedPathId: 'path-1',
      linkedContent: content,
      loading: true,
      error: 'boom',
      pathLabel: 'Admin',
    });
  });

  it('returns nulls when no path is selected', () => {
    expect(
      getBranchRenderContext('br-1', [], {}, {}, new Set(), {}),
    ).toEqual({
      selectedPathId: null,
      linkedContent: null,
      loading: false,
      error: null,
      pathLabel: null,
    });
  });
});
