import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkSupabase } from './checkSupabase';

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: vi.fn(() => false),
}));

vi.mock('@/cloud/authContext', () => ({
  getCloudAuthContext: vi.fn(() => null),
  isCloudLibraryActive: vi.fn(() => false),
}));

vi.mock('@/cloud/sessionState', () => ({
  getSessionModeSnapshot: vi.fn(() => 'guest'),
}));

vi.mock('@/cloud/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: vi.fn(),
}));

import { isCloudSyncEnabled } from '@/cloud/config';
import { getCloudAuthContext, isCloudLibraryActive } from '@/cloud/authContext';
import { getSessionModeSnapshot } from '@/cloud/sessionState';
import { getAuthenticatedSupabaseClient } from '@/cloud/supabaseClient';

describe('checkSupabase', () => {
  beforeEach(() => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(false);
    vi.mocked(getSessionModeSnapshot).mockReturnValue('guest');
    vi.mocked(isCloudLibraryActive).mockReturnValue(false);
    vi.mocked(getCloudAuthContext).mockReturnValue(null);
    vi.mocked(getAuthenticatedSupabaseClient).mockReset();
  });

  it('skips when cloud sync is disabled', async () => {
    await expect(checkSupabase()).resolves.toMatchObject({
      id: 'supabase',
      status: 'skip',
      detail: expect.stringContaining('cloud sync is not fully enabled'),
    });
  });

  it('skips when session is not cloud library active', async () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    await expect(checkSupabase()).resolves.toMatchObject({
      status: 'skip',
      detail: expect.stringContaining('sign in'),
    });
  });

  it('warns when org id is missing', async () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    vi.mocked(getSessionModeSnapshot).mockReturnValue('cloud');
    vi.mocked(isCloudLibraryActive).mockReturnValue(true);
    vi.mocked(getAuthenticatedSupabaseClient).mockReturnValue({
      from: vi.fn(),
    } as never);
    vi.mocked(getCloudAuthContext).mockReturnValue({ organizationId: null } as never);

    await expect(checkSupabase()).resolves.toMatchObject({
      status: 'warn',
      detail: 'No active organization id in auth context.',
    });
  });

  it('fails when query returns error', async () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    vi.mocked(getSessionModeSnapshot).mockReturnValue('cloud');
    vi.mocked(isCloudLibraryActive).mockReturnValue(true);
    vi.mocked(getCloudAuthContext).mockReturnValue({ organizationId: 'org_1' } as never);
    vi.mocked(getAuthenticatedSupabaseClient).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            limit: async () => ({ error: { message: 'RLS denied' } }),
          }),
        }),
      }),
    } as never);

    await expect(checkSupabase()).resolves.toMatchObject({
      status: 'fail',
      detail: 'RLS denied',
    });
  });

  it('passes when organizations query succeeds', async () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    vi.mocked(getSessionModeSnapshot).mockReturnValue('cloud');
    vi.mocked(isCloudLibraryActive).mockReturnValue(true);
    vi.mocked(getCloudAuthContext).mockReturnValue({ organizationId: 'org_1' } as never);
    vi.mocked(getAuthenticatedSupabaseClient).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            limit: async () => ({ error: null }),
          }),
        }),
      }),
    } as never);

    await expect(checkSupabase()).resolves.toMatchObject({
      status: 'pass',
      detail: expect.stringContaining('succeeded'),
    });
  });

  it('fails when client throws', async () => {
    vi.mocked(isCloudSyncEnabled).mockReturnValue(true);
    vi.mocked(getSessionModeSnapshot).mockReturnValue('cloud');
    vi.mocked(isCloudLibraryActive).mockReturnValue(true);
    vi.mocked(getAuthenticatedSupabaseClient).mockImplementation(() => {
      throw new Error('No token');
    });

    await expect(checkSupabase()).resolves.toMatchObject({
      status: 'fail',
      detail: 'No token',
    });
  });
});
