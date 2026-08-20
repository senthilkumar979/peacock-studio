import { beforeEach, describe, expect, it, vi } from 'vitest';

const createClient = vi.fn(() => ({ kind: 'anon' }));
const getSupabaseUrl = vi.fn(() => 'https://x.supabase.co');
const getSupabaseAnonKey = vi.fn(() => 'anon');

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => (createClient as any)(...args),
}));

vi.mock('@/cloud/config', () => ({
  getSupabaseUrl: () => getSupabaseUrl(),
  getSupabaseAnonKey: () => getSupabaseAnonKey(),
}));

describe('publicSupabaseClient', () => {
  beforeEach(() => {
    vi.resetModules();
    createClient.mockClear();
  });

  it('creates and caches anon client', async () => {
    const { getPublicSupabaseClient } = await import('./publicSupabaseClient');
    const a = getPublicSupabaseClient();
    const b = getPublicSupabaseClient();
    expect(a).toBe(b);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith('https://x.supabase.co', 'anon');
  });
});
