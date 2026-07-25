import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HealthCheckMethodDetails } from '@/components/health/HealthCheckMethodDetails';
import { HealthStatusBadge } from '@/components/health/HealthStatusBadge';
import { getHealthCheckMethod } from '@/utils/health/healthCheckMethods';
import type { HealthCheckResult } from '@/types/health';

interface HealthCheckRowProps {
  check: HealthCheckResult;
  href?: string;
}

export const HealthCheckRow = ({ check, href }: HealthCheckRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();
  const method = getHealthCheckMethod(check.id);
  const canExpand = Boolean(method);

  return (
    <li className="border-b border-slate-100 last:border-b-0">
      <div className="flex items-start gap-2 px-4 py-3">
        {canExpand ? (
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={panelId}
            onClick={() => setIsExpanded((open) => !open)}
            className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={isExpanded ? `Hide method for ${check.label}` : `Show method for ${check.label}`}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
              aria-hidden
            />
          </button>
        ) : (
          <span className="mt-0.5 h-7 w-7 shrink-0" aria-hidden />
        )}

        <div className="min-w-0 flex-1">
          <button
            type="button"
            disabled={!canExpand}
            aria-expanded={canExpand ? isExpanded : undefined}
            aria-controls={canExpand ? panelId : undefined}
            onClick={() => {
              if (canExpand) setIsExpanded((open) => !open);
            }}
            className={`w-full text-left ${canExpand ? '' : 'cursor-default'}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{check.label}</p>
              <HealthStatusBadge status={check.status} />
            </div>
            <p className="mt-1 text-sm text-slate-600">{check.detail}</p>
          </button>

          {href ? (
            <Link
              to={href}
              className="mt-1 inline-block text-xs font-medium text-peacock-700 hover:text-peacock-800"
            >
              Open page →
            </Link>
          ) : null}

          {isExpanded && method ? (
            <div id={panelId}>
              <HealthCheckMethodDetails method={method} />
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
};
