import { useEffect, useState } from 'react';
import { AnalyticsSummaryCards } from '@/components/analytics/AnalyticsSummaryCards';
import {
  OrgContributorLeaders,
  overviewLeaderHints,
} from '@/components/org-admin/OrgContributorLeaders';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import {
  fetchOrgAdminActivity,
  type OrgAdminActivity,
} from '@/cloud/repositories/organizationRepository';
import { useOrgAnalytics } from '@/hooks/useOrgAnalytics';
import { reportAppError } from '@/utils/appError';
import { notifyError } from '@/utils/notify';

const ACTIVITY_DAYS = 30;

interface OrgAdminOverviewTabProps {
  organizationId: string;
}

export const OrgAdminOverviewTab = ({ organizationId }: OrgAdminOverviewTabProps) => {
  const { summary, isLoading: summaryLoading } = useOrgAnalytics(ACTIVITY_DAYS);
  const [activity, setActivity] = useState<OrgAdminActivity | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setActivityLoading(true);
    void fetchOrgAdminActivity(organizationId, ACTIVITY_DAYS)
      .then((next) => {
        if (!cancelled) setActivity(next);
      })
      .catch((err) => {
        const classified = reportAppError('Failed to load contributor stats', err);
        if (!cancelled) notifyError(classified.title, classified.userMessage);
      })
      .finally(() => {
        if (!cancelled) setActivityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  if (summaryLoading || activityLoading) {
    return (
      <div className="flex justify-center py-12">
        <PeacockStudioLoader size={80} />
      </div>
    );
  }

  const leaders = activity ? overviewLeaderHints(activity) : {};
  const avgViewsPerDoc =
    activity && activity.documentCount > 0
      ? summary.totals.views / activity.documentCount
      : 0;

  return (
    <div className="space-y-8">
      <AnalyticsSummaryCards
        summary={summary}
        avgViewsPerDoc={avgViewsPerDoc}
        leaderHints={{
          pdfExports: leaders.exports ? `Top: ${leaders.exports}` : undefined,
          avgViews: leaders.docs ? `Most docs: ${leaders.docs}` : undefined,
        }}
      />
      {activity ? <OrgContributorLeaders activity={activity} days={ACTIVITY_DAYS} /> : null}
    </div>
  );
};
