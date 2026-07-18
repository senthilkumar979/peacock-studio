function readLimitEnv(name: keyof ImportMetaEnv, fallback: number): number {
  const raw = import.meta.env[name]?.trim();
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  return parsed;
}

/** Oldest N docs visible to guests on this device (IndexedDB). */
export function getGuestVisibleDocLimit(): number {
  return readLimitEnv('VITE_GUEST_VISIBLE_DOC_LIMIT', 3);
}

/** Max flow documents on a free cloud account before upgrade prompt. */
export function getFreeAccountDocLimit(): number {
  return readLimitEnv('VITE_FREE_ACCOUNT_DOC_LIMIT', 10);
}
