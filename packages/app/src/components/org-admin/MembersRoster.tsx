import { UserRound } from 'lucide-react';
import type { UserProfile } from '@/cloud/repositories/profileRepository';
import type {
  MemberCapabilities,
  OrganizationMemberRecord,
} from '@/cloud/types/organization';
import { MembersAccessTable } from '@/components/org-admin/MembersAccessTable';
import { SoloMemberCard } from '@/components/org-admin/SoloMemberCard';
import {
  resolveMemberDisplayEmail,
  resolveMemberDisplayName,
} from '@/components/org-admin/memberAdminHelpers';

interface MembersRosterProps {
  members: OrganizationMemberRecord[];
  profileByClerkId: Record<string, UserProfile>;
  currentClerkUserId: string;
  currentUserEmail: string;
  currentUserDisplayName: string;
  busy: boolean;
  onUpdateCapabilities: (memberId: string, capabilities: MemberCapabilities) => Promise<void>;
  onRequestRevokeAccess: (member: OrganizationMemberRecord, displayEmail: string) => void;
  onRequestRemove: (member: OrganizationMemberRecord, displayEmail: string) => void;
}

export const MembersRoster = ({
  members,
  profileByClerkId,
  currentClerkUserId,
  currentUserEmail,
  currentUserDisplayName,
  busy,
  onUpdateCapabilities,
  onRequestRevokeAccess,
  onRequestRemove,
}: MembersRosterProps) => {
  const active = members.filter((m) => m.status === 'active');
  const disabled = members.filter((m) => m.status === 'disabled');
  const isSolo = members.length === 1;
  const currentUser = {
    clerkUserId: currentClerkUserId,
    email: currentUserEmail,
    displayName: currentUserDisplayName,
  };
  const solo = members[0];

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex rounded-lg bg-peacock-50 p-2 text-peacock-700 ring-1 ring-peacock-100">
            <UserRound className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Team members</h2>
            <p className="text-xs text-slate-500">
              {active.length} active
              {disabled.length > 0 ? ` · ${disabled.length} disabled` : ''}
            </p>
          </div>
        </div>
      </div>

      {isSolo && solo ? (
        <SoloMemberCard
          member={solo}
          displayName={resolveMemberDisplayName(solo, profileByClerkId, currentUser)}
          displayEmail={resolveMemberDisplayEmail(solo, profileByClerkId, currentUser)}
          currentClerkUserId={currentClerkUserId}
          busy={busy}
          onUpdateCapabilities={onUpdateCapabilities}
        />
      ) : (
        <MembersAccessTable
          members={members}
          profileByClerkId={profileByClerkId}
          currentUser={currentUser}
          busy={busy}
          onUpdateCapabilities={onUpdateCapabilities}
          onRequestRevokeAccess={onRequestRevokeAccess}
          onRequestRemove={onRequestRemove}
        />
      )}
    </section>
  );
};
