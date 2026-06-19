import { BookMarked, FileText, GitBranch } from 'lucide-react';

interface DocumentStepIndexOverviewItem {
  type: 'overview';
  anchorId: string;
  itemId: string;
  title: string;
}

interface DocumentStepIndexStepItem {
  type: 'step';
  anchorId: string;
  stepId: string;
  stepNumber: number;
  title: string;
}

interface DocumentStepIndexSectionItem {
  type: 'section';
  anchorId: string;
  sectionId: string;
  title: string;
}

interface DocumentStepIndexBranchItem {
  type: 'branch';
  anchorId: string;
  branchId: string;
  title: string;
}

export type DocumentStepIndexItem =
  | DocumentStepIndexOverviewItem
  | DocumentStepIndexStepItem
  | DocumentStepIndexSectionItem
  | DocumentStepIndexBranchItem;

interface DocumentStepIndexProps {
  items: DocumentStepIndexItem[];
  activeItemId: string | null;
  onSelectOverview: (anchorId: string, itemId: string) => void;
  onSelectStep: (anchorId: string, stepId: string) => void;
  onSelectSection: (anchorId: string, sectionId: string) => void;
  onSelectBranch: (anchorId: string, branchId: string) => void;
}

export const DocumentStepIndex = ({
  items,
  activeItemId,
  onSelectOverview,
  onSelectStep,
  onSelectSection,
  onSelectBranch,
}: DocumentStepIndexProps) => (
  <aside className="hidden min-h-0 lg:block min-w-[300px]">
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Outline</p>
      <nav className="mt-4 pr-1">
        <ol className="space-y-2">
          {items.map((item) => {
            if (item.type === 'overview') {
              const isActive = item.itemId === activeItemId;
              return (
                <li key={item.itemId}>
                  <button
                    type="button"
                    onClick={() => onSelectOverview(item.anchorId, item.itemId)}
                    className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      isActive
                        ? 'bg-peacock-50 font-semibold text-peacock-800 ring-1 ring-peacock-200'
                        : 'font-medium text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="mt-1 h-4 w-4 shrink-0" aria-hidden />
                    <span className="line-clamp-2 leading-5">{item.title}</span>
                  </button>
                </li>
              );
            }

            if (item.type === 'branch') {
              const isActive = item.branchId === activeItemId;
              return (
                <li key={item.branchId}>
                  <button
                    type="button"
                    onClick={() => onSelectBranch(item.anchorId, item.branchId)}
                    className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      isActive
                        ? 'bg-brand-violet/10 font-semibold text-brand-violet ring-1 ring-brand-violet/30'
                        : 'font-medium text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <GitBranch className="mt-1 h-4 w-4 shrink-0" aria-hidden />
                    <span className="line-clamp-2 leading-5 text-left">{item.title}</span>
                  </button>
                </li>
              );
            }

            if (item.type === 'section') {
              const isActive = item.sectionId === activeItemId;
              return (
                <li key={item.sectionId}>
                  <button
                    type="button"
                    onClick={() => onSelectSection(item.anchorId, item.sectionId)}
                    className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-violet/10 to-peacock-50 font-semibold text-brand-violet ring-1 ring-brand-violet/30'
                        : 'font-medium text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? 'bg-brand-violet text-white'
                          : 'bg-brand-violet/10 text-brand-violet'
                      }`}
                    >
                      <BookMarked className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="text-xs uppercase tracking-wide text-brand-violet">
                        Chapter
                      </span>
                      <span className="mt-0.5 block line-clamp-2 leading-5">{item.title}</span>
                    </span>
                  </button>
                </li>
              );
            }

            const isActive = item.stepId === activeItemId;
            return (
              <li key={item.stepId}>
                <button
                  type="button"
                  onClick={() => onSelectStep(item.anchorId, item.stepId)}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-peacock-50 text-peacock-800 ring-1 ring-peacock-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`mt-0.5 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isActive ? 'bg-peacock-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.stepNumber}
                  </span>
                  <span className="line-clamp-2 leading-5 text-left">{item.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  </aside>
);
