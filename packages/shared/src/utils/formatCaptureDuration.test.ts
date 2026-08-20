import { describe, expect, it } from 'vitest';
import { formatCaptureDuration } from './formatCaptureDuration';

describe('formatCaptureDuration', () => {
  it('formats seconds only under one minute', () => {
    expect(formatCaptureDuration(0)).toBe('0s');
    expect(formatCaptureDuration(4500)).toBe('5s');
  });

  it('formats minutes with zero-padded seconds', () => {
    expect(formatCaptureDuration(60_000)).toBe('1m 00s');
    expect(formatCaptureDuration(125_000)).toBe('2m 05s');
  });

  it('clamps negative durations to zero', () => {
    expect(formatCaptureDuration(-1000)).toBe('0s');
  });
});
