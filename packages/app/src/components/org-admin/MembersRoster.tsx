import { Shield, UserMinus, UserRound } from 'lucide-react';
import type {
  MemberCapabilities,
  OrganizationMemberRecord,
} from '@/cloud/types/organization';
import { CapabilityChipGrid } from '@/components/org-admin/CapabilityChipGrid';
import { memberInitials, roleLabel } from '@/components/org-admin/memberAdminHelpers';

interface MembersRosterProps {
  members: OrganizationMemberRecord[];
  currentClerkUserId: string;
  busy: boolean;
  onUpdateCapabilities: (memberId: string, capabilities: MemberCapabilities) => Promise<void>;
  onDisable: (memberId: string) => Promise<void>;
}

export const MembersRoster = ({
  members,
  currentClerkUserId,
  busy,
  onUpdateCapabilities,
  onDisable,
}: MembersRosterProps) => {
  const active = members.filter((m) => m.status === 'active');
  const disabled = members.filter((m) => m.status === 'disabled');

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

      <ul className="divide-y divide-slate-100">
        {members.map((member) => {
          const isYou = member.clerkUserId === currentClerkUserId;
          const isAdmin = member.role === 'admin';
          const isDisabled = member.status === 'disabled';

          return (
            <li
              key={member.id}
              className={`px-5 py-5 sm:px-6 ${isDisabled ? 'bg-slate-50/70 opacity-80' : ''}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${
                      isAdmin
                        ? 'bg-gradient-to-br from-peacock-500 to-peacock-700 shadow-peacock-500/25'
                        : 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-500/20'
                    }`}
                  >
                    {memberInitials(member.email)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-slate-900">{member.email}</p>
                      {isYou ? (
                        <span className="rounded-full bg-peacock-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-peacock-700 ring-1 ring-peacock-100">
                          You
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
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
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${
                          isDisabled
                            ? 'bg-rose-50 text-rose-700 ring-rose-100'
                            : 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                        }`}
                      >
                        {isDisabled ? 'Disabled' : 'Active'}
                      </span>
                      {member.joinedAt ? (
                        <span className="text-[11px] text-slate-400">
                          Joined{' '}
                          {new Date(member.joinedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {!isYou && !isDisabled ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onDisable(member.id)}
                    className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:opacity-60"
                  >
                    <UserMinus className="h-3.5 w-3.5" aria-hidden />
                    Disable access
                  </button>
                ) : null}
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
            </li>
          );
        })}
      </ul>
    </section>
  );
};
