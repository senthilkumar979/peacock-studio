import { BookMarked, FileText, GitBranch, Route } from 'lucide-react';
import type { DocumentStepIndexItem } from './documentStepIndexTypes';

interface DocumentOutlineNavItemProps {
  item: DocumentStepIndexItem;
  isActive: boolean;
  onSelectOverview: (anchorId: string, itemId: string) => void;
  onSelectStep: (anchorId: string, stepId: string) => void;
  onSelectSection: (anchorId: string, sectionId: string) => void;
  onSelectBranch: (anchorId: string, branchId: string) => void;
  onSelectLinkedPath: (anchorId: string, itemId: string) => void;
}

export const DocumentOutlineNavItem = ({
  item,
  isActive,
  onSelectOverview,
  onSelectStep,
  onSelectSection,
  onSelectBranch,
  onSelectLinkedPath,
}: DocumentOutlineNavItemProps) => {
  if (item.type === 'overview') {
    return (
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
    );
  }

  if (item.type === 'branch') {
    return (
      <button
        type="button"
        onClick={() => onSelectBranch(item.anchorId, item.branchId)}
        className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
          isActive
            ? 'bg-gradient-to-r from-peacock-50 to-brand-violet/10 font-semibold text-peacock-900 ring-1 ring-peacock-200'
            : 'font-medium text-slate-700 hover:bg-slate-50'
        }`}
      >
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            isActive ? 'bg-peacock-600 text-white' : 'bg-peacock-100 text-peacock-700'
          }`}
        >
          <GitBranch className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="text-xs uppercase tracking-wide text-peacock-700">Branch point</span>
          <span className="mt-0.5 block line-clamp-2 leading-5">{item.title}</span>
        </span>
      </button>
    );
  }

  if (item.type === 'linkedPath') {
    return (
      <button
        type="button"
        onClick={() => onSelectLinkedPath(item.anchorId, item.itemId)}
        title={item.fullPathLabel}
        className={`ml-4 flex w-[calc(100%-1rem)] items-start gap-2 rounded-lg border-l-2 px-3 py-2 text-left text-sm transition ${
          isActive
            ? 'border-peacock-400 bg-peacock-50/80 font-semibold text-peacock-900'
            : 'border-peacock-200 font-medium text-slate-600 hover:border-peacock-300 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Route className="mt-0.5 h-3.5 w-3.5 shrink-0 text-peacock-600" aria-hidden />
        <span className="min-w-0 truncate leading-5">{item.pathLabel}</span>
      </button>
    );
  }

  if (item.type === 'section') {
    return (
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
            isActive ? 'bg-brand-violet text-white' : 'bg-brand-violet/10 text-brand-violet'
          }`}
        >
          <BookMarked className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="text-xs uppercase tracking-wide text-brand-violet">Chapter</span>
          <span className="mt-0.5 block line-clamp-2 leading-5">{item.title}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectStep(item.anchorId, item.stepId)}
      className={`flex w-full items-start gap-3 rounded-xl py-2 text-sm transition ${
        item.isLinkedPathStep ? 'ml-4 w-[calc(100%-1rem)] pl-3 pr-3' : 'px-3'
      } ${
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
  );
};
