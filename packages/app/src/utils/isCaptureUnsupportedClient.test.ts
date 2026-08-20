import { afterEach, describe, expect, it, vi } from 'vitest';
import { isCaptureUnsupportedClient } from './isCaptureUnsupportedClient';

describe('isCaptureUnsupportedClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false when window or navigator is missing', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('navigator', undefined);
    expect(isCaptureUnsupportedClient()).toBe(false);
  });

  it('returns true when userAgentData.mobile is true', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('navigator', {
      userAgentData: { mobile: true },
      userAgent: 'Mozilla/5.0',
    });
    expect(isCaptureUnsupportedClient()).toBe(true);
  });

  it('detects mobile UA tokens', () => {
    vi.stubGlobal('window', {});
    for (const ua of [
      'Mozilla/5.0 (Linux; Android 13)',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17)',
      'Mozilla/5.0 (iPad; CPU OS 16)',
      'Something Mobile Safari',
    ]) {
      vi.stubGlobal('navigator', { userAgent: ua });
      expect(isCaptureUnsupportedClient()).toBe(true);
    }
  });

  it('returns false for desktop Chrome UA', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('navigator', {
      userAgentData: { mobile: false },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0',
    });
    expect(isCaptureUnsupportedClient()).toBe(false);
  });
});
