import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CONSENT_STORAGE_KEY } from '@/constants/consent';
import { useConsentStore } from '@/store/consentStore';
import { useConsent } from './useConsent';

describe('useConsent', () => {
  beforeEach(() => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    useConsentStore.getState().resetConsent();
  });

  it('shows banner when no decision has been made', () => {
    const { result } = renderHook(() => useConsent());
    expect(result.current.hasDecided).toBe(false);
    expect(result.current.isBannerVisible).toBe(true);
    expect(result.current.isAnalyticsAllowed).toBe(false);
    expect(result.current.record).toBeNull();
  });

  it('hides banner while preferences are open', () => {
    const { result } = renderHook(() => useConsent());
    act(() => {
      useConsentStore.getState().openPreferences();
    });
    expect(result.current.isPreferencesOpen).toBe(true);
    expect(result.current.isBannerVisible).toBe(false);
    expect(result.current.hasDecided).toBe(false);
  });

  it('reflects accept-all decision', () => {
    const { result } = renderHook(() => useConsent());
    act(() => {
      useConsentStore.getState().acceptAll();
    });
    expect(result.current.hasDecided).toBe(true);
    expect(result.current.isBannerVisible).toBe(false);
    expect(result.current.isAnalyticsAllowed).toBe(true);
    expect(result.current.record).not.toBeNull();
  });

  it('reflects reject non-essential decision', () => {
    const { result } = renderHook(() => useConsent());
    act(() => {
      useConsentStore.getState().rejectNonEssential();
    });
    expect(result.current.hasDecided).toBe(true);
    expect(result.current.isAnalyticsAllowed).toBe(false);
  });
});
