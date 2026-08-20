import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = { organizationId: 'org-1' };
const fromMock = vi.fn();
const storageFrom = vi.fn();
const functionsInvoke = vi.fn();

vi.mock('@/cloud/authContext', () => ({
  requireCloudAuthContext: () => auth,
}));

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: () => ({
    from: fromMock,
    storage: { from: storageFrom },
    functions: { invoke: functionsInvoke },
  }),
}));

vi.mock('@peacock/shared', async () => {
  const actual = await vi.importActual<typeof import('@peacock/shared')>('@peacock/shared');
  return {
    ...actual,
    prepareImageForCloudStorage: async (blob: Blob) => blob,
    collectReferencedScreenshotIds: () => new Set(['keep']),
  };
});

vi.mock('@/cloud/screenshotUtils', async () => {
  const actual = await vi.importActual<typeof import('@/cloud/screenshotUtils')>(
    '@/cloud/screenshotUtils',
  );
  return {
    ...actual,
    inlineScreenshotToBlob: vi.fn(async () => new Blob(['img'], { type: 'image/png' })),
    sha256HexFromBlob: vi.fn(async () => 'hash-1'),
    isInlineScreenshotUrl: (url: string) => url.startsWith('data:') || url.startsWith('blob:'),
    buildScreenshotStoragePath: actual.buildScreenshotStoragePath,
  };
});

import {
  deleteDocumentScreenshots,
  pruneDocumentScreenshots,
  resolveScreenshotUrls,
  syncDocumentScreenshots,
} from './screenshotStorage';

function chain(result: { data?: unknown; error?: unknown; count?: number | null }) {
  const api: Record<string, unknown> = {};
  for (const method of [
    'select',
    'eq',
    'limit',
    'maybeSingle',
    'upsert',
    'delete',
    'in',
  ] as const) {
    api[method] = vi.fn(() => api);
  }
  (api as { then?: unknown }).then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled);
  return api;
}

describe('screenshotStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageFrom.mockReturnValue({
      createSignedUrl: vi.fn(async () => ({
        data: { signedUrl: 'https://signed' },
        error: null,
      })),
      upload: vi.fn(async () => ({ error: null })),
      remove: vi.fn(async () => ({ error: null })),
    });
  });

  it('resolveScreenshotUrls prefers edge function payload', async () => {
    functionsInvoke.mockResolvedValue({
      data: { data: { a: 'https://a' } },
      error: null,
    });
    await expect(resolveScreenshotUrls('doc')).resolves.toEqual({ a: 'https://a' });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('resolveScreenshotUrls falls back to storage signed urls', async () => {
    functionsInvoke.mockResolvedValue({ data: { error: 'rate' }, error: null });
    fromMock.mockReturnValue(
      chain({ data: [{ id: 'shot', storage_path: 'org/doc/shot.png' }], error: null }),
    );
    await expect(resolveScreenshotUrls('doc')).resolves.toEqual({ shot: 'https://signed' });
  });

  it('syncDocumentScreenshots uploads inline screenshots', async () => {
    fromMock
      .mockReturnValueOnce(chain({ data: null, error: null })) // findExistingAssetByHash
      .mockReturnValueOnce(chain({ data: null, error: null })); // upsert

    await syncDocumentScreenshots('doc', {
      shot: 'data:image/png;base64,YQ==',
      remote: 'https://cdn/x.png',
    });

    expect(storageFrom).toHaveBeenCalledWith('screenshots');
    expect(fromMock).toHaveBeenCalledWith('screenshot_assets');
  });

  it('syncDocumentScreenshots reuses existing hash path', async () => {
    fromMock
      .mockReturnValueOnce(
        chain({ data: { storage_path: 'shared/path.png', byte_size: 9 }, error: null }),
      )
      .mockReturnValueOnce(chain({ data: null, error: null }));

    await syncDocumentScreenshots('doc', { shot: 'blob:local' });
    expect(storageFrom().upload).not.toHaveBeenCalled();
  });

  it('pruneDocumentScreenshots deletes stale rows and orphaned paths', async () => {
    const listApi = chain({
      data: [
        { id: 'keep', storage_path: 'p1' },
        { id: 'drop', storage_path: 'p2' },
      ],
      error: null,
    });
    const deleteApi = chain({ data: null, error: null });
    const countApi = chain({ data: null, error: null, count: 0 });
    fromMock
      .mockReturnValueOnce(listApi)
      .mockReturnValueOnce(deleteApi)
      .mockReturnValueOnce(countApi);

    await pruneDocumentScreenshots('doc', [] as never);
    expect(listApi.select).toHaveBeenCalledWith('id, storage_path');
    expect(deleteApi.delete).toHaveBeenCalled();
    expect(storageFrom().remove).toHaveBeenCalledWith(['p2']);
  });

  it('deleteDocumentScreenshots removes assets and orphaned storage', async () => {
    fromMock
      .mockReturnValueOnce(chain({ data: [{ storage_path: 'p1' }], error: null }))
      .mockReturnValueOnce(chain({ data: null, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: null, count: 0 }));

    await deleteDocumentScreenshots('doc');
    expect(storageFrom().remove).toHaveBeenCalledWith(['p1']);
  });

  it('throws when sync uploads fail', async () => {
    const { inlineScreenshotToBlob } = await import('@/cloud/screenshotUtils');
    vi.mocked(inlineScreenshotToBlob).mockResolvedValueOnce(null);
    await expect(
      syncDocumentScreenshots('doc', { shot: 'data:image/png;base64,YQ==' }),
    ).rejects.toThrow(/Failed to upload/);
  });
});
