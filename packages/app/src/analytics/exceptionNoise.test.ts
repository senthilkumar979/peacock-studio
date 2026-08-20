import { describe, expect, it } from 'vitest';
import { getExceptionMessage, isBenignAnalyticsException } from './exceptionNoise';

describe('getExceptionMessage', () => {
  it('reads Error messages', () => {
    expect(getExceptionMessage(new Error('failed'))).toBe('failed');
  });

  it('reads string and message-bearing objects', () => {
    expect(getExceptionMessage('plain')).toBe('plain');
    expect(getExceptionMessage({ message: 'from-object' })).toBe('from-object');
  });

  it('stringifies other values', () => {
    expect(getExceptionMessage(42)).toBe('42');
    expect(getExceptionMessage(null)).toBe('null');
  });
});

describe('isBenignAnalyticsException', () => {
  it('filters known ResizeObserver noise', () => {
    expect(
      isBenignAnalyticsException(
        new Error('ResizeObserver loop limit exceeded'),
      ),
    ).toBe(true);
    expect(
      isBenignAnalyticsException(
        'ResizeObserver loop completed with undelivered notifications',
      ),
    ).toBe(true);
  });

  it('keeps real product errors', () => {
    expect(isBenignAnalyticsException(new Error('Failed to save document'))).toBe(
      false,
    );
  });
});
