import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = { organizationId: 'org-1', userEmail: 'user@example.com' };
const fromMock = vi.fn();
const rpcMock = vi.fn();
const requireCapability = vi.fn();
const recordOrgEvent = vi.fn(async () => undefined);

vi.mock('@/cloud/authContext', () => ({
  requireCloudAuthContext: () => auth,
  requireCapability: (...args: any[]) => (requireCapability as any)(...args),
}));

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: () => ({ from: fromMock, rpc: rpcMock }),
}));

vi.mock('@/cloud/repositories/analyticsRepository', () => ({
  recordOrgEvent: (...args: any[]) => (recordOrgEvent as any)(...args),
}));

import {
  createOrUpdateShareLink,
  listShareLinksForResource,
  revokeShareLink,
} from './shareLinkRepository';

function chain(result: { data?: unknown; error?: unknown }) {
  const api: Record<string, unknown> = {};
  for (const method of [
    'select',
    'eq',
    'is',
    'maybeSingle',
    'update',
    'insert',
    'single',
  ] as const) {
    api[method] = vi.fn(() => api);
  }
  (api as { then?: unknown }).then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled);
  return api;
}

const existingRow = {
  id: 'sl1',
  token: 'tok',
  organization_id: 'org-1',
  resource_type: 'document',
  resource_id: 'doc-1',
  access_mode: 'readonly',
  channel: 'link',
  settings: {},
  requires_auth: false,
  expires_at: null,
  revoked_at: null,
  created_by: 'user@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

describe('shareLinkRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '123e4567-e89b-12d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`,
    );
  });

  it('updates settings when existing options match', async () => {
    fromMock
      .mockReturnValueOnce(chain({ data: existingRow, error: null }))
      .mockReturnValueOnce(chain({ data: { ...existingRow, settings: { viewMode: 'doc' } }, error: null }));

    const link = await createOrUpdateShareLink({
      resourceType: 'document',
      resourceId: 'doc-1',
      accessMode: 'readonly',
      channel: 'link',
      settings: { viewMode: 'doc' },
    });
    expect(requireCapability).toHaveBeenCalledWith('share');
    expect(link.settings).toEqual({ viewMode: 'doc' });
    expect(recordOrgEvent).not.toHaveBeenCalled();
  });

  it('revokes and inserts when options differ; records event', async () => {
    fromMock
      .mockReturnValueOnce(chain({ data: { ...existingRow, expires_at: 'old' }, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: null })) // revoke update
      .mockReturnValueOnce(
        chain({
          data: { ...existingRow, id: 'sl2', token: '123e4567e89b12d3a456426614174000' },
          error: null,
        }),
      );

    const link = await createOrUpdateShareLink({
      resourceType: 'document',
      resourceId: 'doc-1',
      accessMode: 'readonly',
      expiresAt: null,
      requiresAuth: true,
    });
    expect(link.id).toBe('sl2');
    expect(recordOrgEvent).toHaveBeenCalledWith(
      'share_link_created',
      expect.objectContaining({ resourceId: 'doc-1' }),
    );
  });

  it('requires embed capability for embed channel', async () => {
    fromMock
      .mockReturnValueOnce(chain({ data: null, error: null }))
      .mockReturnValueOnce(chain({ data: existingRow, error: null }));
    await createOrUpdateShareLink({
      resourceType: 'document',
      resourceId: 'doc-1',
      accessMode: 'editable',
      channel: 'embed',
    });
    expect(requireCapability).toHaveBeenCalledWith('embed');
  });

  it('revokeShareLink and listShareLinksForResource use rpc', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });
    await revokeShareLink('sl1');
    expect(rpcMock).toHaveBeenCalledWith('revoke_share_link', { p_id: 'sl1' });

    rpcMock.mockResolvedValueOnce({
      data: [
        {
          id: 'sl1',
          token: 't',
          organizationId: 'org-1',
          resourceType: 'document',
          resourceId: 'doc-1',
          accessMode: 'readonly',
          channel: 'embed',
          settings: {},
          requiresAuth: false,
          expiresAt: null,
          revokedAt: null,
          createdBy: 'u',
          createdAt: 'c',
          updatedAt: 'u',
        },
      ],
      error: null,
    });
    const links = await listShareLinksForResource('document', 'doc-1');
    expect(links[0]?.channel).toBe('embed');

    rpcMock.mockResolvedValueOnce({ data: null, error: null });
    await expect(listShareLinksForResource('document', 'doc-1')).resolves.toEqual([]);
  });
});
