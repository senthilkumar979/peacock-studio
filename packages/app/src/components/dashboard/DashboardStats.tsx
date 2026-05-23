import type { DashboardStats as DashboardStatsModel } from '@/utils/dashboardStats';

interface DashboardStatsProps {
  stats: DashboardStatsModel;
}

const STAT_ITEMS: { key: keyof DashboardStatsModel; label: string }[] = [
  { key: 'totalDocuments', label: 'Total documentations' },
  { key: 'totalThisWeek', label: 'Created this week' },
  { key: 'totalThisMonth', label: 'Created this month' },
  { key: 'totalStepsDocumented', label: 'Steps documented' },
  { key: 'averageStepsPerDocument', label: 'Avg steps per doc' },
];

export const DashboardStats = ({ stats }: DashboardStatsProps) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
    {STAT_ITEMS.map((item) => (
      <div
        key={item.key}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-900/5"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-peacock-600">{item.label}</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{stats[item.key]}</p>
      </div>
    ))}
  </div>
);
