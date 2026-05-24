import { Calendar, Hash, Type } from 'lucide-react';
import type { SavedFlowSummary } from '@/types/savedFlow';
import { formatFlowDate } from '@/utils/formatFlowDate';
import { FlowDocumentActions } from './FlowDocumentActions';

interface FlowLibraryTableProps {
  summaries: SavedFlowSummary[];
  onRequestDelete: (summary: SavedFlowSummary) => void;
}

export const FlowLibraryTable = ({ summaries, onRequestDelete }: FlowLibraryTableProps) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <table className="min-w-full divide-y divide-slate-200 text-sm">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-4 py-3 text-left font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Title
            </span>
          </th>
          <th className="px-4 py-3 text-left font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Generated
            </span>
          </th>
          <th className="px-4 py-3 text-left font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Steps
            </span>
          </th>
          <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {summaries.map((summary) => (
          <tr key={summary.id} className="hover:bg-slate-50/80">
            <td className="px-4 py-3">
              <p className="font-medium text-slate-900">{summary.title}</p>
              {summary.description ? (
                <p className="mt-0.5 line-clamp-1 text-slate-500">{summary.description}</p>
              ) : null}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-600">
              {formatFlowDate(summary.generatedAt)}
            </td>
            <td className="px-4 py-3 tabular-nums text-slate-600">{summary.stepCount}</td>
            <td className="px-4 py-3">
              <div className="flex justify-end">
                <FlowDocumentActions
                  documentId={summary.id}
                  onRequestDelete={() => onRequestDelete(summary)}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
