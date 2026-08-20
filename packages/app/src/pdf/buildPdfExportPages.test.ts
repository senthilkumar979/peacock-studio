import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowBranch, FlowStep, StepResource } from '@peacock/shared';

const getFlowDocument = vi.fn();

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: (...args: any[]) => (getFlowDocument as any)(...args),
}));

import { buildPdfExportPages, countPdfStepPages } from './buildPdfExportPages';

const hostStep: FlowStep = {
  id: 'host-1',
  title: 'Host step',
  notes: 'Do this',
  generatedTitle: 'Host step',
  generatedDescription: '',
  screenshotId: 'host-shot',
  event: {
    id: 'ev-host',
    type: 'page-view',
    timestamp: 1,
    url: 'https://example.com',
    title: 'Page',
    viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: 'host-shot',
  },
};

const linkedStep: FlowStep = {
  id: 'linked-1',
  title: 'Linked step',
  notes: 'Linked action',
  generatedTitle: 'Linked step',
  generatedDescription: '',
  screenshotId: 'linked-shot',
  event: {
    id: 'ev-linked',
    type: 'page-view',
    timestamp: 2,
    url: 'https://example.com/b',
    title: 'Page B',
    viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: 'linked-shot',
  },
};

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

const hostResource: StepResource = {
  id: 'hr1',
  documentId: 'host',
  stepId: 'host-1',
  url: 'https://example.com/host',
  sortOrder: 0,
  createdAt: 1,
};

const linkedResource: StepResource = {
  id: 'lr1',
  documentId: 'linked-doc',
  stepId: 'linked-1',
  url: 'https://example.com/linked',
  sortOrder: 0,
  createdAt: 1,
};

describe('buildPdfExportPages', () => {
  beforeEach(() => {
    getFlowDocument.mockReset();
  });

  it('emits step pages with host resources and counts unique steps', async () => {
    const pages = await buildPdfExportPages(
      [hostStep],
      { 'host-shot': 'blob:host' },
      {},
      [hostResource],
    );

    expect(pages).toHaveLength(1);
    expect(pages[0]).toMatchObject({
      kind: 'step',
      step: hostStep,
      resources: [hostResource],
    });
    expect(countPdfStepPages(pages)).toBe(1);
  });

  it('inserts branch pages and expands the selected linked document range', async () => {
    getFlowDocument.mockResolvedValue({
      id: 'linked-doc',
      steps: [linkedStep],
      screenshotUrls: { 'linked-shot': 'blob:linked' },
      stepResources: [linkedResource],
    });

    const pages = await buildPdfExportPages(
      [hostStep, branch],
      { 'host-shot': 'blob:host' },
      { 'branch-1': 'path-selected' },
      [hostResource],
    );

    expect(pages[0]?.kind).toBe('step');
    expect(pages[1]).toMatchObject({
      kind: 'branch',
      selectedPath: expect.objectContaining({ id: 'path-selected' }),
    });
    expect(pages[2]).toMatchObject({
      kind: 'step',
      step: linkedStep,
      resources: [linkedResource],
      screenshotUrls: { 'linked-shot': 'blob:linked' },
    });
    expect(getFlowDocument).toHaveBeenCalledWith('linked-doc');
    expect(countPdfStepPages(pages)).toBe(2);
  });

  it('falls back to the first sorted path when selection is missing', async () => {
    getFlowDocument.mockResolvedValue({
      id: 'other-doc',
      steps: [],
      screenshotUrls: {},
      stepResources: [],
    });

    const pages = await buildPdfExportPages([branch], {}, {});
    expect(pages[0]).toMatchObject({
      kind: 'branch',
      selectedPath: expect.objectContaining({ id: 'path-other' }),
    });
  });

  it('skips linked expansion when the document or range is missing', async () => {
    getFlowDocument.mockResolvedValue(null);
    const pages = await buildPdfExportPages(
      [branch],
      {},
      { 'branch-1': 'path-selected' },
    );
    expect(pages).toHaveLength(1);
    expect(pages[0]?.kind).toBe('branch');

    getFlowDocument.mockResolvedValue({
      id: 'linked-doc',
      steps: [linkedStep],
      screenshotUrls: {},
      stepResources: [],
    });
    const emptyRange = await buildPdfExportPages(
      [
        {
          ...branch,
          paths: [
            {
              ...branch.paths[0]!,
              fromStepId: 'missing',
              toStepId: 'missing',
            },
          ],
        },
      ],
      {},
      { 'branch-1': 'path-selected' },
    );
    expect(emptyRange).toHaveLength(1);
  });

  it('skips branches with no paths', async () => {
    const pages = await buildPdfExportPages([{ ...branch, paths: [] }], {}, {});
    expect(pages).toEqual([]);
  });
});
