import { Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SavedFlowSummary } from '@/types/savedFlow';
import { useLibraryNavigationState } from '@/hooks/useLibraryBackState';
import { formatFlowDate } from '@/utils/formatFlowDate';
import { getDocumentPath } from '@/utils/shareLink';
import { FlowDocumentActions } from './FlowDocumentActions';
import { FlowStatusBadge } from './FlowStatusBadge';
import { FlowStepCountBadge } from './FlowStepCountBadge';
import { FlowVersionBadge } from './FlowVersionBadge';

interface FlowLibraryListProps {
  summaries: SavedFlowSummary[];
  displayNamesByEmail?: Record<string, string>;
  onRequestDelete: (summary: SavedFlowSummary) => void;
  onRequestDuplicate?: (summary: SavedFlowSummary) => void;
}

export const FlowLibraryList = ({
  summaries,
  onRequestDelete,
  onRequestDuplicate,
}: FlowLibraryListProps) => {
  const navigationState = useLibraryNavigationState();

  return (
  <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    {summaries.map((summary) => (
      <li
        key={summary.id}
        className="flex flex-col gap-4 p-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 inline-flex rounded-lg bg-peacock-50 p-2 text-peacock-600 ring-1 ring-peacock-100">
            <FileText className="h-4 w-4" aria-hidden />
          </span>
          <Link
            to={getDocumentPath(summary.id)}
            state={navigationState}
            className="group min-w-0 flex-1 rounded-lg outline-none ring-peacock-500 focus-visible:ring-2"
          >
            <p className="truncate font-semibold text-slate-900 transition-colors group-hover:text-peacock-700">
              {summary.title}
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-2">
              <FlowStatusBadge status={summary.status} />
              <FlowVersionBadge version={summary.version} />
              <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                {formatFlowDate(summary.generatedAt)}
              </span>
              <FlowStepCountBadge stepCount={summary.stepCount} />
            </p>
          </Link>
        </div>
        <div className="shrink-0 sm:ml-4">
          <FlowDocumentActions
            documentId={summary.id}
            status={summary.status}
            layout="row"
            onRequestDelete={() => onRequestDelete(summary)}
            onRequestDuplicate={
              onRequestDuplicate ? () => onRequestDuplicate(summary) : undefined
            }
          />
        </div>
      </li>
    ))}
  </ul>
  );
};
