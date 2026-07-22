import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Activity, BarChart3, Users } from 'lucide-react';
import { AnalyticsSummaryCards } from '@/components/analytics/AnalyticsSummaryCards';
import { OrgAdminMembersPanel } from '@/components/org-admin/OrgAdminMembersPanel';
import { OrgDomainUsageTable } from '@/components/org-admin/OrgDomainUsageTable';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import {
  fetchOrgAdminActivity,
  fetchOrgDomainUsage,
  type OrgAdminActivity,
  type OrgDomainUsageRow,
} from '@/cloud/repositories/organizationRepository';
import { DASHBOARD_PATH } from '@/constants/routes';
import { useOrgAnalytics } from '@/hooks/useOrgAnalytics';
import { useActiveOrganization, useCloudAuthContext } from '@/hooks/useOrganization';
import { useSessionMode } from '@/hooks/useSessionMode';
import { reportAppError } from '@/utils/appError';
import { notifyError } from '@/utils/notify';

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

      {tab === 'overview' ? <OverviewTab /> : null}
      {tab === 'members' && context ? (
        <OrgAdminMembersPanel
          organizationId={organizationId}
          organizationName={organizationName ?? 'Organization'}
          inviterName={context.userDisplayName}
          currentClerkUserId={context.clerkUserId}
        />
      ) : null}
      {tab === 'activity' ? <ActivityTab organizationId={organizationId} /> : null}
    </div>
  );
};

const OverviewTab = () => {
  const { summary, isLoading } = useOrgAnalytics(30);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <PeacockStudioLoader size={80} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnalyticsSummaryCards summary={summary} avgViewsPerDoc={0} />
    </div>
  );
};

const ActivityTab = ({ organizationId }: { organizationId: string }) => {
  const [activity, setActivity] = useState<OrgAdminActivity | null>(null);
  const [domains, setDomains] = useState<OrgDomainUsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [activityData, domainData] = await Promise.all([
          fetchOrgAdminActivity(organizationId, 30),
          fetchOrgDomainUsage(organizationId),
        ]);
        if (!cancelled) {
          setActivity(activityData);
          setDomains(domainData);
        }
      } catch (err) {
        const classified = reportAppError('Failed to load admin activity', err);
        if (!cancelled) {
          setError(classified.userMessage);
          notifyError(classified.title, classified.userMessage);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <PeacockStudioLoader size={80} />
      </div>
    );
  }

  if (error || !activity) {
    return <p className="text-sm text-red-600">{error ?? 'No activity data.'}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Members', value: activity.memberCount },
          { label: 'Documents', value: activity.documentCount },
          { label: 'Tours', value: activity.tourCount },
          { label: 'Exports (30d)', value: activity.exportCount },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <OrgDomainUsageTable rows={domains} />

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Events by user (30d)</h2>
        {activity.byActor.length === 0 ? (
          <p className="text-sm text-slate-500">No analytics events yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {activity.byActor.map((row) => (
              <li key={row.email} className="flex justify-between px-4 py-3 text-sm">
                <span className="font-medium text-slate-900">{row.displayName}</span>
                <span className="text-slate-500">{row.eventCount} events</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Documents by creator</h2>
        {activity.docsByCreator.length === 0 ? (
          <p className="text-sm text-slate-500">No documents yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {activity.docsByCreator.map((row) => (
              <li key={row.email} className="flex justify-between px-4 py-3 text-sm">
                <span className="font-medium text-slate-900">{row.displayName}</span>
                <span className="text-slate-500">{row.count} docs</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
