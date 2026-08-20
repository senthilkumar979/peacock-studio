import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = { organizationId: 'org-1' };
const fromMock = vi.fn();

vi.mock('@/cloud/authContext', () => ({
  requireCloudAuthContext: () => auth,
}));

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: () => ({ from: fromMock }),
}));

import {
  adjustOrganizationStorageBytes,
  incrementOrganizationStorageBytes,
} from './ensureOrganization';

function chain(result: { data?: unknown; error?: unknown }) {
  const api: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'single', 'update'] as const) {
    api[method] = vi.fn(() => api);
  }
  (api as { then?: unknown }).then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled);
  return api;
}

describe('ensureOrganization', () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it('no-ops when delta is 0 or non-positive increment', async () => {
    await adjustOrganizationStorageBytes(0);
    await incrementOrganizationStorageBytes(0);
    await incrementOrganizationStorageBytes(-5);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('reads then updates storage bytes', async () => {
    const readApi = chain({ data: { storage_bytes: 10 }, error: null });
    const updateApi = chain({ data: null, error: null });
    fromMock.mockReturnValueOnce(readApi).mockReturnValueOnce(updateApi);

    await incrementOrganizationStorageBytes(5);

    expect(fromMock).toHaveBeenCalledWith('organizations');
    expect(updateApi.update).toHaveBeenCalledWith(
      expect.objectContaining({ storage_bytes: 15 }),
    );
  });

  it('clamps next bytes at zero and throws on errors', async () => {
    fromMock.mockReturnValueOnce(chain({ data: { storage_bytes: 3 }, error: null }));
    fromMock.mockReturnValueOnce(chain({ data: null, error: null }));
    await adjustOrganizationStorageBytes(-10);
    expect(fromMock.mock.results[1]?.value.update).toHaveBeenCalledWith(
      expect.objectContaining({ storage_bytes: 0 }),
    );

    fromMock.mockReturnValueOnce(chain({ data: null, error: { message: 'read' } }));
    await expect(adjustOrganizationStorageBytes(1)).rejects.toEqual({ message: 'read' });

    fromMock
      .mockReturnValueOnce(chain({ data: { storage_bytes: 1 }, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: { message: 'upd' } }));
    await expect(adjustOrganizationStorageBytes(1)).rejects.toEqual({ message: 'upd' });
  });
});
