import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserPlus, Users } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { InviteMemberForm } from '@/components/org-admin/InviteMemberForm';
import { MembersRoster } from '@/components/org-admin/MembersRoster';
import { PendingInvitesSection } from '@/components/org-admin/PendingInvitesSection';
import { refreshCloudMemberships } from '@/components/auth/CloudSyncProvider';
import {
  buildOrgInviteAcceptUrl,
  createOrganizationInvitation,
  InviteEmailNotConfiguredError,
  listOrganizationInvitations,
  listOrganizationMembers,
  removeOrganizationMember,
  resendOrganizationInvitation,
  revokeOrganizationInvitation,
  sendOrgInviteEmail,
  setMemberStatus,
  updateMemberCapabilities,
} from '@/cloud/repositories/organizationRepository';
import {
  fetchProfilesByClerkUserIds,
  type UserProfile,
} from '@/cloud/repositories/profileRepository';
import type {
  MemberCapabilities,
  MemberRole,
  OrganizationInvitationRecord,
  OrganizationMemberRecord,
  WorkspaceType,
} from '@/cloud/types/organization';
import { reportAppError } from '@/utils/appError';
import { notifyError, notifyPromise, notifySuccess, notifyWarning } from '@/utils/notify';
import { isOrgInvitesFeatureEnabled } from '@/analytics/featureFlags';
import { AnalyticsEvents } from '@/analytics/events';
import { trackEvent } from '@/analytics/analyticsClient';
import { copyTextToClipboard } from '@/utils/shareLink';

interface OrgAdminMembersPanelProps {
  organizationId: string;
  organizationName: string;
  workspaceType: WorkspaceType;
  inviterName: string;
  currentClerkUserId: string;
  currentUserEmail: string;
  currentUserDisplayName: string;
}

type MemberConfirm =
  | { kind: 'revoke'; member: OrganizationMemberRecord; displayEmail: string }
  | { kind: 'remove'; member: OrganizationMemberRecord; displayEmail: string }
  | null;

export const OrgAdminMembersPanel = ({
  organizationId,
  organizationName,
  workspaceType,
  inviterName,
  currentClerkUserId,
  currentUserEmail,
  currentUserDisplayName,
}: OrgAdminMembersPanelProps) => {
  const [members, setMembers] = useState<OrganizationMemberRecord[]>([]);
  const [invites, setInvites] = useState<OrganizationInvitationRecord[]>([]);
  const [profileByClerkId, setProfileByClerkId] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [memberConfirm, setMemberConfirm] = useState<MemberConfirm>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [memberRows, inviteRows] = await Promise.all([
        listOrganizationMembers(organizationId),
        listOrganizationInvitations(organizationId),
      ]);
      const profiles = await fetchProfilesByClerkUserIds(
        memberRows.map((row) => row.clerkUserId),
      );
      setMembers(memberRows);
      setInvites(inviteRows);
      setProfileByClerkId(profiles);
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
      throw err;
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

      {workspaceType === 'personal' ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Personal workspaces are single-user. Create or switch to a team workspace to invite
          members and manage roles.
        </div>
      ) : !isOrgInvitesFeatureEnabled() ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Team invitations are temporarily disabled.
        </div>
      ) : showInviteForm ? (
        <InviteMemberForm
          busy={busy}
          onCancel={() => setShowInviteForm(false)}
          onInvite={async (input: {
            email: string;
            role: MemberRole;
            capabilities: MemberCapabilities;
          }) => {
            await runBusy(async () => {
              const created = await createOrganizationInvitation({
                organizationId,
                email: input.email,
                role: input.role,
                capabilities: input.capabilities,
              });
              const inviteUrl = buildOrgInviteAcceptUrl(created.token);
              trackEvent(AnalyticsEvents.memberInvited, {
                organization_id: organizationId,
                role: input.role,
              });
              try {
                await sendOrgInviteEmail({
                  invitationId: created.id,
                  inviterName,
                });
                notifySuccess(
                  'Invitation sent',
                  `Invite emailed to ${created.email} (expires in 7 days).`,
                );
              } catch (emailError) {
                await copyTextToClipboard(inviteUrl);
                if (emailError instanceof InviteEmailNotConfiguredError) {
                  notifyWarning(
                    'Invite created — email not configured',
                    'Invite link copied. Send it manually to your teammate.',
                  );
                } else {
                  const detail =
                    emailError instanceof Error ? emailError.message : 'Unknown email error';
                  notifyWarning(
                    'Invite created — email failed',
                    `${detail} Invite link copied — share it manually.`,
                  );
                  reportAppError('Send invite email', emailError);
                }
              }
              setShowInviteForm(false);
            });
          }}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-900">Invite teammates</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Send a 7-day invitation with role and permissions.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowInviteForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-peacock-600 to-peacock-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-peacock-600/20 transition hover:brightness-105 disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Invite
          </button>
        </div>
      )}

      {workspaceType === 'team' ? (
        <PendingInvitesSection
          invites={invites}
          busy={busy}
          onResend={async (inviteId) => {
            await runBusy(async () => {
              const resent = await resendOrganizationInvitation(inviteId);
              const inviteUrl = buildOrgInviteAcceptUrl(resent.token);
              trackEvent(AnalyticsEvents.memberInviteResent, {
                organization_id: organizationId,
              });
              try {
                await sendOrgInviteEmail({
                  invitationId: resent.id,
                  inviterName,
                });
                notifySuccess('Invitation resent', 'Expiry reset to 7 days from now.');
              } catch (emailError) {
                await copyTextToClipboard(inviteUrl);
                if (emailError instanceof InviteEmailNotConfiguredError) {
                  notifyWarning(
                    'Invite updated — email not configured',
                    'Invite link copied. Send it manually.',
                  );
                } else {
                  const detail =
                    emailError instanceof Error ? emailError.message : 'Unknown email error';
                  notifyWarning(
                    'Invite updated — email failed',
                    `${detail} Invite link copied — share it manually.`,
                  );
                  reportAppError('Resend invite email', emailError);
                }
              }
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
      ) : null}

      <MembersRoster
        members={members}
        profileByClerkId={profileByClerkId}
        currentClerkUserId={currentClerkUserId}
        currentUserEmail={currentUserEmail}
        currentUserDisplayName={currentUserDisplayName}
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
        onRequestRevokeAccess={(member, displayEmail) =>
          setMemberConfirm({ kind: 'revoke', member, displayEmail })
        }
        onRequestRemove={(member, displayEmail) =>
          setMemberConfirm({ kind: 'remove', member, displayEmail })
        }
      />

      <ConfirmDialog
        isOpen={Boolean(memberConfirm)}
        title={
          memberConfirm?.kind === 'remove' ? 'Remove from organization?' : 'Revoke access?'
        }
        description={
          memberConfirm?.kind === 'remove'
            ? `Remove ${memberConfirm.displayEmail} from this organization? They will lose access immediately.`
            : memberConfirm
              ? `Revoke access for ${memberConfirm.displayEmail}? They will no longer be able to use this workspace until re-enabled.`
              : undefined
        }
        confirmLabel={memberConfirm?.kind === 'remove' ? 'Remove member' : 'Revoke access'}
        isDestructive
        onCancel={() => setMemberConfirm(null)}
        onConfirm={() => {
          if (!memberConfirm) return;
          const target = memberConfirm;
          setMemberConfirm(null);
          void runBusy(async () => {
            if (target.kind === 'remove') {
              await notifyPromise(
                removeOrganizationMember(target.member.id).then(() =>
                  refreshCloudMemberships(organizationId),
                ),
                {
                  loading: 'Removing member…',
                  success: 'Member removed',
                  context: 'Remove organization member',
                  event: AnalyticsEvents.memberStatusUpdated,
                  eventProps: {
                    organization_id: organizationId,
                    member_id: target.member.id,
                    status: 'removed',
                  },
                },
              );
              return;
            }
            await notifyPromise(
              setMemberStatus(target.member.id, 'disabled').then(() =>
                refreshCloudMemberships(organizationId),
              ),
              {
                loading: 'Revoking access…',
                success: 'Access revoked',
                context: 'Disable organization member',
                event: AnalyticsEvents.memberStatusUpdated,
                eventProps: {
                  organization_id: organizationId,
                  member_id: target.member.id,
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
