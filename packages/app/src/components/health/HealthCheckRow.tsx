import { Link } from 'react-router-dom';
import { HealthStatusBadge } from '@/components/health/HealthStatusBadge';
import type { HealthCheckResult } from '@/types/health';

interface HealthCheckRowProps {
  check: HealthCheckResult;
  href?: string;
}

export const HealthCheckRow = ({ check, href }: HealthCheckRowProps) => (
  <li className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-slate-900">{check.label}</p>
        <HealthStatusBadge status={check.status} />
      </div>
      <p className="mt-1 text-sm text-slate-600">{check.detail}</p>
      {href ? (
        <Link
          to={href}
          className="mt-1 inline-block text-xs font-medium text-peacock-700 hover:text-peacock-800"
        >
          Open page →
        </Link>
      ) : null}
    </div>
  </li>
);
