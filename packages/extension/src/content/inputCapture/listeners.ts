import { getEventTargetElement, shouldIgnoreInputWhileComposing } from '@peacock/shared';
import type { ImeCompositionState } from '@peacock/shared';
import type { InputCaptureDeps } from './types';
import type { InputScheduler } from './scheduler';
import {
  isFocusLeavingControl,
  isSensitiveInputTarget,
  resolveInputTarget,
} from './targets';

export function createInputListeners(
  deps: InputCaptureDeps,
  scheduler: InputScheduler,
  imeState: ImeCompositionState,
) {
  function handleInput(event: Event): void {
    if (!deps.isRecordingActive()) return;
    if (shouldIgnoreInputWhileComposing(imeState, event)) return;

    const target = resolveInputTarget(getEventTargetElement(event));
    if (!target) return;
    if (deps.isPeacockUi(target)) return;
    if (isSensitiveInputTarget(target)) return;

    scheduler.scheduleInputEvent(target);
  }

  function handleFocusIn(event: FocusEvent): void {
    if (!deps.isRecordingActive()) return;

    const target = resolveInputTarget(event.target instanceof Element ? event.target : null);
    if (!target) return;
    if (deps.isPeacockUi(target)) return;

    scheduler.onFieldFocusIn(target);
  }

  function handleFocusOut(event: FocusEvent): void {
    if (!deps.isRecordingActive()) return;

    const target = resolveInputTarget(event.target instanceof Element ? event.target : null);
    if (!target) return;
    if (!isFocusLeavingControl(target, event.relatedTarget)) return;

    scheduler.onFieldFocusOut(target);
  }

  function handleCompositionStart(): void {
    imeState.isComposing = true;
  }

  function handleCompositionEnd(event: CompositionEvent): void {
    imeState.isComposing = false;
    handleInput(event);
  }

  function handlePageHide(): void {
    void scheduler.flushAllPending().catch((error) => {
      console.error('[Peacock] Failed to flush pending inputs on page hide', error);
    });
  }

  return {
    handleInput,
    handleFocusIn,
    handleFocusOut,
    handleCompositionStart,
    handleCompositionEnd,
    handlePageHide,
  };
}
