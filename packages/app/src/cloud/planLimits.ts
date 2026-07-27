function readLimitEnv(name: keyof ImportMetaEnv, fallback: number): number {
  const raw = import.meta.env[name]?.trim();
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  return parsed;
}

/** Plans that unlock paid embed chrome (no Peacock watermark / growth CTA). */
const PAID_EMBED_PLANS = new Set(['pro', 'team']);

/** Default free-tier screenshot storage quota (100 MB), matching DB default. */
const DEFAULT_FREE_STORAGE_BYTES = 104_857_600;

/** Oldest N docs visible to guests on this device (IndexedDB). */
export function getGuestVisibleDocLimit(): number {
  return readLimitEnv('VITE_GUEST_VISIBLE_DOC_LIMIT', 3);
}

/** Max flow documents on a free cloud account before upgrade prompt. */
export function getFreeAccountDocLimit(): number {
  return readLimitEnv('VITE_FREE_ACCOUNT_DOC_LIMIT', 10);
}

/** Max screenshot storage bytes on a free cloud account. */
export function getFreeAccountStorageBytesLimit(): number {
  return readLimitEnv('VITE_FREE_ACCOUNT_STORAGE_BYTES_LIMIT', DEFAULT_FREE_STORAGE_BYTES);
}

/**
 * Paid embeds hide the Peacock watermark / growth chrome.
 * Unknown or free plans keep attribution visible.
 */
export function shouldShowEmbedWatermark(plan: string | null | undefined): boolean {
  const normalized = (plan ?? 'free').trim().toLowerCase();
  return !PAID_EMBED_PLANS.has(normalized);
}
