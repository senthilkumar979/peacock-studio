import { UserMinus, UserX } from 'lucide-react';
import type { UserProfile } from '@/cloud/repositories/profileRepository';
import type {
  MemberCapabilities,
  OrganizationMemberRecord,
} from '@/cloud/types/organization';
import { CAPABILITY_KEYS } from '@/cloud/types/organization';
import { CapabilityAccessToggle } from '@/components/org-admin/CapabilityAccessToggle';
import {
  CAPABILITY_LABELS,
  memberInitialsFromIdentity,
  resolveMemberDisplayEmail,
  resolveMemberDisplayName,
  roleLabel,
} from '@/components/org-admin/memberAdminHelpers';

interface MembersAccessTableProps {
  members: OrganizationMemberRecord[];
  profileByClerkId: Record<string, UserProfile>;
  currentUser: { clerkUserId: string; email: string; displayName?: string };
  busy: boolean;
  onUpdateCapabilities: (memberId: string, capabilities: MemberCapabilities) => Promise<void>;
  onRequestRevokeAccess: (member: OrganizationMemberRecord, displayEmail: string) => void;
  onRequestRemove: (member: OrganizationMemberRecord, displayEmail: string) => void;
}

export const MembersAccessTable = ({
  members,
  profileByClerkId,
  currentUser,
  busy,
  onUpdateCapabilities,
  onRequestRevokeAccess,
  onRequestRemove,
}: MembersAccessTableProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <th className="px-5 py-3 sm:px-6">Member</th>
          <th className="px-2 py-3">Role</th>
          {CAPABILITY_KEYS.map((key) => (
            <th key={key} className="px-1.5 py-3 text-center" title={CAPABILITY_LABELS[key].hint}>
              {CAPABILITY_LABELS[key].label}
            </th>
          ))}
          <th className="px-2 py-3">Status</th>
          <th className="px-5 py-3 text-right sm:px-6">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {members.map((member) => {
          const displayEmail = resolveMemberDisplayEmail(member, profileByClerkId, currentUser);
          const displayName = resolveMemberDisplayName(member, profileByClerkId, currentUser);
          const isYou = member.clerkUserId === currentUser.clerkUserId;
          const isDisabled = member.status === 'disabled';

          return (
            <tr key={member.id} className={isDisabled ? 'bg-slate-50/70 opacity-80' : ''}>
              <td className="px-5 py-3.5 sm:px-6">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                    {memberInitialsFromIdentity(displayName, displayEmail)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {displayName ?? displayEmail}
                    </p>
                    {displayName ? (
                      <p className="truncate text-xs text-slate-500">{displayEmail}</p>
                    ) : null}
                    {isYou ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-peacock-700">
                        You
                      </span>
                    ) : null}
                  </div>
                </div>
              </td>
              <td className="px-2 py-3.5 text-xs font-semibold text-slate-600">
                {roleLabel(member.role)}
              </td>
              {CAPABILITY_KEYS.map((key) => (
                <td key={key} className="px-1.5 py-3.5 text-center">
                  <div className="flex justify-center">
                    <CapabilityAccessToggle
                      capability={key}
                      active={member.capabilities[key]}
                      disabled={busy || isDisabled}
                      onToggle={() =>
                        void onUpdateCapabilities(member.id, {
                          ...member.capabilities,
                          [key]: !member.capabilities[key],
                        })
                      }
                    />
                  </div>
                </td>
              ))}
              <td className="px-2 py-3.5">
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${
                    isDisabled
                      ? 'bg-rose-50 text-rose-700 ring-rose-100'
                      : 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                  }`}
                >
                  {isDisabled ? 'Disabled' : 'Active'}
                </span>
              </td>
              <td className="px-5 py-3.5 text-right sm:px-6">
                {!isYou && !isDisabled ? (
                  <div className="inline-flex flex-wrap justify-end gap-1.5">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onRequestRevokeAccess(member, displayEmail)}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-50 disabled:opacity-60"
                    >
                      <UserMinus className="h-3 w-3" aria-hidden />
                      Revoke access
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onRequestRemove(member, displayEmail)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                    >
                      <UserX className="h-3 w-3" aria-hidden />
                      Remove
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
