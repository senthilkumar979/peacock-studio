import { useState } from 'react';
import { Clock3, RefreshCw, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { OrganizationInvitationRecord } from '@/cloud/types/organization';
import {
  formatInviteCountdown,
  memberInitials,
  roleLabel,
} from '@/components/org-admin/memberAdminHelpers';

interface PendingInvitesSectionProps {
  invites: OrganizationInvitationRecord[];
  busy: boolean;
  onResend: (inviteId: string) => Promise<void>;
  onRevoke: (inviteId: string) => Promise<void>;
}

const urgencyStyles = {
  ok: {
    bar: 'bg-peacock-500',
    badge: 'bg-peacock-50 text-peacock-700 ring-peacock-100',
  },
  soon: {
    bar: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-800 ring-amber-100',
  },
  critical: {
    bar: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 ring-rose-100',
  },
  expired: {
    bar: 'bg-slate-300',
    badge: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
} as const;

export const PendingInvitesSection = ({
  invites,
  busy,
  onResend,
  onRevoke,
}: PendingInvitesSectionProps) => {
  const [revokeTarget, setRevokeTarget] = useState<OrganizationInvitationRecord | null>(null);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex rounded-lg bg-amber-50 p-2 text-amber-700 ring-1 ring-amber-100">
            <Clock3 className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Pending invitations</h2>
            <p className="text-xs text-slate-500">Awaiting acceptance · auto-expire in 7 days</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {invites.length}
        </span>
      </div>

      {invites.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No open invitations</p>
          <p className="mt-1 text-xs text-slate-500">
            New invites appear here until they are accepted or revoked.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {invites.map((invite) => {
            const countdown = formatInviteCountdown(invite.expiresAt);
            const styles = urgencyStyles[countdown.urgency];
            return (
              <li
                key={invite.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                    {memberInitials(invite.email)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{invite.email}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        {roleLabel(invite.role)}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${styles.badge}`}
                      >
                        {countdown.label}
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${styles.bar}`}
                        style={{ width: `${Math.round(countdown.progress * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onResend(invite.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-peacock-200 hover:bg-peacock-50/50 hover:text-peacock-800 disabled:opacity-60"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                    Resend
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setRevokeTarget(invite)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:opacity-60"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                    Revoke
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        isOpen={Boolean(revokeTarget)}
        title="Revoke invitation?"
        description={
          revokeTarget
            ? `Revoke the pending invite for ${revokeTarget.email}? They will no longer be able to join with this link.`
            : undefined
        }
        confirmLabel="Revoke invite"
        isDestructive
        onCancel={() => setRevokeTarget(null)}
        onConfirm={() => {
          if (!revokeTarget) return;
          const id = revokeTarget.id;
          setRevokeTarget(null);
          void onRevoke(id);
        }}
      />
    </section>
  );
};
