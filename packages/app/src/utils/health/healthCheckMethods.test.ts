import { describe, expect, it } from 'vitest';
import { HEALTH_CHECK_METHODS, getHealthCheckMethod } from './healthCheckMethods';

describe('getHealthCheckMethod', () => {
  it('returns method docs for known check ids', () => {
    const method = getHealthCheckMethod('indexeddb');
    expect(method).toEqual(HEALTH_CHECK_METHODS.indexeddb);
    expect(method?.what).toMatch(/Dexie|idb|IndexedDB/i);
    expect(method?.how.length).toBeGreaterThan(0);
    expect(method?.interpret.length).toBeGreaterThan(0);
  });

  it('returns null for unknown check ids', () => {
    expect(getHealthCheckMethod('does-not-exist')).toBeNull();
  });

  it('covers the documented page and cloud probe keys', () => {
    for (const id of [
      'page-dashboard',
      'page-library-data',
      'cloud-config',
      'session',
      'extension',
      'supabase',
      'sentry',
      'posthog',
      'log-console',
      'log-cloud-init',
    ]) {
      expect(getHealthCheckMethod(id)).not.toBeNull();
    }
  });
});
