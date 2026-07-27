import {
  createId,
  extractElementSnapshot,
  getEventTargetElement,
  getViewport,
  normalizePosition,
  type SubmitEvent,
} from '@peacock/shared';
import type { InputCaptureDeps } from './types';
import type { InputScheduler } from './scheduler';
import {
  getAssociatedFormControl,
  isRecordableFormControl,
  isSensitiveInputTarget,
  resolveInputTarget,
} from './targets';

const CLICK_DEDUPE_MS = 100;

let suppressSubmitUntil = 0;

export function markSubmitSuppressedByClick(): void {
  suppressSubmitUntil = Date.now() + CLICK_DEDUPE_MS;
}

export function shouldSuppressSubmitEvent(): boolean {
  return Date.now() < suppressSubmitUntil;
}

export function isSubmitClickTarget(target: HTMLElement): boolean {
  if (target instanceof HTMLInputElement) {
    const type = target.type.toLowerCase();
    return type === 'submit' || type === 'button';
  }
  if (target instanceof HTMLButtonElement) {
    return target.type !== 'button' || Boolean(target.closest('form'));
  }
  return target.getAttribute('type') === 'submit';
}

function resolveSubmitElement(target: HTMLElement): HTMLElement | null {
  if (target instanceof HTMLFormElement) return target;

  const form = target.closest('form');
  if (form instanceof HTMLFormElement) return form;

  const control = getAssociatedFormControl(target);
  if (control) {
    const controlForm = control.closest('form');
    if (controlForm instanceof HTMLFormElement) return controlForm;
    return control;
  }

  return isRecordableFormControl(target) ? target : null;
}

function shouldCaptureEnterSubmit(event: KeyboardEvent, target: HTMLElement): boolean {
  if (event.key !== 'Enter') return false;
  if (event.isComposing) return false;
  if (event.defaultPrevented) return false;

  if (target instanceof HTMLTextAreaElement) {
    return event.ctrlKey || event.metaKey;
  }

  if (target instanceof HTMLButtonElement) return false;
  if (target instanceof HTMLInputElement) {
    const type = target.type.toLowerCase();
    if (type === 'button' || type === 'submit') return false;
  }

  return Boolean(resolveSubmitElement(target));
}

export function createKeyboardCapture(
  deps: InputCaptureDeps,
  scheduler: InputScheduler,
) {
  async function handleEnterKey(event: KeyboardEvent): Promise<void> {
    if (!deps.isRecordingActive()) return;

    const raw = getEventTargetElement(event);
    if (!(raw instanceof HTMLElement)) return;
    if (deps.isPeacockUi(raw)) return;
    if (!shouldCaptureEnterSubmit(event, raw)) return;

    const inputTarget = resolveInputTarget(raw);
    if (inputTarget && isSensitiveInputTarget(inputTarget)) return;

    await scheduler.flushAllPending();

    if (shouldSuppressSubmitEvent()) return;

    const submitElement = resolveSubmitElement(raw);
    if (!submitElement) return;

    const screenshotId = await deps.captureScreenshotId();
    const viewport = getViewport();
    const rect = submitElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const element = extractElementSnapshot(submitElement);

    const submitEvent: SubmitEvent = {
      id: createId(),
      type: 'submit',
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
      trigger: 'enter-key',
      screenshotId,
    };

    await deps.storeEvent(submitEvent);
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    void handleEnterKey(event).catch((error) => {
      console.error('[Peacock] Failed to store submit event', error);
    });
  }

  return { handleKeyDown };
}
