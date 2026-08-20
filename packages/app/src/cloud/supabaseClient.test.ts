import { beforeEach, describe, expect, it, vi } from 'vitest';

const createClient = vi.fn(() => ({ kind: 'client' }));
const requireCloudAuthSession = vi.fn();
const getSupabaseUrl = vi.fn(() => 'https://x.supabase.co');
const getSupabaseAnonKey = vi.fn(() => 'anon');

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => (createClient as any)(...args),
}));

vi.mock('@/cloud/config', () => ({
  getSupabaseUrl: () => getSupabaseUrl(),
  getSupabaseAnonKey: () => getSupabaseAnonKey(),
}));

vi.mock('@/cloud/authContext', () => ({
  requireCloudAuthSession: () => requireCloudAuthSession(),
}));

describe('supabaseClient', () => {
  beforeEach(() => {
    vi.resetModules();
    createClient.mockClear();
    requireCloudAuthSession.mockReturnValue({
      clerkUserId: 'user-1',
      getAccessToken: async () => 'tok',
    });
  });

  it('createAuthenticatedSupabaseClient passes url/key/accessToken', async () => {
    const { createAuthenticatedSupabaseClient } = await import('./supabaseClient');
    const getAccessToken = async () => 'tok';
    createAuthenticatedSupabaseClient(getAccessToken);
    expect(createClient).toHaveBeenCalledWith('https://x.supabase.co', 'anon', {
      accessToken: getAccessToken,
    });
  });

  it('caches client per clerk user and resets', async () => {
    const {
      getAuthenticatedSupabaseClient,
      resetSupabaseClientCache,
    } = await import('./supabaseClient');

    const first = getAuthenticatedSupabaseClient();
    const second = getAuthenticatedSupabaseClient();
    expect(first).toBe(second);
    expect(createClient).toHaveBeenCalledTimes(1);

    requireCloudAuthSession.mockReturnValue({
      clerkUserId: 'user-2',
      getAccessToken: async () => 'tok2',
    });
    const third = getAuthenticatedSupabaseClient();
    expect(third).not.toBe(first);
    expect(createClient).toHaveBeenCalledTimes(2);

    resetSupabaseClientCache();
    getAuthenticatedSupabaseClient();
    expect(createClient).toHaveBeenCalledTimes(3);
  });
});
