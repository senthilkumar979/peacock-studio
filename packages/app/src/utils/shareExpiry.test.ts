import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SHARE_EXPIRY_PRESETS, expiresAtFromPreset } from './shareExpiry';

describe('expiresAtFromPreset', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exposes never / 7d / 30d / 90d presets', () => {
    expect(SHARE_EXPIRY_PRESETS.map((p) => p.id)).toEqual(['never', '7d', '30d', '90d']);
  });

  it('returns null for never', () => {
    expect(expiresAtFromPreset('never')).toBeNull();
  });

  it('adds days in UTC for timed presets', () => {
    expect(expiresAtFromPreset('7d')).toBe('2026-01-17T12:00:00.000Z');
    expect(expiresAtFromPreset('30d')).toBe('2026-02-09T12:00:00.000Z');
    expect(expiresAtFromPreset('90d')).toBe('2026-04-10T12:00:00.000Z');
  });
});
