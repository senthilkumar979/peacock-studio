import { Calendar, FileText, Layers } from 'lucide-react';
import type { SavedFlowSummary } from '@/types/savedFlow';
import { formatFlowDate } from '@/utils/formatFlowDate';
import { FlowDocumentActions } from './FlowDocumentActions';

interface FlowLibraryListProps {
  summaries: SavedFlowSummary[];
  onRequestDelete: (summary: SavedFlowSummary) => void;
}

export const FlowLibraryList = ({ summaries, onRequestDelete }: FlowLibraryListProps) => (
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
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{summary.title}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                {formatFlowDate(summary.generatedAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                {summary.stepCount} steps
              </span>
            </p>
          </div>
        </div>
        <FlowDocumentActions
          documentId={summary.id}
          onRequestDelete={() => onRequestDelete(summary)}
        />
      </li>
    ))}
  </ul>
);
