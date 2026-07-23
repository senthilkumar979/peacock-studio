export type ShareExpiryPreset = 'never' | '7d' | '30d' | '90d';

export const SHARE_EXPIRY_PRESETS: Array<{ id: ShareExpiryPreset; label: string; days: number | null }> =
  [
    { id: 'never', label: 'Never', days: null },
    { id: '7d', label: '7 days', days: 7 },
    { id: '30d', label: '30 days', days: 30 },
    { id: '90d', label: '90 days', days: 90 },
  ];

export function expiresAtFromPreset(preset: ShareExpiryPreset): string | null {
  const match = SHARE_EXPIRY_PRESETS.find((item) => item.id === preset);
  if (!match?.days) return null;
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + match.days);
  return date.toISOString();
}
