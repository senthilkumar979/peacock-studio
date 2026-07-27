import { isNonRecordableInput, isSensitiveField } from '@peacock/shared';
import type { RecordableInputTarget } from './types';

const ARIA_TEXTBOX_ROLES = new Set(['textbox', 'searchbox']);

function isAriaTextbox(el: HTMLElement): boolean {
  const role = el.getAttribute('role');
  return role !== null && ARIA_TEXTBOX_ROLES.has(role);
}

function resolveComboboxTarget(el: HTMLElement): RecordableInputTarget | null {
  const nested = el.querySelector('input, textarea, [contenteditable="true"]');
  if (nested instanceof HTMLElement) {
    return resolveInputTarget(nested);
  }
  return el;
}

export function resolveInputTarget(raw: Element | null): RecordableInputTarget | null {
  if (raw instanceof HTMLInputElement) {
    if (isNonRecordableInput(raw)) return null;
    return raw;
  }
  if (raw instanceof HTMLTextAreaElement) return raw;
  if (raw instanceof HTMLSelectElement) return raw;
  if (raw instanceof HTMLElement && raw.isContentEditable) return raw;
  if (raw instanceof HTMLElement && isAriaTextbox(raw)) return raw;
  if (raw instanceof HTMLElement && raw.getAttribute('role') === 'combobox') {
    return resolveComboboxTarget(raw);
  }
  return null;
}

export function isRecordableFormControl(
  target: Element | null,
): target is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  if (
    !(target instanceof HTMLInputElement) &&
    !(target instanceof HTMLSelectElement) &&
    !(target instanceof HTMLTextAreaElement)
  ) {
    return false;
  }

  if (target instanceof HTMLInputElement) {
    return !isNonRecordableInput(target);
  }

  return true;
}

export function getAssociatedFormControl(
  target: HTMLElement,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  if (isRecordableFormControl(target)) return target;

  const label = target.closest('label');
  if (!label) return null;

  const nestedControl = label.querySelector('input, select, textarea');
  if (isRecordableFormControl(nestedControl)) return nestedControl;

  const htmlFor = label.getAttribute('for');
  if (!htmlFor) return null;

  const referenced = document.getElementById(htmlFor);
  return isRecordableFormControl(referenced) ? referenced : null;
}

export function shouldDeferClickToInputEvent(target: HTMLElement): boolean {
  return Boolean(getAssociatedFormControl(target));
}

export function isSensitiveInputTarget(target: RecordableInputTarget): boolean {
  if (target.isContentEditable || isAriaTextbox(target)) return false;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    return isSensitiveField(target);
  }
  return false;
}

export function isFocusLeavingControl(
  control: RecordableInputTarget,
  relatedTarget: EventTarget | null,
): boolean {
  if (!relatedTarget || !(relatedTarget instanceof Node)) return true;
  return !control.contains(relatedTarget);
}
