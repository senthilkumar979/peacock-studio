import { ENABLE_VALUE_MASKING } from '../constants/privacy';

const SENSITIVE_NAME_PATTERNS = /ssn|cvv|cvc|pin|secret|token|credit.?card/i;

export function isSensitiveField(el: HTMLElement): boolean {
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    return false;
  }

  if (el instanceof HTMLInputElement) {
    const type = el.type.toLowerCase();
    if (type === 'password') return true;
  }

  const name = `${el.name} ${el.id} ${el.getAttribute('autocomplete') ?? ''}`;
  return SENSITIVE_NAME_PATTERNS.test(name);
}

export function maskValue(value: string): string {
  if (!value) return '';
  if (!ENABLE_VALUE_MASKING) return value;
  if (value.length <= 3) return '***';
  return `${value.slice(0, 3)}***`;
}

export function shouldCaptureInnerHtml(el: HTMLElement, html: string): boolean {
  if (html.length > 500) return false;
  if (/password|credit-card/i.test(html)) return false;

  const blockedTags = ['script', 'style', 'iframe', 'object', 'embed'];
  const tag = el.tagName.toLowerCase();
  if (blockedTags.includes(tag)) return false;
  if (el.isContentEditable) return false;

  return true;
}
