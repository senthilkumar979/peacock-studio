import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowBranch, FlowStep } from '@peacock/shared';

const getFlowDocument = vi.fn();

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: (...args: unknown[]) => getFlowDocument(...args),
}));

import { flattenVideoBeats } from './flattenVideoBeats';

const clickStep = {
  id: 'click-1',
  title: 'Save',
  notes: 'Click Save',
  generatedTitle: 'Save',
  generatedDescription: '',
  screenshotId: 'shot-1',
  event: {
    id: 'ev-click',
    type: 'click' as const,
    timestamp: 1,
    url: 'https://example.com/form',
    title: 'Form',
    viewport: { width: 1280, height: 720, scrollX: 0, scrollY: 0, dpr: 1 },
    position: { x: 100, y: 200, xPercent: 0.2, yPercent: 0.4 },
    screenshotId: 'shot-1',
  },
} as FlowStep;

const navStep: FlowStep = {
  id: 'nav-1',
  title: 'Open settings',
  notes: '',
  generatedTitle: 'Open settings',
  generatedDescription: 'Go to settings',
  screenshotId: '',
  event: {
    id: 'ev-nav',
    type: 'navigation',
    timestamp: 2,
    fromUrl: 'https://example.com/form',
    toUrl: 'https://example.com/settings',
  },
};

const pageStep: FlowStep = {
  id: 'page-1',
  title: 'Dashboard',
  notes: '',
  generatedTitle: 'Dashboard',
  generatedDescription: 'Landed on dashboard',
  screenshotId: 'page-shot',
  event: {
    id: 'ev-page',
    type: 'page-view',
    timestamp: 3,
    url: 'https://example.com/dash',
    title: 'Dash',
    viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: 'page-shot',
  },
};

const linkedClick = {
  ...clickStep,
  id: 'linked-1',
  screenshotId: 'linked-shot',
  event: {
    ...clickStep.event,
    id: 'ev-linked',
    screenshotId: 'linked-shot',
    position: { x: 1, y: 1, xPercent: 5, yPercent: 90 },
  },
} as FlowStep;

const branch: FlowBranch = {
  id: 'branch-1',
  kind: 'branch',
  title: 'Choose path',
  description: '',
  presentation: 'list',
  paths: [
    {
      id: 'path-selected',
      order: 1,
      label: 'Selected',
      targetDocumentId: 'linked-doc',
      targetTitle: 'Linked',
      targetDescription: '',
      fromStepId: 'linked-1',
      toStepId: 'linked-1',
    },
    {
      id: 'path-other',
      order: 0,
      label: 'Other',
      targetDocumentId: 'other-doc',
      targetTitle: 'Other',
      targetDescription: '',
      fromStepId: 'x',
      toStepId: 'x',
    },
  ],
};

describe('flattenVideoBeats', () => {
  beforeEach(() => {
    getFlowDocument.mockReset();
  });

  it('emits a zoom beat for click markers and a nav card without a screenshot', async () => {
    const beats = await flattenVideoBeats({
      steps: [clickStep, navStep],
      screenshotUrls: { 'shot-1': 'blob:host' },
      pathSelections: {},
    });

    expect(beats).toHaveLength(2);
    expect(beats[0]).toMatchObject({
      kind: 'step',
      stepNumber: 1,
      screenshotUrl: 'blob:host',
      marker: { x: 0.2, y: 0.4 },
    });
    expect(beats[1]).toMatchObject({
      kind: 'nav',
      stepNumber: 2,
      screenshotUrl: null,
      marker: null,
      url: 'https://example.com/settings',
    });
  });

  it('keeps page-view screenshots as still steps and skips sections', async () => {
    const beats = await flattenVideoBeats({
      steps: [
        { id: 'sec', kind: 'section', title: 'Start', description: '' },
        pageStep,
      ],
      screenshotUrls: { 'page-shot': 'blob:page' },
      pathSelections: {},
    });

    expect(beats).toEqual([
      expect.objectContaining({
        kind: 'step',
        stepNumber: 1,
        screenshotUrl: 'blob:page',
        marker: null,
      }),
    ]);
  });

  it('expands the selected linked path and clamps edge markers', async () => {
    getFlowDocument.mockResolvedValue({
      id: 'linked-doc',
      steps: [linkedClick],
      screenshotUrls: { 'linked-shot': 'blob:linked' },
    });

    const beats = await flattenVideoBeats({
      steps: [clickStep, branch],
      screenshotUrls: { 'shot-1': 'blob:host' },
      pathSelections: { 'branch-1': 'path-selected' },
    });

    expect(getFlowDocument).toHaveBeenCalledWith('linked-doc');
    expect(beats).toHaveLength(2);
    expect(beats[1]).toMatchObject({
      kind: 'step',
      stepNumber: 2,
      screenshotUrl: 'blob:linked',
      marker: { x: 0.15, y: 0.85 },
    });
  });
});
