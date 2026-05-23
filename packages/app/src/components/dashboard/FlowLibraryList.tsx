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
      <li key={summary.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{summary.title}</p>
          <p className="mt-1 text-sm text-slate-500">
            {formatFlowDate(summary.generatedAt)} · {summary.stepCount} steps
          </p>
        </div>
        <FlowDocumentActions
          documentId={summary.id}
          onRequestDelete={() => onRequestDelete(summary)}
        />
      </li>
    ))}
  </ul>
);
