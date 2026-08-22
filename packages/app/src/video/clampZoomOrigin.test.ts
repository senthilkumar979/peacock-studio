import { describe, expect, it } from 'vitest';
import { clampZoomOrigin, normalizeUnitPercent } from './clampZoomOrigin';

describe('normalizeUnitPercent', () => {
  it('keeps 0–1 values', () => {
    expect(normalizeUnitPercent(0.2)).toBe(0.2);
    expect(normalizeUnitPercent(1)).toBe(1);
    expect(normalizeUnitPercent(0)).toBe(0);
  });

  it('converts 0–100 values', () => {
    expect(normalizeUnitPercent(20)).toBe(0.2);
    expect(normalizeUnitPercent(100)).toBe(1);
  });

  it('clamps invalid numbers', () => {
    expect(normalizeUnitPercent(-4)).toBe(0);
    expect(normalizeUnitPercent(Number.NaN)).toBe(0);
  });
});

describe('clampZoomOrigin', () => {
  it('keeps a centered marker', () => {
    expect(clampZoomOrigin(0.5, 0.4)).toEqual({ x: 0.5, y: 0.4 });
  });

  it('clamps edge clicks so zoom does not reveal empty canvas', () => {
    expect(clampZoomOrigin(0, 0)).toEqual({ x: 0.15, y: 0.15 });
    expect(clampZoomOrigin(1, 1)).toEqual({ x: 0.85, y: 0.85 });
  });

  it('normalizes 0–100 percents before clamping', () => {
    expect(clampZoomOrigin(20, 80)).toEqual({ x: 0.2, y: 0.8 });
  });
});
