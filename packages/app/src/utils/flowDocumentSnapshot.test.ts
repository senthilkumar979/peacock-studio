import { describe, expect, it, vi } from 'vitest';
import type { FlowOutlineItem, FlowPayload, StepResource } from '@peacock/shared';
import {
  buildFlowPayloadWithSteps,
  buildSavedFlowDocument,
  countPlayableSteps,
  createNewDocumentId,
} from './flowDocumentSnapshot';

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  return {
    ...actual,
    createId: () => 'new-doc-id',
  };
});

const step: FlowOutlineItem = {
  id: 'step-1',
  title: 'Open page',
  notes: '',
  generatedTitle: 'Open page',
  generatedDescription: '',
  screenshotId: 'shot-1',
  event: {
    id: 'ev-1',
    type: 'page-view',
    timestamp: 1,
    url: 'https://example.com',
    title: 'Page',
    viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: 'shot-1',
  },
};

const flow: FlowPayload = {
  flow: {
    title: '  Demo  ',
    description: 'Desc',
    version: '  ',
    category: 'general',
    tags: ['a'],
  },
  metadata: {
    createdAt: 1,
    browser: 'test',
    platform: 'test',
    screen: { width: 1, height: 1 },
  },
  steps: [],
};

const resource: StepResource = {
  id: 'r1',
  documentId: 'doc-1',
  stepId: 'step-1',
  url: 'https://example.com/guide',
  sortOrder: 0,
  createdAt: 10,
};

describe('flowDocumentSnapshot', () => {
  it('buildFlowPayloadWithSteps returns null without flow', () => {
    expect(buildFlowPayloadWithSteps({ flow: null, steps: [], screenshotUrls: {} })).toBeNull();
  });

  it('buildFlowPayloadWithSteps normalizes title/version and attaches steps', () => {
    const payload = buildFlowPayloadWithSteps({
      flow,
      steps: [step],
      screenshotUrls: { 'shot-1': 'blob:1', orphan: 'blob:x' },
    });
    expect(payload?.flow.title).toBe('Demo');
    expect(payload?.flow.version).toBe('1.0.0');
    expect(payload?.steps).toEqual([step]);
  });

  it('buildSavedFlowDocument returns null without flow', () => {
    expect(
      buildSavedFlowDocument({ flow: null, steps: [], screenshotUrls: {} }, 'doc-1'),
    ).toBeNull();
  });

  it('buildSavedFlowDocument prunes screenshots and defaults resources/status', () => {
    const doc = buildSavedFlowDocument(
      {
        flow,
        steps: [step],
        screenshotUrls: { 'shot-1': 'blob:1', orphan: 'blob:x' },
        stepResources: [resource],
        shareSettings: { includeMainFlow: true, enabledPathIds: [], enabledBranchIds: [] },
      },
      'doc-1',
    );
    expect(doc?.id).toBe('doc-1');
    expect(doc?.status).toBe('draft');
    expect(doc?.screenshotUrls).toEqual({ 'shot-1': 'blob:1' });
    expect(doc?.stepResources).toEqual([resource]);
    expect(doc?.shareSettings?.includeMainFlow).toBe(true);
  });

  it('buildSavedFlowDocument preserves existing savedAt and normalizes status', () => {
    const doc = buildSavedFlowDocument(
      { flow, steps: [step], screenshotUrls: {} },
      'doc-1',
      { savedAt: 99, status: 'live' },
    );
    expect(doc?.savedAt).toBe(99);
    expect(doc?.status).toBe('live');
    expect(doc?.stepResources).toEqual([]);
  });

  it('createNewDocumentId uses createId', () => {
    expect(createNewDocumentId()).toBe('new-doc-id');
  });

  it('countPlayableSteps counts steps only', () => {
    expect(countPlayableSteps([step])).toBe(1);
  });
});
