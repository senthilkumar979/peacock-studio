import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useKeyboard } from './useKeyboard';

function dispatchKey(code: string, target: EventTarget = window) {
  const event = new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe('useKeyboard', () => {
  it('invokes handler and prevents default for matching key', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard({ ArrowRight: handler }));

    const event = dispatchKey('ArrowRight');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores keys without handlers', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard({ ArrowRight: handler }));

    dispatchKey('ArrowLeft');
    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores keydowns from inputs and textareas', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboard({ Enter: handler }));

    const input = document.createElement('input');
    document.body.appendChild(input);
    dispatchKey('Enter', input);
    expect(handler).not.toHaveBeenCalled();

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    dispatchKey('Enter', textarea);
    expect(handler).not.toHaveBeenCalled();

    input.remove();
    textarea.remove();
  });

  it('removes listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useKeyboard({ Escape: handler }));
    unmount();
    dispatchKey('Escape');
    expect(handler).not.toHaveBeenCalled();
  });
});
