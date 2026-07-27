import {
  getInputRawValueFromSource,
  resolveCapturedInputValue,
  type ElementSnapshot,
} from '@peacock/shared';
import type { RecordableInputTarget } from './types';

export function getInputRawValue(target: RecordableInputTarget): string {
  if (target instanceof HTMLInputElement) {
    return getInputRawValueFromSource({
      isContentEditable: false,
      isCheckbox: target.type === 'checkbox',
      isRadio: target.type === 'radio',
      checked: target.checked,
      value: target.value,
    });
  }

  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    return getInputRawValueFromSource({
      isContentEditable: false,
      isCheckbox: false,
      isRadio: false,
      value: target.value,
    });
  }

  return getInputRawValueFromSource({
    isContentEditable: target.isContentEditable,
    isCheckbox: false,
    isRadio: false,
    innerText: target.innerText,
  });
}

export function resolveCapturedValue(
  element: ElementSnapshot,
  rawValue: string,
): string {
  return resolveCapturedInputValue(element, rawValue);
}
