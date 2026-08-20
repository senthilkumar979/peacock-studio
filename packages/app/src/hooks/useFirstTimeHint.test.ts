import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  useDashboardFirstTimeHint,
  useFirstTimeHint,
  useFirstTimeHintTour,
} from './useFirstTimeHint';

const STORAGE_KEY = 'peacock-first-time-hints';

describe('useFirstTimeHint hooks', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  describe('useFirstTimeHint', () => {
    it('tracks dismiss state for a single hint', () => {
      const { result } = renderHook(() => useFirstTimeHint('tip-a'));
      expect(result.current.isDismissed).toBe(false);

      act(() => {
        result.current.dismiss();
      });
      expect(result.current.isDismissed).toBe(true);
    });
  });

  describe('useFirstTimeHintTour', () => {
    it('returns first undismissed hint when enabled and ready', () => {
      const hints = ['a', 'b', 'c'] as const;
      const { result } = renderHook(() => useFirstTimeHintTour(hints));
      expect(result.current.activeHintId).toBe('a');

      act(() => {
        result.current.dismissHint('a');
      });
      expect(result.current.activeHintId).toBe('b');
    });

    it('returns null when disabled or not ready', () => {
      const hints = ['a', 'b'] as const;
      const { result: disabled } = renderHook(() =>
        useFirstTimeHintTour(hints, { enabled: false }),
      );
      expect(disabled.current.activeHintId).toBeNull();

      const { result: notReady } = renderHook(() =>
        useFirstTimeHintTour(hints, { ready: false }),
      );
      expect(notReady.current.activeHintId).toBeNull();
    });

    it('skipAllHints dismisses the whole sequence', () => {
      const hints = ['a', 'b'] as const;
      const { result } = renderHook(() => useFirstTimeHintTour(hints));
      act(() => {
        result.current.skipAllHints();
      });
      expect(result.current.activeHintId).toBeNull();
    });
  });

  describe('useDashboardFirstTimeHint', () => {
    it('returns null while library is loading', () => {
      const { result } = renderHook(() =>
        useDashboardFirstTimeHint({ isLibraryLoading: true, hasDocuments: false }),
      );
      expect(result.current.activeHintId).toBeNull();
    });

    it('returns next dashboard hint and advances on dismiss', () => {
      const { result } = renderHook(() =>
        useDashboardFirstTimeHint({ isLibraryLoading: false, hasDocuments: true }),
      );
      expect(result.current.activeHintId).toBe('dashboard-library');

      act(() => {
        result.current.dismissHint('dashboard-library');
      });
      expect(result.current.activeHintId).toBe('dashboard-product-tours');
    });

    it('returns null when disabled', () => {
      const { result } = renderHook(() =>
        useDashboardFirstTimeHint({
          isLibraryLoading: false,
          hasDocuments: false,
          enabled: false,
        }),
      );
      expect(result.current.activeHintId).toBeNull();
    });
  });
});
