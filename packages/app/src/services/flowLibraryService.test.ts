import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowPayload, FlowStep, StepResource } from '@peacock/shared';
import type { SavedFlowDocument } from '@/types/savedFlow';

const copyResources = vi.fn();
const getFlowDocument = vi.fn();
const saveFlowDocument = vi.fn();
const findTitleVersionConflict = vi.fn();
const deleteFlowDocument = vi.fn();
const listFlowSummaries = vi.fn();
const updateFlowDocumentStatus = vi.fn();

vi.mock('@/storage/stepResourceDb', () => ({
  copyResources: (...args: any[]) => (copyResources as any)(...args),
}));

vi.mock('@/storage/libraryRouter', () => ({
  getFlowDocument: (...args: any[]) => (getFlowDocument as any)(...args),
  saveFlowDocument: (...args: any[]) => (saveFlowDocument as any)(...args),
  findTitleVersionConflict: (...args: any[]) => (findTitleVersionConflict as any)(...args),
  deleteFlowDocument: (...args: any[]) => (deleteFlowDocument as any)(...args),
  listFlowSummaries: (...args: any[]) => (listFlowSummaries as any)(...args),
  updateFlowDocumentStatus: (...args: any[]) => (updateFlowDocumentStatus as any)(...args),
}));

vi.mock('@/utils/flowDocumentSnapshot', async () => {
  const actual = await vi.importActual<typeof import('@/utils/flowDocumentSnapshot')>(
    '@/utils/flowDocumentSnapshot',
  );
  return {
    ...actual,
    createNewDocumentId: () => 'new-doc-id',
  };
});

import {
  duplicateFlowDocument,
  loadFlowIntoStore,
  persistCurrentFlow,
  saveNewFlowFromStore,
} from './flowLibraryService';
import { useFlowStore } from '@/store/flowStore';

function makeStep(id: string): FlowStep {
  return {
    id,
    title: id,
    notes: '',
    generatedTitle: id,
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
  };
}

function makeFlow(steps: FlowStep[]): FlowPayload {
  return {
    flow: {
      title: 'Source',
      description: 'Desc',
      version: '1.0.0',
      category: 'general',
      tags: ['Tag'],
    },
    metadata: {
      createdAt: 1,
      browser: 'test',
      platform: 'test',
      screen: { width: 1, height: 1 },
    },
    steps,
  };
}

const resource: StepResource = {
  id: 'r1',
  documentId: 'source-doc',
  stepId: 'step-1',
  url: 'https://example.com/guide',
  sortOrder: 0,
  createdAt: 1,
};

describe('flowLibraryService resource wiring', () => {
  beforeEach(() => {
    useFlowStore.getState().resetFlow();
    copyResources.mockReset();
    getFlowDocument.mockReset();
    saveFlowDocument.mockReset();
    findTitleVersionConflict.mockReset();
    findTitleVersionConflict.mockResolvedValue(null);
    saveFlowDocument.mockResolvedValue(undefined);
    copyResources.mockResolvedValue(undefined);
  });

  it('persistCurrentFlow includes stepResources from the store snapshot', async () => {
    const step = makeStep('step-1');
    useFlowStore.getState().hydrateFromDocument({
      id: 'doc-1',
      savedAt: 10,
      updatedAt: 10,
      status: 'draft',
      flow: makeFlow([step]),
      steps: [step],
      screenshotUrls: { 'step-1-shot': 'blob:1' },
      stepResources: [resource],
    });
    getFlowDocument.mockResolvedValue({
      id: 'doc-1',
      savedAt: 10,
      updatedAt: 10,
      status: 'draft',
      flow: makeFlow([step]),
      steps: [step],
      screenshotUrls: {},
    } satisfies SavedFlowDocument);

    await persistCurrentFlow('doc-1');

    expect(saveFlowDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'doc-1',
        stepResources: [resource],
        screenshotUrls: { 'step-1-shot': 'blob:1' },
      }),
    );
  });

  it('saveNewFlowFromStore persists current stepResources on the new document', async () => {
    const step = makeStep('step-1');
    useFlowStore.setState({
      ...useFlowStore.getState(),
      flow: makeFlow([step]),
      steps: [step],
      screenshotUrls: { 'step-1-shot': 'blob:1' },
      stepResources: [{ ...resource, documentId: 'temp' }],
      isLoaded: true,
    });

    const id = await saveNewFlowFromStore();
    expect(id).toBe('new-doc-id');
    expect(saveFlowDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'new-doc-id',
        stepResources: [expect.objectContaining({ url: resource.url })],
      }),
    );
  });

  it('duplicateFlowDocument copies resources when the source has any', async () => {
    const step = makeStep('step-1');
    getFlowDocument.mockResolvedValue({
      id: 'source-doc',
      savedAt: 1,
      updatedAt: 1,
      status: 'live',
      flow: makeFlow([step]),
      steps: [step],
      screenshotUrls: { 'step-1-shot': 'blob:1' },
      stepResources: [resource],
    } satisfies SavedFlowDocument);

    await expect(duplicateFlowDocument('source-doc')).resolves.toBe('new-doc-id');
    expect(saveFlowDocument).toHaveBeenCalled();
    expect(copyResources).toHaveBeenCalledWith('source-doc', 'new-doc-id');
  });

  it('duplicateFlowDocument skips copyResources when source has none', async () => {
    const step = makeStep('step-1');
    getFlowDocument.mockResolvedValue({
      id: 'source-doc',
      savedAt: 1,
      updatedAt: 1,
      status: 'live',
      flow: makeFlow([step]),
      steps: [step],
      screenshotUrls: {},
      stepResources: [],
    } satisfies SavedFlowDocument);

    await duplicateFlowDocument('source-doc');
    expect(copyResources).not.toHaveBeenCalled();
  });

  it('loadFlowIntoStore hydrates resources into the store', () => {
    const step = makeStep('step-1');
    loadFlowIntoStore({
      id: 'doc-1',
      savedAt: 1,
      updatedAt: 1,
      status: 'live',
      flow: makeFlow([step]),
      steps: [step],
      screenshotUrls: {},
      stepResources: [resource],
    });
    expect(useFlowStore.getState().stepResources).toEqual([resource]);
  });
});
