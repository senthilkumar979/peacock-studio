import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHealthChecks } from './useHealthChecks';

vi.mock('@/hooks/useCloudInitError', () => ({
  useCloudInitError: vi.fn(() => null),
}));

vi.mock('@/utils/runHealthChecks', () => ({
  runHealthChecks: vi.fn(),
  formatHealthReport: vi.fn(() => 'report text'),
}));

import { useCloudInitError } from '@/hooks/useCloudInitError';
import { formatHealthReport, runHealthChecks } from '@/utils/runHealthChecks';

describe('useHealthChecks', () => {
  beforeEach(() => {
    vi.mocked(useCloudInitError).mockReturnValue(null);
    vi.mocked(runHealthChecks).mockReset();
    vi.mocked(formatHealthReport).mockReturnValue('report text');
  });

  it('loads results on mount and exposes refresh', async () => {
    vi.mocked(runHealthChecks).mockResolvedValue([
      {
        id: 'indexeddb',
        category: 'connections',
        label: 'IDB',
        status: 'pass',
        detail: 'ok',
        checkedAt: 1,
      },
    ]);

    const { result } = renderHook(() => useHealthChecks());
    expect(result.current.isRunning).toBe(true);

    await waitFor(() => {
      expect(result.current.isRunning).toBe(false);
    });
    expect(result.current.results).toHaveLength(1);
    expect(result.current.ranAt).toEqual(expect.any(Number));
    expect(result.current.error).toBeNull();

    act(() => {
      result.current.refresh();
    });
    await waitFor(() => {
      expect(runHealthChecks).toHaveBeenCalledTimes(2);
    });
  });

  it('captures run errors', async () => {
    vi.mocked(runHealthChecks).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useHealthChecks());
    await waitFor(() => {
      expect(result.current.error).toBe('boom');
    });
    expect(result.current.isRunning).toBe(false);
  });

  it('copies formatted report via clipboard', async () => {
    vi.mocked(runHealthChecks).mockResolvedValue([]);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const { result } = renderHook(() => useHealthChecks());
    await waitFor(() => expect(result.current.ranAt).not.toBeNull());

    await expect(result.current.copyReport()).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('report text');
  });

  it('returns false from copyReport when clipboard fails or no ranAt', async () => {
    vi.mocked(runHealthChecks).mockImplementation(() => new Promise(() => undefined));
    const { result } = renderHook(() => useHealthChecks());
    await expect(result.current.copyReport()).resolves.toBe(false);
  });
});
