import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Activity, BarChart3, Users } from 'lucide-react';
import { OrgAdminActivityTab } from '@/components/org-admin/OrgAdminActivityTab';
import { OrgAdminMembersPanel } from '@/components/org-admin/OrgAdminMembersPanel';
import { OrgAdminOverviewTab } from '@/components/org-admin/OrgAdminOverviewTab';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { DASHBOARD_PATH } from '@/constants/routes';
import { useActiveOrganization, useCloudAuthContext } from '@/hooks/useOrganization';
import { useSessionMode } from '@/hooks/useSessionMode';

type AdminTab = 'overview' | 'members' | 'activity';

export const OrgAdminPage = () => {
  const sessionMode = useSessionMode();
  const context = useCloudAuthContext();
  const { isAdmin, organizationId, organizationName } = useActiveOrganization();
  const [tab, setTab] = useState<AdminTab>('overview');

  if (sessionMode === 'loading' || sessionMode === 'connecting') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <PeacockStudioLoader size={96} />
      </div>
    );
  }

  if (sessionMode !== 'cloud' || !isAdmin || !organizationId) {
    return <Navigate to={DASHBOARD_PATH} replace />;
  }

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
        {(
          [
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'activity', label: 'Activity', icon: Activity },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
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

      {tab === 'overview' ? <OrgAdminOverviewTab organizationId={organizationId} /> : null}
      {tab === 'members' && context ? (
        <OrgAdminMembersPanel
          organizationId={organizationId}
          organizationName={organizationName ?? 'Organization'}
          workspaceType={context.workspaceType === 'team' ? 'team' : 'personal'}
          inviterName={context.userDisplayName}
          currentClerkUserId={context.clerkUserId}
        />
      ) : null}
      {tab === 'activity' ? <OrgAdminActivityTab organizationId={organizationId} /> : null}
    </div>
  );
};
