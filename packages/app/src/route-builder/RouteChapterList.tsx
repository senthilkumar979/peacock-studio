import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { RouteChapterCard } from '@/route-builder/RouteChapterCard';
import { RouteBuilderMeta } from '@/route-builder/RouteBuilderMeta';
import { useRouteBuilderStore } from '@/store/routeBuilderStore';
import { getChapterNodesInPathOrder } from '@/utils/routeGraph';
import type { SavedFlowSummary } from '@/types/savedFlow';

interface RouteChapterListProps {
  summaries: SavedFlowSummary[];
}

export const RouteChapterList = ({ summaries }: RouteChapterListProps) => {
  const route = useRouteBuilderStore((state) => state.route);
  const addChapter = useRouteBuilderStore((state) => state.addChapter);

  const summariesById = useMemo(
    () => new Map(summaries.map((summary) => [summary.id, summary])),
    [summaries]
  );

  if (!route) return null;

  const chapters = getChapterNodesInPathOrder(route);

  return (
    <div className="space-y-4">
      <RouteBuilderMeta />

      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Chapters ({chapters.length})
        </p>
      </div>

      <ol className="space-y-4">
        {chapters.map((chapter, index) => (
          <li key={chapter.id} className="relative">
            {index < chapters.length - 1 ? (
              <span
                className="absolute left-[1.125rem] top-full z-0 h-4 w-px -translate-y-px bg-slate-200"
                aria-hidden
              />
            ) : null}
            <RouteChapterCard
              chapter={chapter}
              chapterNumber={index + 1}
              summaries={summaries}
              summariesById={summariesById}
              canDelete={route.nodes.length > 1}
            />
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={addChapter}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-peacock-200 hover:bg-peacock-50/40 hover:text-peacock-800"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add chapter
      </button>
    </div>
  );
};
