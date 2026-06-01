import { ListOrdered } from 'lucide-react';
import { RouteChapterList } from '@/route-builder/RouteChapterList';
import { RouteValidationBanner } from '@/route-builder/RouteValidationBanner';
import type { RouteValidationIssue } from '@/types/route';
import type { SavedFlowSummary } from '@/types/savedFlow';

interface RouteListViewProps {
  summaries: SavedFlowSummary[];
  validationIssues: RouteValidationIssue[];
  onSelectValidationNode: (nodeId: string) => void;
}

export const RouteListView = ({
  summaries,
  validationIssues,
  onSelectValidationNode,
}: RouteListViewProps) => (
  <div className="mx-auto w-full max-w-[1600px] px-6 py-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 2xl:px-44">
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-6 border-b border-slate-200/80 pb-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-peacock-50 text-peacock-700">
            <ListOrdered className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">List builder</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Edit chapters and demos in order. Switch to Canvas for branches, forms, and
              connections.
            </p>
          </div>
        </div>
      </header>

      {validationIssues.length > 0 ? (
        <div className="mb-5">
          <RouteValidationBanner issues={validationIssues} onSelectNode={onSelectValidationNode} />
        </div>
      ) : null}

      <RouteChapterList summaries={summaries} />
    </div>
  </div>
);
