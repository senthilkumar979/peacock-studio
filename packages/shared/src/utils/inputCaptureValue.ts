import type { ElementSnapshot } from '../types/events';

export interface InputValueSource {
  isContentEditable: boolean;
  isCheckbox: boolean;
  isRadio: boolean;
  checked?: boolean;
  value?: string;
  innerText?: string;
}

/**
 * Reads the live DOM value for an input capture target.
 */
export function getInputRawValueFromSource(source: InputValueSource): string {
  if (source.isCheckbox || source.isRadio) {
    return source.checked ? 'checked' : '';
  }

  if (source.isContentEditable) {
    return (source.innerText ?? '').trim();
  }

  return source.value ?? '';
}

/**
 * Resolves the value to persist on an input event while honoring classification.
 * Checkbox/radio unchecked must not fall back to the HTML value attribute.
 */
export function resolveCapturedInputValue(
  element: ElementSnapshot,
  rawValue: string,
): string {
  if (element.classification === 'secret') return '';

  if (element.classification === 'sensitive') {
    return element.maskedValue ?? '';
  }

  if (element.isCheckbox || element.isRadio) {
    if (rawValue !== 'checked') return '';
    return element.valuePreview ?? '';
  }

  return element.valuePreview ?? rawValue;
}
