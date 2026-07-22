import { requireCloudAuthContext } from '@/cloud/authContext';

/** Convert epoch ms (app / IndexedDB) to ISO timestamptz for Supabase. */
export function msToIso(ms: number): string {
  return new Date(ms).toISOString();
}

/** Convert Supabase timestamptz (ISO string) or legacy number to epoch ms. */
export function isoToMs(value: string | number | null | undefined): number {
  if (value == null) return Date.now();
  if (typeof value === 'number') {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

export function normalizeProfileEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function requireUserEmail(): string {
  const email = requireCloudAuthContext().userEmail?.trim();
  if (!email) {
    throw new Error('Signed-in user email is required for cloud writes.');
  }
  return normalizeProfileEmail(email);
}

export interface AuditStamp {
  createdAt: number;
  updatedAt: number;
  /** Stable audit key — user email. Resolve display name via user_profiles. */
  createdBy: string | null;
  updatedBy: string | null;
}

/**
 * Stamps audit email fields for a cloud write.
 * Display names live in `user_profiles`, not on each row.
 */
export function stampAuditForCloudWrite(
  existing: Partial<AuditStamp> | null | undefined,
  options: { preserveUpdatedAt?: boolean } = {},
): AuditStamp {
  const email = requireUserEmail();
  const now = Date.now();
  const createdAt = existing?.createdAt ?? now;
  const updatedAt = options.preserveUpdatedAt
    ? (existing?.updatedAt ?? createdAt)
    : now;

  return {
    createdAt,
    updatedAt,
    createdBy: existing?.createdBy?.trim()
      ? normalizeProfileEmail(existing.createdBy)
      : email,
    updatedBy: email,
  };
}
