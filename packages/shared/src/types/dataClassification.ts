/**
 * Data classification levels for captured input values.
 *
 * - `public`: safe to display everywhere (default for ordinary inputs).
 * - `internal`: captured, but only surfaced to authenticated org members.
 * - `sensitive`: captured then masked in the UI/exports (e.g. email, phone).
 * - `secret`: never captured; always rendered as a redacted placeholder.
 */
export const DATA_CLASSIFICATIONS = ['public', 'internal', 'sensitive', 'secret'] as const;

export type DataClassification = (typeof DATA_CLASSIFICATIONS)[number];

/** Placeholder rendered wherever a secret value would otherwise appear. */
export const SECRET_PLACEHOLDER = '••••••••';

/** Machine-readable reason a field received its classification. */
export type ClassificationReason =
  | 'password-field'
  | 'financial-pattern'
  | 'auth-pattern'
  | 'security-pattern'
  | 'personal-pattern'
  | 'contact-field'
  | 'default-public';

export interface FieldClassification {
  classification: DataClassification;
  reason: ClassificationReason;
}
