import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = { organizationId: 'org-1', userEmail: 'u@e.com' };
const fromMock = vi.fn();
const recordOrgEvent = vi.fn(async () => undefined);

vi.mock('@/cloud/authContext', () => ({
  requireCloudAuthContext: () => auth,
}));

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: () => ({ from: fromMock }),
}));

vi.mock('@/cloud/repositories/analyticsRepository', () => ({
  recordOrgEvent: (...args: any[]) => (recordOrgEvent as any)(...args),
}));

import {
  cloudGetWorkflowArtifact,
  cloudListDocumentArtifactStatuses,
  cloudListWorkflowArtifacts,
  cloudPatchWorkflowArtifactMetadata,
  cloudSaveWorkflowArtifact,
} from './workflowArtifactRepository';

function chain(result: { data?: unknown; error?: unknown }) {
  const api: Record<string, unknown> = {};
  for (const method of [
    'select',
    'eq',
    'order',
    'maybeSingle',
    'upsert',
    'update',
    'single',
  ] as const) {
    api[method] = vi.fn(() => api);
  }
  (api as { then?: unknown }).then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled);
  return api;
}

const row = {
  id: 'a1',
  document_id: 'doc-1',
  artifact_type: 'flow_map',
  flow_title: 'Flow',
  content: '# map',
  metadata: null,
  generated_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
};

describe('workflowArtifactRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists and gets artifacts', async () => {
    fromMock.mockReturnValue(chain({ data: [row], error: null }));
    await expect(cloudListWorkflowArtifacts('flow_map')).resolves.toEqual([
      expect.objectContaining({ id: 'a1', documentId: 'doc-1' }),
    ]);

    fromMock.mockReturnValue(chain({ data: null, error: null }));
    await expect(cloudGetWorkflowArtifact('doc-1', 'flow_map')).resolves.toBeUndefined();

    fromMock.mockReturnValue(chain({ data: row, error: null }));
    await expect(cloudGetWorkflowArtifact('doc-1', 'flow_map')).resolves.toMatchObject({
      content: '# map',
    });

    fromMock.mockReturnValue(chain({ data: [row], error: null }));
    await expect(cloudListDocumentArtifactStatuses('doc-1')).resolves.toHaveLength(1);
  });

  it('saves artifact and records event', async () => {
    fromMock.mockReturnValue(chain({ data: row, error: null }));
    const saved = await cloudSaveWorkflowArtifact({
      documentId: 'doc-1',
      artifactType: 'test_cases',
      flowTitle: 'Flow',
      content: 'cases',
    });
    expect(saved.id).toBe('a1');
    expect(recordOrgEvent).toHaveBeenCalledWith(
      'artifact_export',
      expect.objectContaining({ resourceId: 'doc-1' }),
    );
  });

  it('patches metadata', async () => {
    fromMock.mockReturnValue(chain({ data: { ...row, metadata: { nodes: {} } }, error: null }));
    const patched = await cloudPatchWorkflowArtifactMetadata('doc-1', 'flow_map', {
      nodes: {},
    } as never);
    expect(patched.documentId).toBe('doc-1');
  });

  it('throws on query errors', async () => {
    fromMock.mockReturnValue(chain({ data: null, error: { message: 'x' } }));
    await expect(cloudListWorkflowArtifacts('playwright')).rejects.toEqual({ message: 'x' });
  });
});
