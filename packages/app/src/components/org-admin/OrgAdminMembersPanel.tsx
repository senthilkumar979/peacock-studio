import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserPlus, Users } from 'lucide-react';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { InviteMemberForm } from '@/components/org-admin/InviteMemberForm';
import { MembersRoster } from '@/components/org-admin/MembersRoster';
import { PendingInvitesSection } from '@/components/org-admin/PendingInvitesSection';
import { refreshCloudMemberships } from '@/components/auth/CloudSyncProvider';
import {
  createOrganizationInvitation,
  listOrganizationInvitations,
  listOrganizationMembers,
  resendOrganizationInvitation,
  revokeOrganizationInvitation,
  sendOrgInviteEmail,
  setMemberStatus,
  updateMemberCapabilities,
} from '@/cloud/repositories/organizationRepository';
import type {
  MemberCapabilities,
  MemberRole,
  OrganizationInvitationRecord,
  OrganizationMemberRecord,
} from '@/cloud/types/organization';
import { reportAppError } from '@/utils/appError';
import { notifyError, notifyPromise } from '@/utils/notify';
import { AnalyticsEvents } from '@/analytics/events';

interface OrgAdminMembersPanelProps {
  organizationId: string;
  organizationName: string;
  inviterName: string;
  currentClerkUserId: string;
}

export const OrgAdminMembersPanel = ({
  organizationId,
  organizationName,
  inviterName,
  currentClerkUserId,
}: OrgAdminMembersPanelProps) => {
  const [members, setMembers] = useState<OrganizationMemberRecord[]>([]);
  const [invites, setInvites] = useState<OrganizationInvitationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [memberRows, inviteRows] = await Promise.all([
        listOrganizationMembers(organizationId),
        listOrganizationInvitations(organizationId),
      ]);
      setMembers(memberRows);
      setInvites(inviteRows);
      setError(null);
    } catch (err) {
      const classified = reportAppError('Failed to load members', err);
      setError(classified.userMessage);
      notifyError(classified.title, classified.userMessage);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const activeCount = members.filter((m) => m.status === 'active').length;
  const adminCount = members.filter((m) => m.status === 'active' && m.role === 'admin').length;

  const runBusy = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await reload();
    } catch (err) {
      const classified = reportAppError('Members action failed', err);
      setError(classified.userMessage);
      // Soft actions should toast themselves (notifyPromise / notifyError).
      // Avoid double toasts here.
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <PeacockStudioLoader size={80} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Active members',
            value: activeCount,
            icon: Users,
            accent: 'from-peacock-500 to-peacock-700',
          },
          {
            label: 'Pending invites',
            value: invites.length,
            icon: UserPlus,
            accent: 'from-amber-500 to-orange-600',
          },
          {
            label: 'Admins',
            value: adminCount,
            icon: Shield,
            accent: 'from-brand-violet to-peacock-700',
          },
        ].map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
          >
            <div
              aria-hidden
              className={`absolute -right-5 -top-5 h-20 w-20 rounded-full bg-gradient-to-br ${accent} opacity-10`}
            />
            <span
              className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${accent} p-2 text-white shadow-md`}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <p
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <InviteMemberForm
        busy={busy}
        onInvite={async (input: {
          email: string;
          role: MemberRole;
          capabilities: MemberCapabilities;
        }) => {
          await runBusy(async () => {
            await notifyPromise(
              (async () => {
                const created = await createOrganizationInvitation({
                  organizationId,
                  email: input.email,
                  role: input.role,
                  capabilities: input.capabilities,
                });
                await sendOrgInviteEmail({
                  toEmail: created.email,
                  organizationName,
                  inviterName,
                  inviteToken: created.token,
                  expiresAt: created.expiresAt,
                });
                return created;
              })(),
              {
                loading: 'Sending invitation…',
                success: 'Invitation sent',
                successDescription: `Invite emailed to ${input.email.trim().toLowerCase()} (expires in 7 days).`,
                context: 'Create organization invitation',
                event: AnalyticsEvents.memberInvited,
                eventProps: { organization_id: organizationId, role: input.role },
              },
            );
          });
        }}
      />

      <PendingInvitesSection
        invites={invites}
        busy={busy}
        onResend={async (inviteId) => {
          await runBusy(async () => {
            await notifyPromise(
              (async () => {
                const resent = await resendOrganizationInvitation(inviteId);
                await sendOrgInviteEmail({
                  toEmail: resent.email,
                  organizationName,
                  inviterName,
                  inviteToken: resent.token,
                  expiresAt: resent.expiresAt,
                });
                return resent;
              })(),
              {
                loading: 'Resending invitation…',
                success: 'Invitation resent',
                successDescription: 'Expiry reset to 7 days from now.',
                context: 'Resend organization invitation',
                event: AnalyticsEvents.memberInviteResent,
                eventProps: { organization_id: organizationId },
              },
            );
          });
        }}
        onRevoke={async (inviteId) => {
          await runBusy(async () => {
            await notifyPromise(revokeOrganizationInvitation(inviteId), {
              loading: 'Revoking invitation…',
              success: 'Invitation revoked',
              context: 'Revoke organization invitation',
              event: AnalyticsEvents.memberInviteRevoked,
              eventProps: { organization_id: organizationId },
            });
          });
        }}
      />

      <MembersRoster
        members={members}
        currentClerkUserId={currentClerkUserId}
        busy={busy}
        onUpdateCapabilities={async (memberId, capabilities) => {
          await runBusy(async () => {
            await notifyPromise(updateMemberCapabilities(memberId, capabilities), {
              loading: 'Updating permissions…',
              success: 'Permissions updated',
              context: 'Update member capabilities',
              event: AnalyticsEvents.memberCapabilitiesUpdated,
              eventProps: { organization_id: organizationId, member_id: memberId },
            });
            const member = members.find((m) => m.id === memberId);
            if (member?.clerkUserId === currentClerkUserId) {
              await refreshCloudMemberships(organizationId);
            }
          });
        }}
        onDisable={async (memberId) => {
          await runBusy(async () => {
            await notifyPromise(
              setMemberStatus(memberId, 'disabled').then(() =>
                refreshCloudMemberships(organizationId),
              ),
              {
                loading: 'Disabling member…',
                success: 'Member disabled',
                context: 'Disable organization member',
                event: AnalyticsEvents.memberStatusUpdated,
                eventProps: {
                  organization_id: organizationId,
                  member_id: memberId,
                  status: 'disabled',
                },
              },
            );
          });
        }}
      />
    </motion.div>
  );
};
