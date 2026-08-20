import { afterEach, describe, expect, it, vi } from 'vitest';

describe('turnstile helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    delete window.turnstile;
    document.head.querySelectorAll('script').forEach((node) => node.remove());
  });

  it('bypasses when site key unset', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '');
    const { getTurnstileSiteKey, isTurnstileConfigured, getTurnstileToken } = await import(
      './turnstile'
    );
    expect(getTurnstileSiteKey()).toBeUndefined();
    expect(isTurnstileConfigured()).toBe(false);
    await expect(getTurnstileToken('invite')).resolves.toBe('dev-bypass:invite');
  });

  it('renders invisible widget when configured', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'site-key');
    window.turnstile = {
      render: vi.fn((_host, options) => {
        queueMicrotask(() => options.callback?.('token-123'));
        return 'widget-1';
      }),
      execute: vi.fn(),
      reset: vi.fn(),
      remove: vi.fn(),
    };

    const { getTurnstileToken, isTurnstileConfigured } = await import('./turnstile');
    expect(isTurnstileConfigured()).toBe(true);
    await expect(getTurnstileToken('share')).resolves.toBe('token-123');
    expect(window.turnstile.render).toHaveBeenCalled();
    expect(window.turnstile.execute).toHaveBeenCalledWith('widget-1');
    expect(window.turnstile.remove).toHaveBeenCalledWith('widget-1');
  });
});
