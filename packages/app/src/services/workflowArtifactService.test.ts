import { beforeEach, describe, expect, it, vi } from 'vitest';

const isCloudLibraryActive = vi.fn(() => true);
const cloudListWorkflowArtifacts = vi.fn();
const cloudGetWorkflowArtifact = vi.fn();
const cloudListDocumentArtifactStatuses = vi.fn();
const cloudPatchWorkflowArtifactMetadata = vi.fn();
const cloudSaveWorkflowArtifact = vi.fn();
const cloudSaveFlowDocument = vi.fn();
const getFlowDocument = vi.fn();

vi.mock('@/cloud/authContext', () => ({
  isCloudLibraryActive: () => isCloudLibraryActive(),
}));

vi.mock('@/cloud/repositories/workflowArtifactRepository', () => ({
  cloudListWorkflowArtifacts: (...args: any[]) => (cloudListWorkflowArtifacts as any)(...args),
  cloudGetWorkflowArtifact: (...args: any[]) => (cloudGetWorkflowArtifact as any)(...args),
  cloudListDocumentArtifactStatuses: (...args: any[]) =>
    cloudListDocumentArtifactStatuses(...args),
  cloudPatchWorkflowArtifactMetadata: (...args: any[]) =>
    cloudPatchWorkflowArtifactMetadata(...args),
  cloudSaveWorkflowArtifact: (...args: any[]) => (cloudSaveWorkflowArtifact as any)(...args),
}));

vi.mock('@/cloud/repositories/flowDocumentRepository', () => ({
  cloudSaveFlowDocument: (...args: any[]) => (cloudSaveFlowDocument as any)(...args),
}));

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: (...args: any[]) => (getFlowDocument as any)(...args),
}));

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  return {
    ...actual,
    generateTestCasesMarkdown: () => 'cases',
    generatePlaywrightSpec: () => 'spec',
    generateFlowMapMarkdown: () => 'map',
    buildWorkflowGraph: () => ({ nodes: [], edges: [] }),
    pruneFlowMapOverlay: (overlay: unknown) => overlay,
  };
});

import {
  generateWorkflowArtifact,
  getWorkflowArtifact,
  listDocumentArtifactStatuses,
  listWorkflowArtifacts,
  saveFlowMapOverlay,
} from './workflowArtifactService';
import { WORKFLOW_ARTIFACT_TYPES } from '@/types/workflowArtifact';

describe('workflowArtifactService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isCloudLibraryActive.mockReturnValue(true);
  });

  it('requires cloud library', async () => {
    isCloudLibraryActive.mockReturnValue(false);
    await expect(listWorkflowArtifacts(WORKFLOW_ARTIFACT_TYPES.testCases)).rejects.toThrow(
      /Sign in with cloud sync/,
    );
  });

  it('delegates list/get/status/overlay', async () => {
    cloudListWorkflowArtifacts.mockResolvedValue([{ id: 'a' }]);
    cloudGetWorkflowArtifact.mockResolvedValue({ id: 'a' });
    cloudListDocumentArtifactStatuses.mockResolvedValue([]);
    cloudPatchWorkflowArtifactMetadata.mockResolvedValue({ id: 'a' });

    await expect(listWorkflowArtifacts(WORKFLOW_ARTIFACT_TYPES.playwright)).resolves.toEqual([
      { id: 'a' },
    ]);
    await expect(getWorkflowArtifact('d', WORKFLOW_ARTIFACT_TYPES.flowMap)).resolves.toEqual({
      id: 'a',
    });
    await expect(listDocumentArtifactStatuses('d')).resolves.toEqual([]);
    await saveFlowMapOverlay('d', { nodes: {} } as never);
    expect(cloudPatchWorkflowArtifactMetadata).toHaveBeenCalled();
  });

  it('generateWorkflowArtifact saves content and optionally prunes overlay', async () => {
    getFlowDocument.mockResolvedValue({
      id: 'd',
      flow: { flow: { title: ' My Flow ' } },
      steps: [],
    });
    cloudGetWorkflowArtifact.mockResolvedValue({ metadata: { nodes: { a: 1 } } });
    cloudSaveWorkflowArtifact.mockResolvedValue({ id: 'new' });
    cloudPatchWorkflowArtifactMetadata.mockResolvedValue({ id: 'patched' });

    const result = await generateWorkflowArtifact('d', WORKFLOW_ARTIFACT_TYPES.flowMap);
    expect(cloudSaveFlowDocument).toHaveBeenCalled();
    expect(cloudSaveWorkflowArtifact).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'map', flowTitle: 'My Flow' }),
    );
    expect(result).toEqual({ id: 'patched' });

    cloudGetWorkflowArtifact.mockResolvedValue(undefined);
    cloudSaveWorkflowArtifact.mockResolvedValue({ id: 'cases' });
    await expect(
      generateWorkflowArtifact('d', WORKFLOW_ARTIFACT_TYPES.testCases),
    ).resolves.toEqual({ id: 'cases' });
  });

  it('throws when document missing', async () => {
    getFlowDocument.mockResolvedValue(undefined);
    await expect(
      generateWorkflowArtifact('missing', WORKFLOW_ARTIFACT_TYPES.playwright),
    ).rejects.toThrow(/not found/);
  });
});
