import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { FlowVersionBadge } from '@/components/dashboard/FlowVersionBadge';
import type { SavedFlowSummary } from '@/types/savedFlow';

interface AddPeacockModalProps {
  isOpen: boolean;
  summaries: SavedFlowSummary[];
  excludedDocumentIds: string[];
  onClose: () => void;
  onSelect: (documentId: string) => void;
  closeOnSelect?: boolean;
  title?: string;
}

export const AddPeacockModal = ({
  isOpen,
  summaries,
  excludedDocumentIds,
  onClose,
  onSelect,
  closeOnSelect = true,
  title = 'Add demo to chapter',
}: AddPeacockModalProps) => {
  const [query, setQuery] = useState('');

  const availableSummaries = useMemo(() => {
    const excluded = new Set(excludedDocumentIds);
    const normalized = query.trim().toLowerCase();

    return summaries.filter((summary) => {
      if (excluded.has(summary.id)) return false;
      if (!normalized) return true;
      return (
        summary.title.toLowerCase().includes(normalized) ||
        summary.description.toLowerCase().includes(normalized) ||
        summary.version.toLowerCase().includes(normalized)
      );
    });
  }, [summaries, excludedDocumentIds, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-peacock-title"
        className="flex max-h-[min(80vh,800px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="add-peacock-title" className="text-lg font-bold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-slate-100 px-5 py-3">
          <label className="relative block">
            <span className="sr-only">Search demos</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search saved demos…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {availableSummaries.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-slate-500">
              {summaries.length === 0
                ? 'Record a demo first — saved docs appear here.'
                : 'No available demos match your search.'}
            </p>
          ) : (
            <ul className="space-y-2">
              {availableSummaries.map((summary) => (
                <li key={summary.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(summary.id);
                      setQuery('');
                      if (closeOnSelect) onClose();
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-peacock-200 hover:bg-peacock-50/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate font-medium text-slate-900">
                        {summary.title}
                      </p>
                      <div className="shrink-0">
                        <FlowVersionBadge version={summary.version} />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {summary.stepCount} {summary.stepCount === 1 ? 'step' : 'steps'}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
