import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExtensionInstalled } from './useExtensionInstalled';

vi.mock('@/utils/probeExtensionInstalled', () => ({
  probeExtensionInstalled: vi.fn(),
}));

import { probeExtensionInstalled } from '@/utils/probeExtensionInstalled';

describe('useExtensionInstalled', () => {
  beforeEach(() => {
    vi.mocked(probeExtensionInstalled).mockReset();
  });

  it('reports installed after successful probe', async () => {
    vi.mocked(probeExtensionInstalled).mockResolvedValue(true);
    const { result } = renderHook(() => useExtensionInstalled());
    expect(result.current.isChecking).toBe(true);

    await waitFor(() => {
      expect(result.current.status).toBe('installed');
    });
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isChecking).toBe(false);
  });

  it('reports missing when probe fails', async () => {
    vi.mocked(probeExtensionInstalled).mockResolvedValue(false);
    const { result } = renderHook(() => useExtensionInstalled());
    await waitFor(() => {
      expect(result.current.status).toBe('missing');
    });
    expect(result.current.isInstalled).toBe(false);
  });

  it('rechecks on demand and when tab becomes visible', async () => {
    let installed = false;
    vi.mocked(probeExtensionInstalled).mockImplementation(async () => installed);

    const { result } = renderHook(() => useExtensionInstalled());
    await waitFor(() => {
      expect(result.current.status).toBe('missing');
    });

    const afterMount = vi.mocked(probeExtensionInstalled).mock.calls.length;
    installed = true;

    act(() => {
      result.current.recheck();
    });
    await waitFor(() => {
      expect(result.current.status).toBe('installed');
    });
    expect(vi.mocked(probeExtensionInstalled).mock.calls.length).toBeGreaterThan(afterMount);

    const afterRecheck = vi.mocked(probeExtensionInstalled).mock.calls.length;
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitFor(() => {
      expect(vi.mocked(probeExtensionInstalled).mock.calls.length).toBeGreaterThan(afterRecheck);
    });
  });
});
