import { afterEach, describe, expect, it, vi } from 'vitest';
import { createConsoleSink } from './consoleSink';

describe('createConsoleSink', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes the AnalyticsSink surface', () => {
    const sink = createConsoleSink();
    expect(sink).toEqual(
      expect.objectContaining({
        init: expect.any(Function),
        shutdown: expect.any(Function),
        track: expect.any(Function),
        page: expect.any(Function),
        captureException: expect.any(Function),
        identify: expect.any(Function),
        group: expect.any(Function),
        registerSuperProperties: expect.any(Function),
        reset: expect.any(Function),
      }),
    );
  });

  it('logs in development when methods are called', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const sink = createConsoleSink();

    sink.init();
    sink.track('evt', { a: 1 });
    sink.page('/pricing');
    sink.captureException?.(new Error('boom'), { code: 'x' });
    sink.identify?.('user-1', { plan: 'free' });
    sink.group?.('organization', 'org-1', { name: 'Acme' });
    sink.registerSuperProperties?.({ source: 'linkedin' });
    sink.reset?.();
    sink.shutdown();

    if (import.meta.env.DEV) {
      expect(info).toHaveBeenCalled();
      expect(info.mock.calls.some((call) => String(call[0]).includes('[analytics]'))).toBe(
        true,
      );
    } else {
      expect(info).not.toHaveBeenCalled();
    }
  });
});
