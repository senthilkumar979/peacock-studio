import { describe, expect, it } from 'vitest';
import { denormalizePosition, getViewport, normalizePosition } from './coordinates';

describe('coordinates', () => {
  it('normalizes position to 0–1 range', () => {
    const result = normalizePosition(100, 50, { width: 200, height: 400 });

    expect(result.xPercent).toBe(0.5);
    expect(result.yPercent).toBe(0.125);
  });

  it('denormalizes position to rendered pixels', () => {
    const result = denormalizePosition(0.5, 0.25, 800, 600);

    expect(result.left).toBe(400);
    expect(result.top).toBe(150);
  });

  it('returns zero percents when viewport has zero dimension', () => {
    const result = normalizePosition(10, 20, { width: 0, height: 0 });

    expect(result.xPercent).toBe(0);
    expect(result.yPercent).toBe(0);
  });

  it('reads viewport metrics from window', () => {
    const viewport = getViewport();
    expect(viewport.width).toBe(window.innerWidth);
    expect(viewport.height).toBe(window.innerHeight);
    expect(viewport.dpr).toBe(window.devicePixelRatio);
  });
});
