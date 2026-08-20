import { describe, expect, it } from 'vitest';
import { formatBytes } from './formatBytes';

describe('formatBytes', () => {
  it('returns bytes for values under 1024', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('clamps negatives and non-numeric to zero', () => {
    expect(formatBytes(-10)).toBe('0 B');
    expect(formatBytes(Number.NaN)).toBe('0 B');
  });

  it('formats KB with zero decimals when size >= 100', () => {
    expect(formatBytes(100 * 1024)).toBe('100 KB');
  });

  it('uses zero decimals for KB (unitIndex 0)', () => {
    expect(formatBytes(15 * 1024)).toBe('15 KB');
    expect(formatBytes(1.5 * 1024)).toBe('2 KB');
  });

  it('formats MB with one or two decimals by magnitude', () => {
    expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.50 MB');
    expect(formatBytes(15.25 * 1024 * 1024)).toBe('15.3 MB');
  });

  it('formats GB', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
  });

  it('caps at TB unit', () => {
    const twoTb = 2 * 1024 ** 4;
    expect(formatBytes(twoTb)).toBe('2.00 TB');
  });
});
