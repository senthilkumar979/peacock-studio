import {
  createId,
  extractElementSnapshot,
  getViewport,
  normalizePosition,
  type InputEvent,
} from '@peacock/shared';
import type { InputCaptureDeps } from './types';
import type { RecordableInputTarget } from './types';
import { isSensitiveInputTarget } from './targets';
import { getInputRawValue, resolveCapturedValue } from './values';

const INPUT_DEBOUNCE_MS = 400;

export function createInputScheduler(deps: InputCaptureDeps) {
  const inputTimers = new WeakMap<RecordableInputTarget, ReturnType<typeof setTimeout>>();
  const pendingTargets = new Set<RecordableInputTarget>();
  const screenshotSessions = new WeakMap<RecordableInputTarget, string>();

  function cancelScheduledInput(target: RecordableInputTarget): void {
    const existing = inputTimers.get(target);
    if (existing) {
      clearTimeout(existing);
      inputTimers.delete(target);
    }
    pendingTargets.delete(target);
  }

  function clearScreenshotSession(target: RecordableInputTarget): void {
    screenshotSessions.delete(target);
  }

  async function resolveScreenshotId(target: RecordableInputTarget): Promise<string> {
    const cached = screenshotSessions.get(target);
    if (cached) return cached;

    const screenshotId = await deps.captureScreenshotId();
    if (screenshotId) {
      screenshotSessions.set(target, screenshotId);
    }
    return screenshotId;
  }

  async function flushInput(target: RecordableInputTarget): Promise<void> {
    cancelScheduledInput(target);

    if (!deps.isRecordingActive()) return;
    if (isSensitiveInputTarget(target)) return;

    const screenshotId = await resolveScreenshotId(target);
    const viewport = getViewport();
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const element = extractElementSnapshot(target);
    if (element.classification === 'secret') return;

    const rawValue = getInputRawValue(target);
    const valuePreview = resolveCapturedValue(element, rawValue);

    const inputEvent: InputEvent = {
      id: createId(),
      type: 'input',
      timestamp: Date.now(),
      url: location.href,
      title: document.title,
      viewport,
      position: {
        x: centerX,
        y: centerY,
        ...normalizePosition(centerX, centerY, viewport),
      },
      element,
      valuePreview,
      screenshotId,
    };

    await deps.storeEvent(inputEvent);
  }

  function scheduleInputEvent(target: RecordableInputTarget): void {
    cancelScheduledInput(target);
    pendingTargets.add(target);

    inputTimers.set(
      target,
      setTimeout(() => {
        inputTimers.delete(target);
        pendingTargets.delete(target);
        void flushInput(target).catch((error) => {
          console.error('[Peacock] Failed to store input event', error);
        });
      }, INPUT_DEBOUNCE_MS),
    );
  }

  async function flushAllPending(): Promise<void> {
    const targets = [...pendingTargets];
    for (const target of targets) {
      await flushInput(target);
    }
  }

  function onFieldFocusIn(target: RecordableInputTarget): void {
    clearScreenshotSession(target);
  }

  function onFieldFocusOut(target: RecordableInputTarget): void {
    void flushInput(target).catch((error) => {
      console.error('[Peacock] Failed to flush input on blur', error);
    });
    clearScreenshotSession(target);
  }

  return {
    scheduleInputEvent,
    flushInput,
    flushAllPending,
    onFieldFocusIn,
    onFieldFocusOut,
    cancelScheduledInput,
  };
}

export type InputScheduler = ReturnType<typeof createInputScheduler>;
