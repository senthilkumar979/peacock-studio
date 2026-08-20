import { beforeEach, describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();
const requireCloudAuthSession = vi.fn(() => ({ clerkUserId: 'u' }));

vi.mock('@/cloud/authContext', () => ({
  requireCloudAuthSession: () => requireCloudAuthSession(),
}));

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: () => ({ from: fromMock }),
}));

import {
  fetchDisplayNamesByEmail,
  fetchProfilesByClerkUserIds,
  upsertUserProfile,
} from './profileRepository';

function chain(result: { data?: unknown; error?: unknown }) {
  const api: Record<string, unknown> = {};
  for (const method of ['upsert', 'select', 'single', 'in'] as const) {
    api[method] = vi.fn(() => api);
  }
  (api as { then?: unknown }).then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled);
  return api;
}

describe('profileRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireCloudAuthSession.mockImplementation(() => ({ clerkUserId: 'u' }));
  });

  it('upsertUserProfile normalizes email and display name', async () => {
    const api = chain({
      data: {
        email: 'a@b.com',
        clerk_user_id: 'u1',
        display_name: 'Ada',
        first_name: 'Ada',
        last_name: 'Lovelace',
      },
      error: null,
    });
    fromMock.mockReturnValue(api);

    const profile = await upsertUserProfile({
      email: ' A@B.COM ',
      clerkUserId: 'u1',
      displayName: '  ',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    expect(profile).toMatchObject({ email: 'a@b.com', displayName: 'Ada' });
    expect(api.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.com', display_name: 'Ada Lovelace' }),
      { onConflict: 'email' },
    );
  });

  it('fetchProfilesByClerkUserIds returns empty for no ids or inactive session', async () => {
    await expect(fetchProfilesByClerkUserIds([])).resolves.toEqual({});
    requireCloudAuthSession.mockImplementation(() => {
      throw new Error('no session');
    });
    await expect(fetchProfilesByClerkUserIds(['u1'])).resolves.toEqual({});
  });

  it('fetchProfilesByClerkUserIds maps rows', async () => {
    fromMock.mockReturnValue(
      chain({
        data: [
          {
            email: 'a@b.com',
            clerk_user_id: 'u1',
            display_name: 'Ada',
            first_name: 'Ada',
            last_name: null,
          },
        ],
        error: null,
      }),
    );
    await expect(fetchProfilesByClerkUserIds(['u1', 'u1', null])).resolves.toEqual({
      u1: expect.objectContaining({ displayName: 'Ada' }),
    });
  });

  it('fetchDisplayNamesByEmail maps emails', async () => {
    fromMock.mockReturnValue(
      chain({ data: [{ email: 'a@b.com', display_name: 'Ada' }], error: null }),
    );
    await expect(fetchDisplayNamesByEmail([' A@B.COM ', ''])).resolves.toEqual({
      'a@b.com': 'Ada',
    });
  });
});
