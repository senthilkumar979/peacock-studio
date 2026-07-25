import { HealthStatusBadge } from '@/components/health/HealthStatusBadge';
import type { HealthCheckResult, HealthStatus } from '@/types/health';

interface HealthOverviewPanelProps {
  results: HealthCheckResult[];
  isRunning: boolean;
  ranAt: number | null;
}

function summarize(results: HealthCheckResult[]): Record<HealthStatus, number> {
  return results.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0, skip: 0, checking: 0 } as Record<HealthStatus, number>,
  );
}

function overallStatus(results: HealthCheckResult[], isRunning: boolean): HealthStatus {
  if (isRunning) return 'checking';
  if (results.some((r) => r.status === 'fail')) return 'fail';
  if (results.some((r) => r.status === 'warn')) return 'warn';
  if (results.length === 0) return 'skip';
  return 'pass';
}

export const HealthOverviewPanel = ({
  results,
  isRunning,
  ranAt,
}: HealthOverviewPanelProps) => {
  const counts = summarize(results);
  const overall = overallStatus(results, isRunning);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-bold text-slate-900">Overall status</h2>
          <HealthStatusBadge status={overall} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {ranAt
            ? `Last run ${new Date(ranAt).toLocaleString()}`
            : 'Run checks to see connection and page health.'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:px-5">
        {(
          [
            { key: 'pass', label: 'Passing' },
            { key: 'warn', label: 'Warnings' },
            { key: 'fail', label: 'Failures' },
            { key: 'skip', label: 'Skipped' },
          ] as const
        ).map(({ key, label }) => (
          <div
            key={key}
            className="rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200/80"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{counts[key]}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
