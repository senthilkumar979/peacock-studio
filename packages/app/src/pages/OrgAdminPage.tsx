import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Activity, BarChart3, Users, UsersRound } from 'lucide-react';
import { OrgAdminActivityTab } from '@/components/org-admin/OrgAdminActivityTab';
import { OrgAdminGroupsPanel } from '@/components/org-admin/OrgAdminGroupsPanel';
import { OrgAdminMembersPanel } from '@/components/org-admin/OrgAdminMembersPanel';
import { OrgAdminOverviewTab } from '@/components/org-admin/OrgAdminOverviewTab';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { DASHBOARD_PATH } from '@/constants/routes';
import { useActiveOrganization, useCloudAuthContext } from '@/hooks/useOrganization';
import { useSessionMode } from '@/hooks/useSessionMode';
import { notifyWarning } from '@/utils/notify';

type AdminTab = 'overview' | 'members' | 'groups' | 'activity';

export const OrgAdminPage = () => {
  const sessionMode = useSessionMode();
  const context = useCloudAuthContext();
  const { isAdmin, organizationId, organizationName } = useActiveOrganization();
  const [tab, setTab] = useState<AdminTab>('overview');
  const isTeam = context?.workspaceType === 'team';
  const deniedNotified = useRef(false);

  const isDenied =
    sessionMode !== 'loading' &&
    sessionMode !== 'connecting' &&
    (sessionMode !== 'cloud' || !isAdmin || !organizationId);

  useEffect(() => {
    if (!isDenied || deniedNotified.current) return;
    deniedNotified.current = true;
    notifyWarning(
      'Admin access required',
      'Only organization admins can open workspace settings.',
    );
  }, [isDenied]);

  if (sessionMode === 'loading' || sessionMode === 'connecting') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <PeacockStudioLoader size={96} />
      </div>
    );
  }

  if (isDenied || !organizationId) {
    return <Navigate to={DASHBOARD_PATH} replace />;
  }

  const tabs = (
    [
      { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
      { id: 'members' as const, label: 'Members', icon: Users },
      ...(isTeam
        ? [{ id: 'groups' as const, label: 'Groups', icon: UsersRound }]
        : []),
      { id: 'activity' as const, label: 'Activity', icon: Activity },
    ] as const
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-peacock-700">Organization admin</p>
          <h1 className="text-2xl font-bold text-slate-900">{organizationName}</h1>
        </div>
        <Link
          to={DASHBOARD_PATH}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to library
        </Link>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/80">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === id
                ? 'bg-white text-peacock-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <OrgAdminOverviewTab
          organizationId={organizationId}
          onOpenMembers={() => setTab('members')}
          onOpenActivity={() => setTab('activity')}
        />
      ) : null}
      {tab === 'members' && context ? (
        <OrgAdminMembersPanel
          organizationId={organizationId}
          organizationName={organizationName ?? 'Organization'}
          workspaceType={context.workspaceType === 'team' ? 'team' : 'personal'}
          inviterName={context.userDisplayName}
          currentClerkUserId={context.clerkUserId}
          currentUserEmail={context.userEmail}
          currentUserDisplayName={context.userDisplayName}
        />
      ) : null}
      {tab === 'groups' && isTeam ? (
        <OrgAdminGroupsPanel organizationId={organizationId} />
      ) : null}
      {tab === 'activity' ? <OrgAdminActivityTab organizationId={organizationId} /> : null}
    </div>
  );
};
