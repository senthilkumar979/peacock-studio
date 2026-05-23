const SENSITIVE_URL_PATTERNS = [/\/login\b/i, /\/payment\b/i, /\/billing\b/i];

export function isSensitiveUrl(url: string): boolean {
  return SENSITIVE_URL_PATTERNS.some((pattern) => pattern.test(url));
}

import { UI_HOST_ID } from './recordingUi';

export function isPeacockUiElement(element: EventTarget | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  return Boolean(element.closest(`#${UI_HOST_ID}`));
}
