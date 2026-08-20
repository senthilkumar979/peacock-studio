import { afterEach, describe, expect, it, vi } from 'vitest';
import { isMobileClient } from './isMobileClient';

describe('isMobileClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false when window or navigator is missing', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('navigator', undefined);
    expect(isMobileClient()).toBe(false);
  });

  it('returns true when userAgentData.mobile is true', () => {
    vi.stubGlobal('navigator', { userAgentData: { mobile: true } });
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
    });
    expect(isMobileClient()).toBe(true);
  });

  it('returns true for coarse pointer', () => {
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('window', {
      matchMedia: (query: string) => ({
        matches: query === '(pointer: coarse)',
      }),
    });
    expect(isMobileClient()).toBe(true);
  });

  it('returns true for narrow viewport', () => {
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('window', {
      matchMedia: (query: string) => ({
        matches: query === '(max-width: 767px)',
      }),
    });
    expect(isMobileClient()).toBe(true);
  });

  it('returns false when matchMedia throws and no mobile hint', () => {
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('window', {
      matchMedia: () => {
        throw new Error('unsupported');
      },
    });
    expect(isMobileClient()).toBe(false);
  });

  it('returns false for desktop without mobile signals', () => {
    vi.stubGlobal('navigator', { userAgentData: { mobile: false } });
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
    });
    expect(isMobileClient()).toBe(false);
  });
});
