import type { DataClassification, FieldClassification } from '../types/dataClassification';
import type { ElementSnapshot } from '../types/events';
import { SENSITIVE_PATTERNS } from './masking';

/** Input types whose values are visible but should be masked (contact PII). */
const CONTACT_INPUT_TYPES = ['email', 'tel'];

function buildIdentity(snapshot: ElementSnapshot): string {
  const dataKeys = Object.keys(snapshot.dataAttributes).join(' ');
  return `${snapshot.name ?? ''} ${snapshot.id} ${snapshot.type ?? ''} ${dataKeys}`.trim();
}

/**
 * Classifies a captured field snapshot into a data-sensitivity level.
 *
 * Ordering matters: the strongest match (secret) wins. Password fields are
 * already stripped of their value during capture, so this mainly drives how
 * remaining values are displayed and masked downstream.
 */
export function classifyField(snapshot: ElementSnapshot): FieldClassification {
  const identity = buildIdentity(snapshot);
  const type = (snapshot.type ?? '').toLowerCase();

  if (type === 'password' || SENSITIVE_PATTERNS.password.test(identity)) {
    return { classification: 'secret', reason: 'password-field' };
  }

  if (SENSITIVE_PATTERNS.financial.test(identity)) {
    return { classification: 'secret', reason: 'financial-pattern' };
  }

  if (SENSITIVE_PATTERNS.auth.test(identity) || SENSITIVE_PATTERNS.token.test(identity)) {
    return { classification: 'secret', reason: 'auth-pattern' };
  }

  if (SENSITIVE_PATTERNS.security.test(identity)) {
    return { classification: 'secret', reason: 'security-pattern' };
  }

  if (SENSITIVE_PATTERNS.personal.test(identity)) {
    return { classification: 'sensitive', reason: 'personal-pattern' };
  }

  if (CONTACT_INPUT_TYPES.includes(type)) {
    return { classification: 'sensitive', reason: 'contact-field' };
  }

  return { classification: 'public', reason: 'default-public' };
}

/**
 * Returns the value that should be displayed for a given classification.
 * `secret` never reveals anything; `sensitive` shows the pre-masked preview.
 */
export function resolveDisplayValue(
  classification: DataClassification,
  valuePreview: string | null,
  maskedValue: string | null | undefined,
  secretPlaceholder: string,
): string | null {
  if (classification === 'secret') return secretPlaceholder;
  if (classification === 'sensitive') return maskedValue ?? valuePreview;
  return valuePreview;
}
