import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EMPTY_ANALYTICS_SUMMARY } from '@/types/analytics';
import { useOrgAnalytics } from './useOrgAnalytics';

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: vi.fn(() => 'guest'),
}));

vi.mock('@/cloud/repositories/analyticsRepository', () => ({
  fetchOrgAnalyticsSummary: vi.fn(),
}));

import { fetchOrgAnalyticsSummary } from '@/cloud/repositories/analyticsRepository';
import { useSessionMode } from '@/hooks/useSessionMode';

describe('useOrgAnalytics', () => {
  beforeEach(() => {
    vi.mocked(useSessionMode).mockReturnValue('guest');
    vi.mocked(fetchOrgAnalyticsSummary).mockReset();
  });

  it('is unavailable outside cloud mode', () => {
    const { result } = renderHook(() => useOrgAnalytics());
    expect(result.current).toEqual({
      summary: EMPTY_ANALYTICS_SUMMARY,
      isLoading: false,
      isAvailable: false,
    });
    expect(fetchOrgAnalyticsSummary).not.toHaveBeenCalled();
  });

  it('loads summary in cloud mode', async () => {
    vi.mocked(useSessionMode).mockReturnValue('cloud');
    const summary = { ...EMPTY_ANALYTICS_SUMMARY, totalViews: 9 };
    vi.mocked(fetchOrgAnalyticsSummary).mockResolvedValue(summary);

    const { result } = renderHook(() => useOrgAnalytics(7));
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.summary).toEqual(summary);
    expect(fetchOrgAnalyticsSummary).toHaveBeenCalledWith(7);
  });
});
