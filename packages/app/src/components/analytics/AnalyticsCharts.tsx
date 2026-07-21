import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { OrgAnalyticsSummary } from '@/types/analytics';

interface AnalyticsChartsProps {
  summary: OrgAnalyticsSummary;
}

const AREA_COLOR = '#0891b2';
const REFERRER_COLORS = ['#0891b2', '#7c3aed', '#0e7490', '#6366f1', '#14b8a6'];

function formatDayTick(day: string): string {
  const parts = day.split('-');
  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : day;
}

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/50">
    <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
    <div className="h-56 w-full">{children}</div>
  </div>
);

export const AnalyticsCharts = ({ summary }: AnalyticsChartsProps) => {
  const referrerData = summary.topReferrers.map((entry) => ({
    name: entry.referrerDomain,
    count: entry.count,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Views over time">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={summary.daily} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={AREA_COLOR} stopOpacity={0.35} />
                <stop offset="95%" stopColor={AREA_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="day"
              tickFormatter={formatDayTick}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              labelFormatter={(label) => `Day ${formatDayTick(String(label))}`}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke={AREA_COLOR}
              strokeWidth={2}
              fill="url(#viewsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top referrer domains">
        {referrerData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No referral traffic yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={referrerData}
              layout="vertical"
              margin={{ top: 4, right: 12, bottom: 0, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {referrerData.map((entry, index) => (
                  <Cell key={entry.name} fill={REFERRER_COLORS[index % REFERRER_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
};
