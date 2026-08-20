import { afterEach, describe, expect, it, vi } from 'vitest';

describe('planLimits', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function load() {
    return import('./planLimits');
  }

  it('returns defaults when env missing or invalid', async () => {
    vi.stubEnv('VITE_GUEST_VISIBLE_DOC_LIMIT', '');
    vi.stubEnv('VITE_FREE_ACCOUNT_DOC_LIMIT', '0');
    vi.stubEnv('VITE_FREE_ACCOUNT_STORAGE_BYTES_LIMIT', 'nope');
    const mod = await load();
    expect(mod.getGuestVisibleDocLimit()).toBe(3);
    expect(mod.getFreeAccountDocLimit()).toBe(10);
    expect(mod.getFreeAccountStorageBytesLimit()).toBe(104_857_600);
  });

  it('parses positive integer env overrides', async () => {
    vi.stubEnv('VITE_GUEST_VISIBLE_DOC_LIMIT', '5');
    vi.stubEnv('VITE_FREE_ACCOUNT_DOC_LIMIT', '25');
    vi.stubEnv('VITE_FREE_ACCOUNT_STORAGE_BYTES_LIMIT', '2048');
    const mod = await load();
    expect(mod.getGuestVisibleDocLimit()).toBe(5);
    expect(mod.getFreeAccountDocLimit()).toBe(25);
    expect(mod.getFreeAccountStorageBytesLimit()).toBe(2048);
  });

  it('shouldShowEmbedWatermark hides for paid plans only', async () => {
    const { shouldShowEmbedWatermark } = await load();
    expect(shouldShowEmbedWatermark(null)).toBe(true);
    expect(shouldShowEmbedWatermark('free')).toBe(true);
    expect(shouldShowEmbedWatermark(' Pro ')).toBe(false);
    expect(shouldShowEmbedWatermark('TEAM')).toBe(false);
    expect(shouldShowEmbedWatermark('enterprise')).toBe(true);
  });
});
