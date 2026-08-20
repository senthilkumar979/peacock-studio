import { describe, expect, it } from 'vitest';
import { formatFlowDate } from './formatFlowDate';

describe('formatFlowDate', () => {
  it('formats a timestamp with medium date and short time', () => {
    const formatted = formatFlowDate(Date.UTC(2025, 0, 2, 9, 5));
    expect(formatted).toMatch(/2025|Jan|2/);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('formats epoch zero', () => {
    expect(formatFlowDate(0)).toEqual(expect.any(String));
  });
});
