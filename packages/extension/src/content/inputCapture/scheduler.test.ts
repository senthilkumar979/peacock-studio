import { describe, expect, it, vi } from 'vitest';
import { createInputScheduler } from './scheduler';
import type { InputCaptureDeps } from './types';

function makeDeps(overrides: Partial<InputCaptureDeps> = {}): InputCaptureDeps {
  return {
    isRecordingActive: () => true,
    storeEvent: vi.fn(async () => undefined),
    captureScreenshotId: vi.fn(async () => 'shot-1'),
    isPeacockUi: () => false,
    ...overrides,
  };
}

describe('inputCapture/scheduler', () => {
  it('debounces input events and stores after delay', async () => {
    vi.useFakeTimers();
    const input = document.createElement('input');
    input.type = 'text';
    input.value = 'abc';
    document.body.appendChild(input);

    const deps = makeDeps();
    const scheduler = createInputScheduler(deps);
    scheduler.scheduleInputEvent(input);

    expect(deps.storeEvent).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(400);
    await vi.waitFor(() => {
      expect(deps.storeEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'input', valuePreview: 'abc' }),
      );
    });
    vi.useRealTimers();
  });

  it('reuses screenshot id within a focus session', async () => {
    vi.useFakeTimers();
    const input = document.createElement('input');
    input.type = 'text';
    input.value = 'a';
    document.body.appendChild(input);

    const captureScreenshotId = vi
      .fn()
      .mockResolvedValueOnce('shot-a')
      .mockResolvedValueOnce('shot-b');
    const deps = makeDeps({ captureScreenshotId });
    const scheduler = createInputScheduler(deps);

    scheduler.onFieldFocusIn(input);
    scheduler.scheduleInputEvent(input);
    await vi.advanceTimersByTimeAsync(400);
    await vi.waitFor(() => expect(deps.storeEvent).toHaveBeenCalledTimes(1));

    input.value = 'ab';
    scheduler.scheduleInputEvent(input);
    await vi.advanceTimersByTimeAsync(400);
    await vi.waitFor(() => expect(deps.storeEvent).toHaveBeenCalledTimes(2));

    expect(captureScreenshotId).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('flushes pending targets immediately', async () => {
    vi.useFakeTimers();
    const input = document.createElement('input');
    input.type = 'text';
    input.value = 'x';
    document.body.appendChild(input);

    const deps = makeDeps();
    const scheduler = createInputScheduler(deps);
    scheduler.scheduleInputEvent(input);
    await scheduler.flushAllPending();
    expect(deps.storeEvent).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('skips sensitive fields', async () => {
    const input = document.createElement('input');
    input.type = 'password';
    document.body.appendChild(input);

    const deps = makeDeps();
    const scheduler = createInputScheduler(deps);
    await scheduler.flushInput(input);
    expect(deps.storeEvent).not.toHaveBeenCalled();
  });

  it('flushes on focus out and clears screenshot session', async () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = 'hi';
    document.body.appendChild(input);

    const deps = makeDeps();
    const scheduler = createInputScheduler(deps);
    scheduler.onFieldFocusOut(input);
    await vi.waitFor(() => expect(deps.storeEvent).toHaveBeenCalled());
  });

  it('logs flush failures from debounced input and blur', async () => {
    vi.useFakeTimers();
    const input = document.createElement('input');
    input.type = 'text';
    input.value = 'x';
    document.body.appendChild(input);

    const error = new Error('flush failed');
    const deps = makeDeps({ storeEvent: vi.fn(async () => { throw error; }) });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const scheduler = createInputScheduler(deps);

    scheduler.scheduleInputEvent(input);
    await vi.advanceTimersByTimeAsync(400);
    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('[Peacock] Failed to store input event', error);
    });

    scheduler.onFieldFocusOut(input);
    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('[Peacock] Failed to flush input on blur', error);
    });

    consoleSpy.mockRestore();
    vi.useRealTimers();
  });

  it('skips secret fields and inactive recording on flush', async () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = 'secret';
    document.body.appendChild(input);

    const deps = makeDeps({ isRecordingActive: () => false });
    const scheduler = createInputScheduler(deps);
    await scheduler.flushInput(input);
    expect(deps.storeEvent).not.toHaveBeenCalled();
  });
});
