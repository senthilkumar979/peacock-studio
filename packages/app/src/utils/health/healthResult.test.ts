import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { healthResult } from './healthResult';

describe('healthResult', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('builds a HealthCheckResult with checkedAt timestamp', () => {
    expect(healthResult('indexeddb', 'connections', 'IndexedDB', 'pass', 'ok')).toEqual({
      id: 'indexeddb',
      category: 'connections',
      label: 'IndexedDB',
      status: 'pass',
      detail: 'ok',
      checkedAt: Date.parse('2026-03-01T10:00:00.000Z'),
    });
  });
});
