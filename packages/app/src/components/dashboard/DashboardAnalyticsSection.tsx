import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { AnalyticsSummaryCards } from '@/components/analytics/AnalyticsSummaryCards';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { useOrgAnalytics } from '@/hooks/useOrgAnalytics';

// Recharts is heavy and below the fold — load it only when analytics render.
const AnalyticsCharts = lazy(() =>
  import('@/components/analytics/AnalyticsCharts').then((module) => ({
    default: module.AnalyticsCharts,
  })),
);

interface DashboardAnalyticsSectionProps {
  documentCount: number;
}

export const DashboardAnalyticsSection = ({ documentCount }: DashboardAnalyticsSectionProps) => {
  const { summary, isLoading, isAvailable, error } = useOrgAnalytics(30);

  // Local-only sessions have no cloud analytics; hide the section entirely.
  if (!isAvailable) return null;

  const avgViewsPerDoc = documentCount > 0 ? summary.totals.views / documentCount : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="space-y-4"
      aria-label="Engagement analytics"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex rounded-lg bg-peacock-50 p-1.5 text-peacock-700 ring-1 ring-peacock-100">
          <BarChart3 className="h-4 w-4" aria-hidden />
        </span>
        <h2 className="text-lg font-semibold text-slate-900">Engagement analytics</h2>
        <span className="text-xs text-slate-400">Last 30 days</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <PeacockStudioLoader size={80} />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </p>
      ) : (
        <>
          <AnalyticsSummaryCards summary={summary} avgViewsPerDoc={avgViewsPerDoc} />
          <Suspense
            fallback={
              <div className="flex justify-center py-10">
                <PeacockStudioLoader size={80} />
              </div>
            }
          >
            <AnalyticsCharts summary={summary} />
          </Suspense>
        </>
      )}
    </motion.section>
  );
};
