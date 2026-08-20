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

  it('ignores input when the event itself is composing', () => {
    const state = createImeCompositionState();
    const event = new Event('input');
    Object.defineProperty(event, 'isComposing', { value: true });
    expect(shouldIgnoreInputWhileComposing(state, event)).toBe(true);
  });
});
