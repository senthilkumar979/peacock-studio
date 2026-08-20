import { afterEach, describe, expect, it, vi } from 'vitest';

describe('analytics config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('reads PostHog key and defaults the EU host', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', ' phc_test ');
    vi.stubEnv('VITE_POSTHOG_HOST', '');
    const { getPostHogHost, getPostHogKey, isPostHogConfigured } = await import('./config');

    expect(getPostHogKey()).toBe('phc_test');
    expect(isPostHogConfigured()).toBe(true);
    expect(getPostHogHost()).toBe('https://eu.i.posthog.com');
  });

  it('treats blank PostHog key as unconfigured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '   ');
    const { getPostHogKey, isPostHogConfigured } = await import('./config');
    expect(getPostHogKey()).toBeUndefined();
    expect(isPostHogConfigured()).toBe(false);
  });

  it('reads Sentry DSN helpers', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', ' https://dsn.example/1 ');
    const { getSentryDsn, isSentryConfigured } = await import('./config');
    expect(getSentryDsn()).toBe('https://dsn.example/1');
    expect(isSentryConfigured()).toBe(true);
  });

  it('defaults Freshchat script and allows explicit disable', async () => {
    vi.stubEnv('VITE_FRESHCHAT_SCRIPT_SRC', '');
    let mod = await import('./config');
    expect(mod.getFreshchatConfig()).toBeUndefined();

    vi.resetModules();
    vi.stubEnv('VITE_FRESHCHAT_SCRIPT_SRC', 'https://cdn.example/chat.js');
    mod = await import('./config');
    expect(mod.getFreshchatConfig()).toEqual({
      scriptSrc: 'https://cdn.example/chat.js',
    });

    vi.resetModules();
    vi.unstubAllEnvs();
    mod = await import('./config');
    expect(mod.getFreshchatConfig()?.scriptSrc).toContain('fw-cdn.com');
  });
});
