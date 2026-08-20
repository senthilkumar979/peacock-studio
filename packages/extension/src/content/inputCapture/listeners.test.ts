import { describe, expect, it, vi } from 'vitest';
import { createImeCompositionState } from '@peacock/shared';
import { createInputListeners } from './listeners';
import type { InputScheduler } from './scheduler';
import type { InputCaptureDeps } from './types';

function makeDeps(overrides: Partial<InputCaptureDeps> = {}): InputCaptureDeps {
  return {
    isRecordingActive: () => true,
    storeEvent: vi.fn(async () => undefined),
    captureScreenshotId: vi.fn(async () => 'shot'),
    isPeacockUi: () => false,
    ...overrides,
  };
}

function makeScheduler(overrides: Partial<InputScheduler> = {}): InputScheduler {
  return {
    scheduleInputEvent: vi.fn(),
    flushInput: vi.fn(async () => undefined),
    flushAllPending: vi.fn(async () => undefined),
    onFieldFocusIn: vi.fn(),
    onFieldFocusOut: vi.fn(),
    cancelScheduledInput: vi.fn(),
    ...overrides,
  };
}

describe('inputCapture/listeners', () => {
  it('schedules input events for recordable targets', () => {
    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);

    const deps = makeDeps();
    const scheduler = makeScheduler();
    const listeners = createInputListeners(deps, scheduler, createImeCompositionState());

    const event = new Event('input', { bubbles: true });
    Object.defineProperty(event, 'target', { value: input });
    listeners.handleInput(event);

    expect(scheduler.scheduleInputEvent).toHaveBeenCalledWith(input);
  });

  it('ignores input while recording is inactive', () => {
    const input = document.createElement('input');
    input.type = 'text';
    const deps = makeDeps({ isRecordingActive: () => false });
    const scheduler = makeScheduler();
    const listeners = createInputListeners(deps, scheduler, createImeCompositionState());

    const event = new Event('input', { bubbles: true });
    Object.defineProperty(event, 'target', { value: input });
    listeners.handleInput(event);
    expect(scheduler.scheduleInputEvent).not.toHaveBeenCalled();
  });

  it('tracks focus in/out and composition lifecycle', () => {
    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);

    const deps = makeDeps();
    const scheduler = makeScheduler();
    const ime = createImeCompositionState();
    const listeners = createInputListeners(deps, scheduler, ime);

    const focusIn = new FocusEvent('focusin', { bubbles: true });
    Object.defineProperty(focusIn, 'target', { value: input });
    listeners.handleFocusIn(focusIn);
    expect(scheduler.onFieldFocusIn).toHaveBeenCalledWith(input);

    const focusOut = new FocusEvent('focusout', {
      bubbles: true,
      relatedTarget: document.body,
    });
    Object.defineProperty(focusOut, 'target', { value: input });
    listeners.handleFocusOut(focusOut);
    expect(scheduler.onFieldFocusOut).toHaveBeenCalledWith(input);

    listeners.handleCompositionStart();
    expect(ime.isComposing).toBe(true);
    const compositionEnd = new CompositionEvent('compositionend', { bubbles: true });
    Object.defineProperty(compositionEnd, 'target', { value: input });
    listeners.handleCompositionEnd(compositionEnd);
    expect(ime.isComposing).toBe(false);
    expect(scheduler.scheduleInputEvent).toHaveBeenCalled();
  });

  it('flushes pending inputs on page hide', () => {
    const scheduler = makeScheduler();
    const listeners = createInputListeners(makeDeps(), scheduler, createImeCompositionState());
    listeners.handlePageHide();
    expect(scheduler.flushAllPending).toHaveBeenCalled();
  });

  it('logs page hide flush failures', async () => {
    const error = new Error('flush failed');
    const scheduler = makeScheduler({
      flushAllPending: vi.fn().mockRejectedValue(error),
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const listeners = createInputListeners(makeDeps(), scheduler, createImeCompositionState());
    listeners.handlePageHide();
    await Promise.resolve();
    await Promise.resolve();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Peacock] Failed to flush pending inputs on page hide',
      error,
    );
    consoleSpy.mockRestore();
  });

  it('ignores peacock ui, sensitive inputs, and focus moves within control', () => {
    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);
    const inner = document.createElement('span');
    input.appendChild(inner);

    const peacockDeps = makeDeps({ isPeacockUi: () => true });
    const listeners = createInputListeners(peacockDeps, makeScheduler(), createImeCompositionState());
    const inputEvent = new Event('input', { bubbles: true });
    Object.defineProperty(inputEvent, 'target', { value: input });
    listeners.handleInput(inputEvent);
    expect(peacockDeps.storeEvent).not.toHaveBeenCalled();

    const password = document.createElement('input');
    password.type = 'password';
    document.body.appendChild(password);
    const scheduler = makeScheduler();
    const normalListeners = createInputListeners(makeDeps(), scheduler, createImeCompositionState());
    const sensitiveEvent = new Event('input', { bubbles: true });
    Object.defineProperty(sensitiveEvent, 'target', { value: password });
    normalListeners.handleInput(sensitiveEvent);
    expect(scheduler.scheduleInputEvent).not.toHaveBeenCalled();

    const focusOut = new FocusEvent('focusout', { bubbles: true, relatedTarget: inner });
    Object.defineProperty(focusOut, 'target', { value: input });
    normalListeners.handleFocusOut(focusOut);
    expect(scheduler.onFieldFocusOut).not.toHaveBeenCalled();
  });
});
