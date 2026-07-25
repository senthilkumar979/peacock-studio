import { Shield, UserRound } from 'lucide-react';
import type {
  MemberCapabilities,
  OrganizationMemberRecord,
} from '@/cloud/types/organization';
import { CapabilityChipGrid } from '@/components/org-admin/CapabilityChipGrid';
import {
  memberInitialsFromIdentity,
  roleLabel,
} from '@/components/org-admin/memberAdminHelpers';

interface SoloMemberCardProps {
  member: OrganizationMemberRecord;
  displayName: string | null;
  displayEmail: string;
  currentClerkUserId: string;
  busy: boolean;
  onUpdateCapabilities: (memberId: string, capabilities: MemberCapabilities) => Promise<void>;
}

export const SoloMemberCard = ({
  member,
  displayName,
  displayEmail,
  currentClerkUserId,
  busy,
  onUpdateCapabilities,
}: SoloMemberCardProps) => {
  const isYou = member.clerkUserId === currentClerkUserId;
  const isAdmin = member.role === 'admin';
  const isDisabled = member.status === 'disabled';

  return (
    <div className={`px-5 py-5 sm:px-6 ${isDisabled ? 'bg-slate-50/70 opacity-80' : ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${
              isAdmin
                ? 'bg-gradient-to-br from-peacock-500 to-peacock-700 shadow-peacock-500/25'
                : 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-500/20'
            }`}
          >
            {memberInitialsFromIdentity(displayName, displayEmail)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold text-slate-900">
                {displayName ?? displayEmail}
              </p>
              {isYou ? (
                <span className="rounded-full bg-peacock-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-peacock-700 ring-1 ring-peacock-100">
                  You
                </span>
              ) : null}
            </div>
            {displayName ? (
              <p className="mt-0.5 truncate text-sm text-slate-500">{displayEmail}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:shrink-0">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
              isAdmin
                ? 'bg-peacock-50 text-peacock-800 ring-peacock-100'
                : 'bg-slate-100 text-slate-600 ring-slate-200'
            }`}
          >
            {isAdmin ? (
              <Shield className="h-3 w-3" aria-hidden />
            ) : (
              <UserRound className="h-3 w-3" aria-hidden />
            )}
            {roleLabel(member.role)}
          </span>
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
            Active
          </span>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Capabilities
        </p>
        <CapabilityChipGrid
          value={member.capabilities}
          disabled={busy || isDisabled}
          onChange={(next) => void onUpdateCapabilities(member.id, next)}
        />
      </div>
    </div>
  );
};
