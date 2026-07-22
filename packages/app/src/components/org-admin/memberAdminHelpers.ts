import type { CapabilityKey, MemberRole } from '@/cloud/types/organization';

export const CAPABILITY_LABELS: Record<CapabilityKey, { label: string; hint: string }> = {
  create: { label: 'Create', hint: 'Add new docs and tours' },
  edit: { label: 'Edit', hint: 'Update existing content' },
  delete: { label: 'Delete', hint: 'Remove library items' },
  share: { label: 'Share', hint: 'Create share links' },
  export: { label: 'Export', hint: 'Download PDFs and artifacts' },
  embed: { label: 'Embed', hint: 'Publish embeds' },
};

export function memberInitials(email: string): string {
  const local = email.split('@')[0] ?? email;
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function formatInviteCountdown(expiresAt: string): {
  label: string;
  urgency: 'ok' | 'soon' | 'critical' | 'expired';
  progress: number;
} {
  const totalMs = 7 * 24 * 60 * 60 * 1000;
  const remaining = new Date(expiresAt).getTime() - Date.now();
  if (remaining <= 0) {
    return { label: 'Expired', urgency: 'expired', progress: 0 };
  }
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.max(1, Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000)));
  const label =
    days > 0
      ? `${days}d ${hours}h left`
      : hours > 0
        ? `${hours}h ${minutes}m left`
        : `${minutes}m left`;
  const progress = Math.min(1, Math.max(0, remaining / totalMs));
  const urgency =
    remaining < 24 * 60 * 60 * 1000
      ? 'critical'
      : remaining < 2 * 24 * 60 * 60 * 1000
        ? 'soon'
        : 'ok';
  return { label, urgency, progress };
}

export function roleLabel(role: MemberRole): string {
  return role === 'admin' ? 'Admin' : 'Member';
}
