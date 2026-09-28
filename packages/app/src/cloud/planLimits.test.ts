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
    const mod = await load();
    expect(mod.getGuestVisibleDocLimit()).toBe(3);
  });

  it('parses positive integer env overrides', async () => {
    vi.stubEnv('VITE_GUEST_VISIBLE_DOC_LIMIT', '5');
    const mod = await load();
    expect(mod.getGuestVisibleDocLimit()).toBe(5);
  });

  it('keeps embed attribution consistent for every account', async () => {
    const { shouldShowEmbedWatermark } = await load();
    expect(shouldShowEmbedWatermark(null)).toBe(true);
    expect(shouldShowEmbedWatermark('free')).toBe(true);
    expect(shouldShowEmbedWatermark(' Pro ')).toBe(true);
    expect(shouldShowEmbedWatermark('TEAM')).toBe(true);
    expect(shouldShowEmbedWatermark('enterprise')).toBe(true);
  });
});
