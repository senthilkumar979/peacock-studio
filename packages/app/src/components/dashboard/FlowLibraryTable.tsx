import { Calendar, FileText, Settings2, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SavedFlowSummary } from '@/types/savedFlow';
import { formatFlowDate } from '@/utils/formatFlowDate';
import { getDocumentPath } from '@/utils/shareLink';
import { FlowDocumentActions } from './FlowDocumentActions';
import { FlowStepCountBadge } from './FlowStepCountBadge';
import { FlowVersionBadge } from './FlowVersionBadge';

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
              <FileText className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Title
            </span>
          </th>
          <th className="px-4 py-3 text-left font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Version
            </span>
          </th>
          <th className="px-4 py-3 text-left font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Generated
            </span>
          </th>
          <th className="px-4 py-3 text-right font-semibold text-slate-700">
            <span className="inline-flex items-center justify-end gap-1.5">
              <Settings2 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Actions
            </span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {summaries.map((summary) => (
          <tr key={summary.id} className="hover:bg-slate-50/80">
            <td className="px-4 py-3">
              <Link
                to={getDocumentPath(summary.id, 'player')}
                className="group block min-w-0 rounded-lg outline-none ring-peacock-500 focus-visible:ring-2"
              >
                <p className="font-medium text-slate-900 transition-colors group-hover:text-peacock-700">
                  {summary.title}
                </p>
                {summary.description ? (
                  <p className="mt-0.5 line-clamp-1 text-slate-500">{summary.description}</p>
                ) : null}
                <div className="mt-2">
                  <FlowStepCountBadge stepCount={summary.stepCount} />
                </div>
              </Link>
            </td>
            <td className="px-4 py-3">
              <FlowVersionBadge version={summary.version} />
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-600">
              {formatFlowDate(summary.generatedAt)}
            </td>
            <td className="whitespace-nowrap px-4 py-3">
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
