import { useEffect, useState } from 'react';
import { OrgContributorLeaders } from '@/components/org-admin/OrgContributorLeaders';
import { OrgDomainUsageTable } from '@/components/org-admin/OrgDomainUsageTable';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import {
  fetchOrgAdminActivity,
  fetchOrgDomainUsage,
  type OrgAdminActivity,
  type OrgDomainUsageRow,
} from '@/cloud/repositories/organizationRepository';
import { reportAppError } from '@/utils/appError';
import { notifyError } from '@/utils/notify';

const ACTIVITY_DAYS = 30;

interface OrgAdminActivityTabProps {
  organizationId: string;
}

export const OrgAdminActivityTab = ({ organizationId }: OrgAdminActivityTabProps) => {
  const [activity, setActivity] = useState<OrgAdminActivity | null>(null);
  const [domains, setDomains] = useState<OrgDomainUsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [activityData, domainData] = await Promise.all([
          fetchOrgAdminActivity(organizationId, ACTIVITY_DAYS),
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Members', value: activity.memberCount },
          { label: 'Documents', value: activity.documentCount },
          { label: 'Tours', value: activity.tourCount },
          { label: 'Exports (30d)', value: activity.exportCount },
          { label: 'Shares (30d)', value: activity.shareCount },
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

      <OrgContributorLeaders activity={activity} days={ACTIVITY_DAYS} />
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
    </div>
  );
};
