import {
  MAX_ARIA_LABELLED_BY_TEXT,
  MAX_DATA_ATTRIBUTES,
  MAX_DATA_VALUE_LENGTH,
  MAX_INNER_HTML_LENGTH,
  MAX_INNER_TEXT_LENGTH,
  MAX_PARENT_TEXT_LENGTH,
} from '../constants/limits';
import type {
  DataAttributes,
  ElementSnapshot,
  LabelInfo,
  ParentElementSnapshot,
} from '../types/events';
import { isSensitiveField, maskValue, shouldCaptureInnerHtml } from './masking';
import { getUniqueSelector } from './selector';
import { getXPath } from './xpath';

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}…`;
}

function extractDataAttributes(el: Element): DataAttributes {
  const result: DataAttributes = {};
  let count = 0;

  for (const attr of Array.from(el.attributes)) {
    if (!attr.name.startsWith('data-')) continue;
    if (count >= MAX_DATA_ATTRIBUTES) break;

    const key = attr.name.slice(5);
    result[key] = truncate(attr.value, MAX_DATA_VALUE_LENGTH);
    count += 1;
  }

  return result;
}

function getDirectText(el: Element): string {
  let text = '';

  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? '';
    }
  }

  return text.trim();
}

function extractParentSnapshot(el: Element | null): ParentElementSnapshot | null {
  if (!el || el === document.documentElement) return null;

  const htmlEl = el as HTMLElement;

  return {
    tagName: el.tagName.toLowerCase(),
    id: el.id ?? '',
    role: el.getAttribute('role'),
    classes: Array.from(el.classList),
    name: htmlEl instanceof HTMLFormElement ? htmlEl.getAttribute('name') : htmlEl.getAttribute('name'),
    text: truncate(getDirectText(el) || (htmlEl.innerText ?? '').trim(), MAX_PARENT_TEXT_LENGTH),
    dataAttributes: extractDataAttributes(el),
  };
}

function resolveAriaLabelledBy(el: HTMLElement): string | null {
  const labelledBy = el.getAttribute('aria-labelledby');
  if (!labelledBy) return null;

  const text = labelledBy
    .split(/\s+/)
    .map((id) => document.getElementById(id)?.innerText?.trim() ?? '')
    .filter(Boolean)
    .join(' ');

  if (!text) return null;
  return truncate(text, MAX_ARIA_LABELLED_BY_TEXT);
}

function resolveLabelInfo(el: HTMLElement): LabelInfo {
  const empty: LabelInfo = {
    text: null,
    htmlFor: null,
    ariaLabel: null,
    ariaLabelledBy: null,
    placeholder: null,
  };

  const isFormControl =
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement;

  if (!isFormControl) {
    return {
      ...empty,
      ariaLabel: el.getAttribute('aria-label'),
      ariaLabelledBy: resolveAriaLabelledBy(el),
      placeholder: el.getAttribute('placeholder'),
    };
  }

  const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  let labelText: string | null = null;
  let htmlFor: string | null = null;

  if (input.id) {
    const label = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
    if (label) {
      labelText = label.textContent?.trim() ?? null;
      htmlFor = input.id;
    }
  }

  if (!labelText) {
    const wrappingLabel = input.closest('label');
    if (wrappingLabel) {
      labelText = wrappingLabel.textContent?.trim() ?? null;
      htmlFor = wrappingLabel.getAttribute('for');
    }
  }

  return {
    text: labelText,
    htmlFor,
    ariaLabel: input.getAttribute('aria-label'),
    ariaLabelledBy: resolveAriaLabelledBy(input),
    placeholder: input.getAttribute('placeholder'),
  };
}

function captureInnerHtml(el: HTMLElement): string | null {
  const html = el.innerHTML;
  if (!shouldCaptureInnerHtml(el, html)) return null;
  return truncate(html, MAX_INNER_HTML_LENGTH);
}

function getCheckboxRadioLabel(el: HTMLInputElement): string {
  const labelledBy = el.labels?.[0]?.textContent?.trim();
  if (labelledBy) return labelledBy;
  return el.value || el.name || el.id || 'option';
}

function captureValuePreview(el: HTMLElement): string | null {
  if (el instanceof HTMLSelectElement) {
    const selected = el.selectedOptions[0];
    const value = selected?.text?.trim() || selected?.value || el.value;
    return value ? maskValue(value) : null;
  }

  if (el instanceof HTMLInputElement) {
    if (isSensitiveField(el)) return null;

    if (el.type === 'checkbox') {
      const label = getCheckboxRadioLabel(el);
      return el.checked ? maskValue(label) : null;
    }

    if (el.type === 'radio') {
      if (!el.checked) return null;
      return maskValue(getCheckboxRadioLabel(el));
    }
  }

  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    return null;
  }

  if (isSensitiveField(el)) return null;

  const value = el.value ?? '';
  if (!value) return null;

  return maskValue(value);
}

function getElementRoles(el: HTMLElement) {
  const tag = el.tagName.toLowerCase();
  const type = el instanceof HTMLInputElement ? el.type.toLowerCase() : null;
  const role = el.getAttribute('role');

  return {
    isButton: tag === 'button' || role === 'button' || (tag === 'input' && type === 'submit'),
    isLink: tag === 'a' || role === 'link',
    isInput:
      tag === 'input' &&
      type !== null &&
      !['button', 'submit', 'reset', 'checkbox', 'radio', 'hidden'].includes(type),
    isSelect: tag === 'select',
    isCheckbox: (tag === 'input' && type === 'checkbox') || role === 'checkbox',
    isRadio: (tag === 'input' && type === 'radio') || role === 'radio',
  };
}

export function extractElementSnapshot(el: HTMLElement): ElementSnapshot {
  const tagName = el.tagName.toLowerCase();
  const type = el instanceof HTMLInputElement ? el.type.toLowerCase() : null;
  const roles = getElementRoles(el);
  const innerText = truncate((el.innerText ?? '').trim(), MAX_INNER_TEXT_LENGTH);
  const parentEl = el.parentElement;
  const grandparentEl = parentEl?.parentElement ?? null;

  return {
    tagName,
    type,
    id: el.id ?? '',
    name: el.getAttribute('name'),
    role: el.getAttribute('role'),
    classes: Array.from(el.classList),
    selector: getUniqueSelector(el),
    xpath: getXPath(el),
    innerText,
    innerHTML: captureInnerHtml(el),
    label: resolveLabelInfo(el),
    valuePreview: captureValuePreview(el),
    dataAttributes: extractDataAttributes(el),
    ariaDescription: el.getAttribute('aria-description'),
    parent: extractParentSnapshot(parentEl),
    grandparent: extractParentSnapshot(grandparentEl),
    ...roles,
  };
}
