import { afterEach, describe, expect, it } from 'vitest';
import {
  ACQUISITION_STORAGE_KEY,
  buildAcquisitionContext,
  captureAcquisitionContext,
  readAcquisitionContext,
  toAcquisitionTraits,
} from './acquisitionContext';

describe('buildAcquisitionContext', () => {
  it('prefers utm_source over referrer', () => {
    const context = buildAcquisitionContext({
      utmParams: { utm_source: 'linkedin', utm_medium: 'social', utm_campaign: 'launch' },
      referrerDomain: 'google.com',
      landingPath: '/',
      capturedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(context.acquisition_source).toBe('linkedin');
    expect(context.acquisition_medium).toBe('social');
    expect(context.acquisition_campaign).toBe('launch');
    expect(context.initial_referrer_domain).toBe('google.com');
    expect(context.initial_landing_path).toBe('/');
    expect(context.initial_landing_at).toBe('2026-01-01T00:00:00.000Z');
  });

  it('falls back to referrer hostname when utm_source is absent', () => {
    const context = buildAcquisitionContext({
      utmParams: {},
      referrerDomain: 'medium.com',
      landingPath: '/pricing',
    });

    expect(context.acquisition_source).toBe('medium.com');
    expect(context.acquisition_medium).toBeNull();
  });

  it('marks direct traffic when no utm or referrer', () => {
    const context = buildAcquisitionContext({
      utmParams: {},
      referrerDomain: null,
      landingPath: '/dashboard',
    });

    expect(context.acquisition_source).toBe('direct');
    expect(context.initial_referrer_domain).toBeNull();
  });
});

describe('toAcquisitionTraits', () => {
  it('returns empty object when context is null', () => {
    expect(toAcquisitionTraits(null)).toEqual({});
  });

  it('returns a copy of context fields when present', () => {
    const context = buildAcquisitionContext({
      utmParams: { utm_source: 'whatsapp', utm_medium: 'messaging' },
      referrerDomain: null,
      landingPath: '/',
    });

    expect(toAcquisitionTraits(context)).toEqual(context);
  });
});

describe('captureAcquisitionContext', () => {
  const storage = new Map<string, string>();
  const sessionStorageMock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => storage.clear(),
    key: () => null,
    length: 0,
  };

  afterEach(() => {
    storage.clear();
  });

  it('persists first-touch context and does not overwrite on second call', () => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: { pathname: '/', hostname: 'peacock.test', search: '?utm_source=linkedin' },
        sessionStorage: sessionStorageMock,
      },
      configurable: true,
    });

    Object.defineProperty(globalThis, 'document', {
      value: { referrer: '' },
      configurable: true,
    });

    const first = captureAcquisitionContext();
    expect(first?.acquisition_source).toBe('linkedin');

    window.location.search = '?utm_source=whatsapp';
    const second = captureAcquisitionContext();
    expect(second?.acquisition_source).toBe('linkedin');
    expect(readAcquisitionContext()?.acquisition_source).toBe('linkedin');
    expect(storage.has(ACQUISITION_STORAGE_KEY)).toBe(true);
  });
});
