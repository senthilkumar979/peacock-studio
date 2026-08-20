import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAnalytics } from './useAnalytics';

vi.mock('@/analytics/analyticsClient', () => ({
  trackEvent: vi.fn(),
}));

import { trackEvent } from '@/analytics/analyticsClient';

describe('useAnalytics', () => {
  it('exposes track that forwards to trackEvent', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.track('doc_opened', { document_id: 'd1' });
    expect(trackEvent).toHaveBeenCalledWith('doc_opened', { document_id: 'd1' });
  });

  it('allows track without props', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.track('clicked_cta');
    expect(trackEvent).toHaveBeenCalledWith('clicked_cta', undefined);
  });
});
