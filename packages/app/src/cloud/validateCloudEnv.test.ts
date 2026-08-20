import { afterEach, describe, expect, it, vi } from 'vitest';

describe('validateCloudEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function load() {
    return import('./validateCloudEnv');
  }

  function stubValid() {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_abc');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_xyz');
  }

  it('rejects leaked VITE_CLERK_SECRET_KEY', async () => {
    stubValid();
    vi.stubEnv('VITE_CLERK_SECRET_KEY', 'sk_test');
    const { getCloudEnvValidationError } = await load();
    expect(getCloudEnvValidationError()).toMatch(/VITE_CLERK_SECRET_KEY/);
  });

  it('rejects leaked VITE_SUPER_ADMIN* keys', async () => {
    stubValid();
    vi.stubEnv('VITE_SUPER_ADMIN_EMAILS', 'a@b.com');
    const { getCloudEnvValidationError } = await load();
    expect(getCloudEnvValidationError()).toMatch(/VITE_SUPER_ADMIN/);
  });

  it('validates clerk key presence, quotes, and prefix', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_x');
    expect((await load()).getCloudEnvValidationError()).toMatch(/missing/);

    vi.resetModules();
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '"pk_test_x"');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_x');
    expect((await load()).getCloudEnvValidationError()).toMatch(/quotes/);

    vi.resetModules();
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'sk_test_x');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_x');
    expect((await load()).getCloudEnvValidationError()).toMatch(/pk_test_/);
  });

  it('validates supabase url presence, quotes, and shape', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_live_x');
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJabc');
    expect((await load()).getCloudEnvValidationError()).toMatch(/VITE_SUPABASE_URL is missing/);

    vi.resetModules();
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_live_x');
    vi.stubEnv('VITE_SUPABASE_URL', "'https://abc.supabase.co'");
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJabc');
    expect((await load()).getCloudEnvValidationError()).toMatch(/quotes around VITE_SUPABASE_URL/);

    vi.resetModules();
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_live_x');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co/rest/v1');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJabc');
    expect((await load()).getCloudEnvValidationError()).toMatch(/must look like/);
  });

  it('validates anon key presence, quotes, secret, and format', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_x');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    expect((await load()).getCloudEnvValidationError()).toMatch(/ANON_KEY is missing/);

    vi.resetModules();
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_x');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '"eyJabc"');
    expect((await load()).getCloudEnvValidationError()).toMatch(/quotes around VITE_SUPABASE_ANON_KEY/);

    vi.resetModules();
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_x');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_secret_x');
    expect((await load()).getCloudEnvValidationError()).toMatch(/Never use the Supabase secret/);

    vi.resetModules();
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_x');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'not-a-key');
    expect((await load()).getCloudEnvValidationError()).toMatch(/publishable key/);
  });

  it('returns null for valid publishable and legacy JWT keys', async () => {
    stubValid();
    expect((await load()).getCloudEnvValidationError()).toBeNull();

    vi.resetModules();
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_x');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co/');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJlegacy');
    expect((await load()).getCloudEnvValidationError()).toBeNull();
  });
});
