import { AlertTriangle } from 'lucide-react';
import type { RouteValidationIssue } from '@/types/route';

interface RouteValidationBannerProps {
  issues: RouteValidationIssue[];
  onSelectNode: (nodeId: string) => void;
}

export const RouteValidationBanner = ({ issues, onSelectNode }: RouteValidationBannerProps) => {
  if (issues.length === 0) return null;

  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900">
            {errors.length > 0
              ? `${errors.length} error${errors.length === 1 ? '' : 's'} and ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`
              : `${warnings.length} route warning${warnings.length === 1 ? '' : 's'}`}
          </p>
          <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-sm text-amber-800">
            {issues.slice(0, 6).map((issue) => (
              <li key={issue.id}>
                {issue.nodeId ? (
                  <button
                    type="button"
                    onClick={() => onSelectNode(issue.nodeId!)}
                    className="text-left underline decoration-amber-400/60 underline-offset-2 hover:text-amber-950"
                  >
                    {issue.message}
                  </button>
                ) : (
                  issue.message
                )}
              </li>
            ))}
          </ul>
          {issues.length > 6 ? (
            <p className="mt-1 text-xs text-amber-700">+ {issues.length - 6} more</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
