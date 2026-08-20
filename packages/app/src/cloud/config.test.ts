import { afterEach, describe, expect, it, vi } from 'vitest';

describe('cloud/config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function load() {
    return import('./config');
  }

  it('isCloudSyncFlagEnabled accepts truthy flag values', async () => {
    for (const value of ['1', 'true', 'YES', ' On ']) {
      vi.resetModules();
      vi.stubEnv('VITE_CLOUD_SYNC', value);
      const { isCloudSyncFlagEnabled } = await load();
      expect(isCloudSyncFlagEnabled()).toBe(true);
    }
  });

  it('isCloudSyncFlagEnabled rejects empty/falsy flag', async () => {
    vi.stubEnv('VITE_CLOUD_SYNC', '');
    const { isCloudSyncFlagEnabled } = await load();
    expect(isCloudSyncFlagEnabled()).toBe(false);

    vi.resetModules();
    vi.stubEnv('VITE_CLOUD_SYNC', 'false');
    const again = await load();
    expect(again.isCloudSyncFlagEnabled()).toBe(false);
  });

  it('isCloudSyncEnabled requires flag and all three keys', async () => {
    vi.stubEnv('VITE_CLOUD_SYNC', 'true');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_x');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon');
    const { isCloudSyncEnabled } = await load();
    expect(isCloudSyncEnabled()).toBe(true);

    vi.resetModules();
    vi.stubEnv('VITE_CLOUD_SYNC', 'true');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon');
    const missing = await load();
    expect(missing.isCloudSyncEnabled()).toBe(false);
  });

  it('getCloudSyncMissingConfigMessage lists missing vars when flag on', async () => {
    vi.stubEnv('VITE_CLOUD_SYNC', 'true');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '');
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    const { getCloudSyncMissingConfigMessage } = await load();
    const message = getCloudSyncMissingConfigMessage();
    expect(message).toContain('VITE_CLERK_PUBLISHABLE_KEY');
    expect(message).toContain('VITE_SUPABASE_URL');
    expect(message).toContain('VITE_SUPABASE_ANON_KEY');
  });

  it('getCloudSyncMissingConfigMessage returns null when complete or flag off', async () => {
    vi.stubEnv('VITE_CLOUD_SYNC', '');
    const off = await load();
    expect(off.getCloudSyncMissingConfigMessage()).toBeNull();

    vi.resetModules();
    vi.stubEnv('VITE_CLOUD_SYNC', 'true');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon');
    const on = await load();
    expect(on.getCloudSyncMissingConfigMessage()).toBeNull();
  });

  it('getClerkPublishableKey trims and returns undefined when empty', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '  pk_test  ');
    const { getClerkPublishableKey } = await load();
    expect(getClerkPublishableKey()).toBe('pk_test');

    vi.resetModules();
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '   ');
    const empty = await load();
    expect(empty.getClerkPublishableKey()).toBeUndefined();
  });

  it('getSupabaseUrl and getSupabaseAnonKey throw when missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    const mod = await load();
    expect(() => mod.getSupabaseUrl()).toThrow(/VITE_SUPABASE_URL/);
    expect(() => mod.getSupabaseAnonKey()).toThrow(/VITE_SUPABASE_ANON_KEY/);
  });

  it('getSupabaseUrl and getSupabaseAnonKey return trimmed values', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', ' https://proj.supabase.co ');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', ' anon-key ');
    const { getSupabaseUrl, getSupabaseAnonKey, SCREENSHOTS_BUCKET, SIGNED_URL_TTL_SECONDS } =
      await load();
    expect(getSupabaseUrl()).toBe('https://proj.supabase.co');
    expect(getSupabaseAnonKey()).toBe('anon-key');
    expect(SCREENSHOTS_BUCKET).toBe('screenshots');
    expect(SIGNED_URL_TTL_SECONDS).toBe(3600);
  });
});
