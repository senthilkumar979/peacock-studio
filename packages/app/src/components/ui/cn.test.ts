import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins truthy class fragments', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters false, null, and undefined', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('returns empty string when all values are falsy', () => {
    expect(cn(false, null, undefined)).toBe('');
  });
});
