import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createKeyboardCapture,
  isSubmitClickTarget,
  markSubmitSuppressedByClick,
  shouldSuppressSubmitEvent,
} from './keyboard';
import type { InputCaptureDeps } from './types';
import type { InputScheduler } from './scheduler';

function makeDeps(overrides: Partial<InputCaptureDeps> = {}): InputCaptureDeps {
  return {
    isRecordingActive: () => true,
    storeEvent: vi.fn(async () => undefined),
    captureScreenshotId: vi.fn(async () => 'shot-1'),
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

describe('inputCapture/keyboard', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('detects submit click targets', () => {
    const submitInput = document.createElement('input');
    submitInput.type = 'submit';
    expect(isSubmitClickTarget(submitInput)).toBe(true);

    const buttonInput = document.createElement('input');
    buttonInput.type = 'button';
    expect(isSubmitClickTarget(buttonInput)).toBe(true);

    const button = document.createElement('button');
    button.type = 'submit';
    expect(isSubmitClickTarget(button)).toBe(true);

    const plainButton = document.createElement('button');
    plainButton.type = 'button';
    expect(isSubmitClickTarget(plainButton)).toBe(false);

    const form = document.createElement('form');
    const inForm = document.createElement('button');
    inForm.type = 'button';
    form.appendChild(inForm);
    expect(isSubmitClickTarget(inForm)).toBe(true);

    const typed = document.createElement('div');
    typed.setAttribute('type', 'submit');
    expect(isSubmitClickTarget(typed)).toBe(true);
  });

  it('suppresses submit events shortly after a click mark', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    markSubmitSuppressedByClick();
    expect(shouldSuppressSubmitEvent()).toBe(true);
    vi.setSystemTime(1_200);
    expect(shouldSuppressSubmitEvent()).toBe(false);
    vi.useRealTimers();
  });

  it('stores an enter-key submit event for form inputs', async () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.type = 'text';
    form.appendChild(input);
    document.body.appendChild(form);

    const deps = makeDeps();
    const scheduler = makeScheduler();
    const { handleKeyDown } = createKeyboardCapture(deps, scheduler);

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    Object.defineProperty(event, 'target', { value: input });
    handleKeyDown(event);

    await vi.waitFor(() => {
      expect(deps.storeEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'submit', trigger: 'enter-key' }),
      );
    });
    expect(scheduler.flushAllPending).toHaveBeenCalled();
  });

  it('ignores enter when recording is inactive', async () => {
    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);
    const form = document.createElement('form');
    form.appendChild(input);
    document.body.appendChild(form);

    const deps = makeDeps({ isRecordingActive: () => false });
    const { handleKeyDown } = createKeyboardCapture(deps, makeScheduler());
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    Object.defineProperty(event, 'target', { value: input });
    handleKeyDown(event);
    await Promise.resolve();
    expect(deps.storeEvent).not.toHaveBeenCalled();
  });

  it('ignores non-enter keys and invalid targets', async () => {
    const deps = makeDeps();
    const { handleKeyDown } = createKeyboardCapture(deps, makeScheduler());
    handleKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }));
    handleKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));
    await Promise.resolve();
    expect(deps.storeEvent).not.toHaveBeenCalled();
  });

  it('captures ctrl/meta enter in textareas and ignores plain enter', async () => {
    const textarea = document.createElement('textarea');
    const form = document.createElement('form');
    form.appendChild(textarea);
    document.body.appendChild(form);

    const deps = makeDeps();
    const { handleKeyDown } = createKeyboardCapture(deps, makeScheduler());

    const plain = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    Object.defineProperty(plain, 'target', { value: textarea });
    handleKeyDown(plain);
    await Promise.resolve();
    expect(deps.storeEvent).not.toHaveBeenCalled();

    const ctrl = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, ctrlKey: true });
    Object.defineProperty(ctrl, 'target', { value: textarea });
    handleKeyDown(ctrl);
    await vi.waitFor(() => expect(deps.storeEvent).toHaveBeenCalled());
  });

  it('skips peacock ui, sensitive fields, composing, and suppressed submits', async () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.type = 'text';
    form.appendChild(input);
    document.body.appendChild(form);

    const deps = makeDeps({ isPeacockUi: (el) => el === input });
    const { handleKeyDown: peacockHandler } = createKeyboardCapture(deps, makeScheduler());
    const peacockEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    Object.defineProperty(peacockEvent, 'target', { value: input });
    peacockEvent.preventDefault();
    peacockHandler(peacockEvent);
    await Promise.resolve();
    expect(deps.storeEvent).not.toHaveBeenCalled();

    const password = document.createElement('input');
    password.type = 'password';
    form.appendChild(password);
    const sensitiveDeps = makeDeps();
    const { handleKeyDown: sensitiveHandler } = createKeyboardCapture(
      sensitiveDeps,
      makeScheduler(),
    );
    const sensitiveEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    Object.defineProperty(sensitiveEvent, 'target', { value: password });
    sensitiveHandler(sensitiveEvent);
    await Promise.resolve();
    expect(sensitiveDeps.storeEvent).not.toHaveBeenCalled();

    markSubmitSuppressedByClick();
    const suppressedDeps = makeDeps();
    const { handleKeyDown: suppressedHandler } = createKeyboardCapture(
      suppressedDeps,
      makeScheduler(),
    );
    const suppressedEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    Object.defineProperty(suppressedEvent, 'target', { value: input });
    suppressedHandler(suppressedEvent);
    await Promise.resolve();
    expect(suppressedDeps.storeEvent).not.toHaveBeenCalled();

    const composingEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    Object.defineProperty(composingEvent, 'target', { value: input });
    Object.defineProperty(composingEvent, 'isComposing', { value: true });
    const composingDeps = makeDeps();
    const { handleKeyDown: composingHandler } = createKeyboardCapture(
      composingDeps,
      makeScheduler(),
    );
    composingHandler(composingEvent);
    await Promise.resolve();
    expect(composingDeps.storeEvent).not.toHaveBeenCalled();
  });

});
