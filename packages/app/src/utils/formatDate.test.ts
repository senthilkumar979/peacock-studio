import { describe, expect, it } from 'vitest';
import { formatDocumentDate } from './formatDate';

describe('formatDocumentDate', () => {
  it('formats a timestamp with medium date and short time', () => {
    const formatted = formatDocumentDate(Date.UTC(2024, 5, 15, 14, 30));
    expect(formatted).toMatch(/2024|Jun|15/);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('formats epoch zero', () => {
    expect(formatDocumentDate(0)).toEqual(expect.any(String));
  });
});
