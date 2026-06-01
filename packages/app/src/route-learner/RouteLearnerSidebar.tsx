import type { RouteLearnerGraphState, RouteSegment } from '@/types/route';
import {
  buildLearnerChapterOutline,
  getHighlightedSegmentIndex,
} from '@/utils/routeLearnerNavigation';
import type { RouteLearnerTransition } from '@/utils/routeLearnerTransitions';

interface RouteLearnerSidebarProps {
  segments: RouteSegment[];
  state: RouteLearnerGraphState;
  pendingTransition: RouteLearnerTransition | null;
  onSelectSegment: (segmentIndex: number) => void;
}

export const RouteLearnerSidebar = ({
  segments,
  state,
  pendingTransition,
  onSelectSegment,
}: RouteLearnerSidebarProps) => {
  const chapters = buildLearnerChapterOutline(segments);
  const highlightedSegmentIndex = getHighlightedSegmentIndex(
    segments,
    state,
    pendingTransition
  );
  const highlightedSegment =
    highlightedSegmentIndex >= 0 ? segments[highlightedSegmentIndex] : undefined;

  const activeChapterId =
    pendingTransition?.kind === 'chapter'
      ? pendingTransition.nodeId
      : highlightedSegment?.nodeId;

  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Your path</h2>
        <p className="mt-1 text-xs text-slate-400">Chapter 1 → {chapters.length || '…'}</p>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto p-3">
        <ul className="space-y-3">
          {chapters.map((chapter) => {
            const isChapterActive = chapter.chapterId === activeChapterId;

            return (
              <li
                key={chapter.chapterId}
                className={`rounded-xl border transition ${
                  isChapterActive
                    ? 'border-peacock-200 bg-peacock-50/50'
                    : 'border-transparent'
                }`}
              >
                <div className="px-3 pb-2 pt-3">
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      isChapterActive ? 'text-peacock-700' : 'text-brand-violet'
                    }`}
                  >
                    Chapter {chapter.chapterIndex + 1}
                  </p>
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      isChapterActive ? 'text-peacock-900' : 'text-slate-900'
                    }`}
                  >
                    {chapter.title}
                  </p>
                  {chapter.description ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {chapter.description}
                    </p>
                  ) : null}
                </div>
                <ul className="space-y-1 px-2 pb-2">
                  {chapter.demos.map((demo) => {
                    const isDemoActive = highlightedSegmentIndex === demo.segmentIndex;

                    return (
                      <li key={demo.segmentIndex}>
                        <button
                          type="button"
                          onClick={() => onSelectSegment(demo.segmentIndex)}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                            isDemoActive
                              ? 'bg-peacock-600 font-semibold text-white shadow-sm'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                        >
                          {demo.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
