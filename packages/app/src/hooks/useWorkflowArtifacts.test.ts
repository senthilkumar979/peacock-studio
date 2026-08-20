import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useDocumentArtifactStatuses,
  useSaveFlowMapOverlay,
  useWorkflowArtifactDetail,
  useWorkflowArtifactLibrary,
} from './useWorkflowArtifacts';

vi.mock('@/cloud/authContext', () => ({
  isCloudLibraryActive: vi.fn(() => false),
}));

vi.mock('@/services/workflowArtifactService', () => ({
  generateWorkflowArtifact: vi.fn(),
  getWorkflowArtifact: vi.fn(),
  listDocumentArtifactStatuses: vi.fn(),
  listWorkflowArtifacts: vi.fn(),
  saveFlowMapOverlay: vi.fn(),
}));

vi.mock('@/utils/appError', () => ({
  reportAppError: vi.fn((_c: string, err: unknown) => ({
    title: 'Failed',
    userMessage: err instanceof Error ? err.message : String(err),
  })),
}));

import { isCloudLibraryActive } from '@/cloud/authContext';
import {
  generateWorkflowArtifact,
  getWorkflowArtifact,
  listDocumentArtifactStatuses,
  listWorkflowArtifacts,
  saveFlowMapOverlay,
} from '@/services/workflowArtifactService';

describe('useWorkflowArtifactLibrary', () => {
  beforeEach(() => {
    vi.mocked(isCloudLibraryActive).mockReturnValue(false);
    vi.mocked(listWorkflowArtifacts).mockReset();
  });

  it('clears when cloud inactive', async () => {
    const { result } = renderHook(() => useWorkflowArtifactLibrary('flow_map'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.artifacts).toEqual([]);
  });

  it('loads artifacts when cloud active', async () => {
    vi.mocked(isCloudLibraryActive).mockReturnValue(true);
    vi.mocked(listWorkflowArtifacts).mockResolvedValue([{ id: 'a1' }] as never);
    const { result } = renderHook(() => useWorkflowArtifactLibrary('test_cases'));
    await waitFor(() => expect(result.current.artifacts).toEqual([{ id: 'a1' }]));
  });

  it('captures load errors', async () => {
    vi.mocked(isCloudLibraryActive).mockReturnValue(true);
    vi.mocked(listWorkflowArtifacts).mockRejectedValue(new Error('nope'));
    const { result } = renderHook(() => useWorkflowArtifactLibrary('flow_map'));
    await waitFor(() => expect(result.current.error).toBe('nope'));
  });
});

describe('useWorkflowArtifactDetail', () => {
  beforeEach(() => {
    vi.mocked(isCloudLibraryActive).mockReturnValue(true);
    vi.mocked(getWorkflowArtifact).mockReset();
  });

  it('loads artifact detail', async () => {
    vi.mocked(getWorkflowArtifact).mockResolvedValue({ id: 'a1' } as never);
    const { result } = renderHook(() => useWorkflowArtifactDetail('doc-1', 'flow_map'));
    await waitFor(() => expect(result.current.artifact).toEqual({ id: 'a1' }));
  });
});

describe('useSaveFlowMapOverlay', () => {
  beforeEach(() => {
    vi.mocked(isCloudLibraryActive).mockReturnValue(true);
    vi.mocked(saveFlowMapOverlay).mockReset();
  });

  it('saves overlay for active cloud docs', async () => {
    vi.mocked(saveFlowMapOverlay).mockResolvedValue({ ok: true } as never);
    const { result } = renderHook(() => useSaveFlowMapOverlay('doc-1'));
    await act(async () => {
      await expect(result.current.saveOverlay({ nodes: [] } as never)).resolves.toEqual({
        ok: true,
      });
    });
  });

  it('returns null when inactive', async () => {
    vi.mocked(isCloudLibraryActive).mockReturnValue(false);
    const { result } = renderHook(() => useSaveFlowMapOverlay('doc-1'));
    await expect(result.current.saveOverlay({} as never)).resolves.toBeNull();
  });
});

describe('useDocumentArtifactStatuses', () => {
  beforeEach(() => {
    vi.mocked(isCloudLibraryActive).mockReturnValue(true);
    vi.mocked(listDocumentArtifactStatuses).mockReset();
    vi.mocked(generateWorkflowArtifact).mockReset();
  });

  it('lists statuses and generates artifacts', async () => {
    vi.mocked(listDocumentArtifactStatuses).mockResolvedValue([{ id: 's1' }] as never);
    vi.mocked(generateWorkflowArtifact).mockResolvedValue({ id: 'new' } as never);
    const { result } = renderHook(() => useDocumentArtifactStatuses('doc-1'));
    await waitFor(() => expect(result.current.statuses).toEqual([{ id: 's1' }]));
    await act(async () => {
      await expect(result.current.generate('playwright')).resolves.toEqual({ id: 'new' });
    });
  });
});
