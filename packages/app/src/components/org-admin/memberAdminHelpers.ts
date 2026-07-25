import type { UserProfile } from '@/cloud/repositories/profileRepository';
import type {
  CapabilityKey,
  MemberRole,
  OrganizationMemberRecord,
} from '@/cloud/types/organization';

export const CAPABILITY_LABELS: Record<CapabilityKey, { label: string; hint: string }> = {
  read: { label: 'Read', hint: 'View docs and tours in the library' },
  create: { label: 'Create', hint: 'Add new docs and tours' },
  edit: { label: 'Edit', hint: 'Update existing content' },
  delete: { label: 'Delete', hint: 'Remove library items' },
  share: { label: 'Share', hint: 'Create share links' },
  export: { label: 'Export', hint: 'Download PDFs and artifacts' },
  embed: { label: 'Embed', hint: 'Publish embeds' },
};

export function isPlaceholderMemberEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith('@unknown.local');
}

export function resolveMemberDisplayEmail(
  member: OrganizationMemberRecord,
  profileByClerkId: Record<string, UserProfile>,
  currentUser?: { clerkUserId: string; email: string } | null,
): string {
  if (
    currentUser?.email &&
    member.clerkUserId === currentUser.clerkUserId &&
    !isPlaceholderMemberEmail(currentUser.email)
  ) {
    return currentUser.email;
  }

  const profile = profileByClerkId[member.clerkUserId];
  if (profile?.email && !isPlaceholderMemberEmail(profile.email)) {
    return profile.email;
  }

  if (!isPlaceholderMemberEmail(member.email)) return member.email;
  return profile?.displayName?.trim() || member.email;
}

export function resolveMemberDisplayName(
  member: OrganizationMemberRecord,
  profileByClerkId: Record<string, UserProfile>,
  currentUser?: { clerkUserId: string; displayName?: string } | null,
): string | null {
  if (
    currentUser?.displayName &&
    member.clerkUserId === currentUser.clerkUserId &&
    currentUser.displayName.trim() &&
    !currentUser.displayName.includes('@')
  ) {
    return currentUser.displayName.trim();
  }

  const profile = profileByClerkId[member.clerkUserId];
  const fromParts = [profile?.firstName, profile?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
    .trim();
  if (fromParts) return fromParts;

  const displayName = profile?.displayName?.trim();
  if (displayName && !displayName.includes('@')) return displayName;

  return null;
}

export function memberInitialsFromIdentity(name: string | null, email: string): string {
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return memberInitials(email);
}

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
