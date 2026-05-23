import type { SavedFlowSummary } from '@/types/savedFlow';
import { formatFlowDate } from '@/utils/formatFlowDate';
import { FlowDocumentActions } from './FlowDocumentActions';

interface FlowLibraryCardsProps {
  summaries: SavedFlowSummary[];
  onRequestDelete: (summary: SavedFlowSummary) => void;
}

export const FlowLibraryCards = ({ summaries, onRequestDelete }: FlowLibraryCardsProps) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {summaries.map((summary) => (
      <article
        key={summary.id}
        className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-900/5"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-peacock-600">
          {summary.stepCount} {summary.stepCount === 1 ? 'step' : 'steps'}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">{summary.title}</h3>
        {summary.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{summary.description}</p>
        ) : (
          <p className="mt-2 text-sm italic text-slate-400">No description</p>
        )}
        <p className="mt-3 text-xs text-slate-500">Generated {formatFlowDate(summary.generatedAt)}</p>
        <div className="mt-4 border-t border-slate-100 pt-4">
          <FlowDocumentActions
            documentId={summary.id}
            layout="stack"
            onRequestDelete={() => onRequestDelete(summary)}
          />
        </div>
      </article>
    ))}
  </div>
);
