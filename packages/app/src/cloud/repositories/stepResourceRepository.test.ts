import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StepResource } from '@peacock/shared';

const auth = { organizationId: 'org-1' };

const fromMock = vi.fn();

vi.mock('@/cloud/authContext', () => ({
  requireCloudAuthContext: () => auth,
}));

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: () => ({ from: fromMock }),
}));

import {
  deleteResourcesForDocument,
  fetchDocumentResources,
  syncDocumentResources,
} from './stepResourceRepository';

function chain(result: { data?: unknown; error?: unknown }) {
  const api: Record<string, unknown> = {};
  const methods = ['select', 'eq', 'order', 'delete', 'in', 'upsert'] as const;
  for (const method of methods) {
    api[method] = vi.fn(() => api);
  }
  api.then = undefined;
  Object.assign(api, {
    // terminal awaits: supabase query builders are thenable-ish via awaiting the last call;
    // our repository awaits the builder result directly after chaining.
  });
  // Make the object thenable so `await supabase.from(...).select...` resolves.
  (api as { then?: unknown }).then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled);
  return api;
}

describe('stepResourceRepository', () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it('fetchDocumentResources maps rows and sorts via query', async () => {
    const rows = [
      {
        id: 'r1',
        organization_id: 'org-1',
        document_id: 'doc-1',
        step_id: 'step-1',
        url: 'https://example.com/a',
        label: 'Example A',
        sort_order: 0,
        created_at: '2024-01-01T00:00:00.000Z',
      },
    ];
    const api = chain({ data: rows, error: null });
    fromMock.mockReturnValue(api);

    const resources = await fetchDocumentResources('doc-1');
    expect(fromMock).toHaveBeenCalledWith('step_resources');
    expect(api.select).toHaveBeenCalled();
    expect(api.eq).toHaveBeenCalledWith('organization_id', 'org-1');
    expect(api.eq).toHaveBeenCalledWith('document_id', 'doc-1');
    expect(resources).toEqual([
      {
        id: 'r1',
        documentId: 'doc-1',
        stepId: 'step-1',
        url: 'https://example.com/a',
        label: 'Example A',
        sortOrder: 0,
        createdAt: Date.parse('2024-01-01T00:00:00.000Z'),
      },
    ]);
  });

  it('fetchDocumentResources throws on error', async () => {
    fromMock.mockReturnValue(chain({ data: null, error: { message: 'boom' } }));
    await expect(fetchDocumentResources('doc-1')).rejects.toEqual({ message: 'boom' });
  });

  it('fetchDocumentResources returns empty list when data is null', async () => {
    fromMock.mockReturnValue(chain({ data: null, error: null }));
    await expect(fetchDocumentResources('doc-1')).resolves.toEqual([]);
  });

  it('syncDocumentResources deletes missing ids then upserts remaining', async () => {
    const listApi = chain({ data: [{ id: 'old' }, { id: 'keep' }], error: null });
    const deleteApi = chain({ data: null, error: null });
    const upsertApi = chain({ data: null, error: null });

    fromMock
      .mockReturnValueOnce(listApi)
      .mockReturnValueOnce(deleteApi)
      .mockReturnValueOnce(upsertApi);

    const resources: StepResource[] = [
      {
        id: 'keep',
        documentId: 'doc-1',
        stepId: 'step-1',
        url: 'https://example.com/keep',
        label: 'Keep Guide',
        sortOrder: 1,
        createdAt: 1_700_000_000_000,
      },
      {
        id: 'new',
        documentId: 'doc-1',
        stepId: 'step-2',
        url: 'https://example.com/new',
        sortOrder: 0,
        createdAt: 1_700_000_000_100,
      },
    ];

    await syncDocumentResources('doc-1', resources);

    expect(deleteApi.delete).toHaveBeenCalled();
    expect(deleteApi.in).toHaveBeenCalledWith('id', ['old']);
    expect(upsertApi.upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          id: 'keep',
          organization_id: 'org-1',
          document_id: 'doc-1',
          step_id: 'step-1',
          url: 'https://example.com/keep',
          label: 'Keep Guide',
          sort_order: 1,
          created_at: new Date(1_700_000_000_000).toISOString(),
        }),
        expect.objectContaining({ id: 'new', step_id: 'step-2' }),
      ],
      { onConflict: 'id' },
    );
  });

  it('syncDocumentResources skips delete/upsert when nothing to change and empty input', async () => {
    const listApi = chain({ data: [], error: null });
    fromMock.mockReturnValueOnce(listApi);
    await syncDocumentResources('doc-1', []);
    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it('syncDocumentResources throws on list/delete/upsert errors', async () => {
    fromMock.mockReturnValueOnce(chain({ data: null, error: { message: 'list' } }));
    await expect(syncDocumentResources('doc-1', [])).rejects.toEqual({ message: 'list' });

    fromMock
      .mockReturnValueOnce(chain({ data: [{ id: 'gone' }], error: null }))
      .mockReturnValueOnce(chain({ data: null, error: { message: 'del' } }));
    await expect(
      syncDocumentResources('doc-1', [
        {
          id: 'keep',
          documentId: 'doc-1',
          stepId: 's',
          url: 'https://x.com',
          sortOrder: 0,
          createdAt: 1,
        },
      ]),
    ).rejects.toEqual({ message: 'del' });

    fromMock
      .mockReturnValueOnce(chain({ data: [], error: null }))
      .mockReturnValueOnce(
        chain({ data: null, error: { message: 'up' } }),
      );
    await expect(
      syncDocumentResources('doc-1', [
        {
          id: 'keep',
          documentId: 'doc-1',
          stepId: 's',
          url: 'https://x.com',
          sortOrder: 0,
          createdAt: 1,
        },
      ]),
    ).rejects.toEqual({ message: 'up' });
  });

  it('deleteResourcesForDocument deletes by org and document', async () => {
    const api = chain({ data: null, error: null });
    fromMock.mockReturnValue(api);
    await deleteResourcesForDocument('doc-1');
    expect(api.delete).toHaveBeenCalled();
    expect(api.eq).toHaveBeenCalledWith('organization_id', 'org-1');
    expect(api.eq).toHaveBeenCalledWith('document_id', 'doc-1');
  });

  it('deleteResourcesForDocument throws on error', async () => {
    fromMock.mockReturnValue(chain({ data: null, error: { message: 'nope' } }));
    await expect(deleteResourcesForDocument('doc-1')).rejects.toEqual({ message: 'nope' });
  });
});
