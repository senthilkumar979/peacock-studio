import { createImeCompositionState } from '@peacock/shared';
import type { InputCaptureDeps } from './types';
import { createKeyboardCapture } from './keyboard';
import { createInputListeners } from './listeners';
import { createInputScheduler } from './scheduler';

export function initInputCapture(deps: InputCaptureDeps) {
  const scheduler = createInputScheduler(deps);
  const imeState = createImeCompositionState();
  const listeners = createInputListeners(deps, scheduler, imeState);
  const keyboard = createKeyboardCapture(deps, scheduler);

  document.addEventListener('input', listeners.handleInput, true);
  document.addEventListener('change', listeners.handleInput, true);
  document.addEventListener('focusin', listeners.handleFocusIn, true);
  document.addEventListener('focusout', listeners.handleFocusOut, true);
  document.addEventListener('compositionstart', listeners.handleCompositionStart, true);
  document.addEventListener('compositionend', listeners.handleCompositionEnd, true);
  document.addEventListener('pagehide', listeners.handlePageHide);
  document.addEventListener('keydown', keyboard.handleKeyDown, true);

  return {
    flushAllPending: scheduler.flushAllPending,
  };
}

export {
  getAssociatedFormControl,
  shouldDeferClickToInputEvent,
} from './targets';
export { markSubmitSuppressedByClick, isSubmitClickTarget } from './keyboard';
