import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePlayerStepDetailsVisibility } from './usePlayerStepDetailsVisibility';

describe('usePlayerStepDetailsVisibility', () => {
  it('starts visible and toggles', () => {
    const { result } = renderHook(() => usePlayerStepDetailsVisibility('step-1'));
    expect(result.current.isDetailsVisible).toBe(true);

    act(() => {
      result.current.toggleDetails();
    });
    expect(result.current.isDetailsVisible).toBe(false);

    act(() => {
      result.current.toggleDetails();
    });
    expect(result.current.isDetailsVisible).toBe(true);
  });

  it('resets to visible when stepId changes', () => {
    const { result, rerender } = renderHook(
      ({ stepId }) => usePlayerStepDetailsVisibility(stepId),
      { initialProps: { stepId: 'step-1' } },
    );

    act(() => {
      result.current.toggleDetails();
    });
    expect(result.current.isDetailsVisible).toBe(false);

    rerender({ stepId: 'step-2' });
    expect(result.current.isDetailsVisible).toBe(true);
  });
});
