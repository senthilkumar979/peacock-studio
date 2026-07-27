import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSuperAdminAcquisition } from '@/hooks/useSuperAdminAcquisition';

const SOURCE_COLORS = ['#0891b2', '#7c3aed', '#0e7490', '#6366f1', '#14b8a6'];

export const SuperAdminAcquisitionTab = () => {
  const { summary, isLoading, error, refresh } = useSuperAdminAcquisition(30);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-500">
        Loading acquisition data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <p className="text-sm font-medium text-rose-800">Could not load acquisition data</p>
        <p className="text-sm text-rose-700">{error}</p>
        <Button variant="secondary" size="sm" onClick={refresh}>
          <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden />
          Retry
        </Button>
      </div>
    );
  }

  const chartData = summary?.signupsBySource ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            Signups attributed by first-touch source over the last {summary?.days ?? 30} days.
          </p>
          {summary?.posthogProjectUrl ? (
            <a
              href={summary.posthogProjectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-peacock-700 hover:text-peacock-800"
            >
              Open full dashboard in PostHog
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
        </div>
        <Button variant="secondary" size="sm" onClick={refresh}>
          <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden />
          Refresh
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/50">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Signups by source</h3>
        {chartData.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            No attributed signups yet. Tag marketing links with UTMs and wait for workspace
            creation events.
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="source"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="signups" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.source}
                      fill={SOURCE_COLORS[index % SOURCE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-700">Top campaigns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Medium</th>
                <th className="px-5 py-3 font-medium">Campaign</th>
                <th className="px-5 py-3 font-medium text-right">Signups</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(summary?.topCampaigns ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    No campaign data yet.
                  </td>
                </tr>
              ) : (
                summary?.topCampaigns.map((row) => (
                  <tr key={`${row.source}-${row.medium}-${row.campaign}`}>
                    <td className="px-5 py-3 text-slate-800">{row.source}</td>
                    <td className="px-5 py-3 text-slate-600">{row.medium}</td>
                    <td className="px-5 py-3 text-slate-600">{row.campaign}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900">
                      {row.signups}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
