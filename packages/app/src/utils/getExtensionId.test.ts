import { describe, expect, it, vi } from 'vitest';
import {
  PUBLISHED_EDGE_EXTENSION_ID,
  PUBLISHED_EXTENSION_ID,
} from '@/constants/extension';

describe('getConfiguredExtensionIds / getExtensionId', () => {
  it('includes env id first then published store ids without duplicates', async () => {
    vi.stubEnv('VITE_EXTENSION_ID', 'unpacked-local-id');
    vi.resetModules();
    const { getConfiguredExtensionIds, getExtensionId } = await import('./getExtensionId');

    expect(getConfiguredExtensionIds()).toEqual([
      'unpacked-local-id',
      PUBLISHED_EXTENSION_ID,
      PUBLISHED_EDGE_EXTENSION_ID,
    ]);
    expect(getExtensionId()).toBe('unpacked-local-id');
    vi.unstubAllEnvs();
  });

  it('falls back to published chrome id when env unset', async () => {
    vi.stubEnv('VITE_EXTENSION_ID', '');
    vi.resetModules();
    const { getConfiguredExtensionIds, getExtensionId } = await import('./getExtensionId');

    expect(getConfiguredExtensionIds()[0]).toBe(PUBLISHED_EXTENSION_ID);
    expect(getExtensionId()).toBe(PUBLISHED_EXTENSION_ID);
    vi.unstubAllEnvs();
  });
});
