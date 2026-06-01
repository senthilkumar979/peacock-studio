import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AddPeacockModal } from '@/route-builder/AddPeacockModal';
import { RoutePeacockList } from '@/route-builder/RoutePeacockList';
import { useRouteBuilderStore } from '@/store/routeBuilderStore';
import type { RouteChapterNode } from '@/types/route';
import type { SavedFlowSummary } from '@/types/savedFlow';

interface RouteChapterCardProps {
  chapter: RouteChapterNode;
  chapterNumber: number;
  summaries: SavedFlowSummary[];
  summariesById: Map<string, SavedFlowSummary>;
  canDelete: boolean;
}

export const RouteChapterCard = ({
  chapter,
  chapterNumber,
  summaries,
  summariesById,
  canDelete,
}: RouteChapterCardProps) => {
  const updateChapter = useRouteBuilderStore((state) => state.updateChapter);
  const deleteNode = useRouteBuilderStore((state) => state.deleteNode);
  const addPeacock = useRouteBuilderStore((state) => state.addPeacock);
  const removePeacock = useRouteBuilderStore((state) => state.removePeacock);
  const reorderPeacocks = useRouteBuilderStore((state) => state.reorderPeacocks);

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <article className="relative z-10 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-3 border-b border-slate-100 p-4 sm:p-5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-peacock-500 to-brand-violet text-sm font-bold text-white"
          aria-hidden
        >
          {chapterNumber}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            value={chapter.title}
            onChange={(event) =>
              updateChapter(chapter.id, event.target.value, chapter.description)
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500"
            aria-label={`Chapter ${chapterNumber} title`}
          />
          <textarea
            value={chapter.description}
            onChange={(event) => updateChapter(chapter.id, chapter.title, event.target.value)}
            rows={6}
            placeholder="Chapter description (optional)"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-peacock-300 focus:ring-2 focus:ring-peacock-500"
            aria-label={`Chapter ${chapterNumber} description`}
          />
        </div>
        {canDelete ? (
          <button
            type="button"
            onClick={() => deleteNode(chapter.id)}
            className="h-fit rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
            aria-label={`Delete chapter ${chapterNumber}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <p className="text-xs font-medium text-slate-500">
          Demos ({chapter.peacocks.length})
        </p>
        <RoutePeacockList
          peacocks={chapter.peacocks}
          summariesById={summariesById}
          onRemove={(peacockRefId) => removePeacock(chapter.id, peacockRefId)}
          onReorder={(from, to) => reorderPeacocks(chapter.id, from, to)}
        />
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-peacock-200 bg-peacock-50/30 px-3 py-2.5 text-sm font-medium text-peacock-800 hover:bg-peacock-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add demo
        </button>
      </div>

      <AddPeacockModal
        isOpen={isPickerOpen}
        summaries={summaries}
        excludedDocumentIds={chapter.peacocks.map((peacock) => peacock.documentId)}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(documentId) => addPeacock(chapter.id, documentId)}
      />
    </article>
  );
};
