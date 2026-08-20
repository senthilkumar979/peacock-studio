import { afterEach, describe, expect, it, vi } from 'vitest';
import { getEmbedHostDomain, getReferrerDomain, getUtmParams } from './referrer';

describe('getReferrerDomain', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when document is missing or referrer empty', () => {
    vi.stubGlobal('document', undefined);
    expect(getReferrerDomain()).toBeNull();

    vi.stubGlobal('document', { referrer: '' });
    expect(getReferrerDomain()).toBeNull();
  });

  it('returns null for same-origin referrers', () => {
    vi.stubGlobal('document', { referrer: 'https://peacock.test/pricing' });
    vi.stubGlobal('window', { location: { hostname: 'peacock.test' } });
    expect(getReferrerDomain()).toBeNull();
  });

  it('returns hostname for external referrers', () => {
    vi.stubGlobal('document', { referrer: 'https://google.com/search' });
    vi.stubGlobal('window', { location: { hostname: 'peacock.test' } });
    expect(getReferrerDomain()).toBe('google.com');
  });

  it('returns null for invalid referrer URLs', () => {
    vi.stubGlobal('document', { referrer: 'not a url' });
    vi.stubGlobal('window', { location: { hostname: 'peacock.test' } });
    expect(getReferrerDomain()).toBeNull();
  });
});

describe('getEmbedHostDomain', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when window is missing', () => {
    vi.stubGlobal('window', undefined);
    expect(getEmbedHostDomain()).toBeNull();
  });

  it('prefers ancestorOrigins top host when different from self', () => {
    vi.stubGlobal('window', {
      location: {
        hostname: 'peacock.test',
        ancestorOrigins: {
          length: 2,
          0: 'https://mid.example',
          1: 'https://parent.example',
          [Symbol.iterator]: function* () {
            yield 'https://mid.example';
            yield 'https://parent.example';
          },
        },
      },
    });
    expect(getEmbedHostDomain()).toBe('parent.example');
  });

  it('falls back to referrer when ancestorOrigins unavailable', () => {
    vi.stubGlobal('window', {
      location: { hostname: 'peacock.test', ancestorOrigins: undefined },
    });
    vi.stubGlobal('document', { referrer: 'https://embedder.io/page' });
    expect(getEmbedHostDomain()).toBe('embedder.io');
  });

  it('ignores same-host ancestors and falls through', () => {
    vi.stubGlobal('window', {
      location: {
        hostname: 'peacock.test',
        ancestorOrigins: {
          length: 1,
          0: 'https://peacock.test/embed',
          [Symbol.iterator]: function* () {
            yield 'https://peacock.test/embed';
          },
        },
      },
    });
    vi.stubGlobal('document', { referrer: '' });
    expect(getEmbedHostDomain()).toBeNull();
  });
});

describe('getUtmParams', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns empty object when window is missing', () => {
    vi.stubGlobal('window', undefined);
    expect(getUtmParams()).toEqual({});
  });

  it('collects non-empty utm_ params lowercased', () => {
    vi.stubGlobal('window', {
      location: { search: '?UTM_Source=LinkedIn&utm_medium=social&utm_campaign=&other=1' },
    });
    expect(getUtmParams()).toEqual({
      utm_source: 'LinkedIn',
      utm_medium: 'social',
    });
  });
});
