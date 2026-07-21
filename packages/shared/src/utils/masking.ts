import { ENABLE_VALUE_MASKING } from '../constants/privacy';

/**
 * Grouped patterns used to detect sensitive fields by name/id/autocomplete.
 * Each group maps to a classification decision in `classifyField`.
 */
export const SENSITIVE_PATTERNS = {
  password: /password|pwd|passwd/i,
  token: /token|api.?key|secret.?key|bearer/i,
  financial: /ssn|cvv|cvc|pin|credit.?card|card.?number|iban|routing.?number|account.?number/i,
  personal: /passport|driver.?license|license.?number|tax.?id|national.?id/i,
  auth: /authorization|auth.?token|session.?id/i,
  security: /\botp\b|mfa|2fa|security.?code|verification.?code/i,
} as const;

/** Input `type` values that should always be treated as sensitive. */
export const SENSITIVE_INPUT_TYPES = ['password'] as const;

/** `autocomplete` tokens that mark a field as sensitive regardless of name. */
export const SENSITIVE_AUTOCOMPLETE = [
  'current-password',
  'new-password',
  'cc-number',
  'cc-csc',
  'cc-exp',
  'cc-exp-month',
  'cc-exp-year',
  'one-time-code',
] as const;

/**
 * Secret-level name patterns whose values must never be captured. Personal
 * patterns are intentionally excluded here: those are `sensitive` (captured
 * then masked), not `secret`, and are handled in `classifyField`.
 */
const SECRET_NAME_PATTERN = new RegExp(
  [
    SENSITIVE_PATTERNS.password,
    SENSITIVE_PATTERNS.token,
    SENSITIVE_PATTERNS.financial,
    SENSITIVE_PATTERNS.auth,
    SENSITIVE_PATTERNS.security,
  ]
    .map((pattern) => pattern.source)
    .join('|'),
  'i',
);

/** Descriptor of an element's identifying attributes for pattern matching. */
export function getFieldIdentity(el: HTMLElement): string {
  const autocomplete = el.getAttribute('autocomplete') ?? '';
  return `${el.getAttribute('name') ?? ''} ${el.id} ${autocomplete}`.trim();
}

export function isSensitiveField(el: HTMLElement): boolean {
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    return false;
  }

  if (el instanceof HTMLInputElement) {
    const type = el.type.toLowerCase();
    if ((SENSITIVE_INPUT_TYPES as readonly string[]).includes(type)) return true;
  }

  const autocomplete = (el.getAttribute('autocomplete') ?? '').toLowerCase();
  if ((SENSITIVE_AUTOCOMPLETE as readonly string[]).includes(autocomplete)) return true;

  return SECRET_NAME_PATTERN.test(getFieldIdentity(el));
}

export function maskValue(value: string): string {
  if (!value) return '';
  if (!ENABLE_VALUE_MASKING) return value;
  if (value.length <= 3) return '***';
  return `${value.slice(0, 3)}***`;
}

/**
 * Always masks a value regardless of the global masking flag. Used for
 * `sensitive`-classified fields whose values are shown only in redacted form.
 */
export function maskSensitiveValue(value: string): string {
  if (!value) return '';
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
