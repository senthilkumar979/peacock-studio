import { describe, expect, it } from 'vitest';
import {
  createImeCompositionState,
  shouldIgnoreInputWhileComposing,
} from './imeComposition';

describe('imeComposition', () => {
  it('ignores input while composing', () => {
    const state = createImeCompositionState();
    state.isComposing = true;

    expect(shouldIgnoreInputWhileComposing(state, new Event('input'))).toBe(true);
  });

  it('allows input after composition ends', () => {
    const state = createImeCompositionState();
    expect(shouldIgnoreInputWhileComposing(state, new Event('input'))).toBe(false);
  });
});
