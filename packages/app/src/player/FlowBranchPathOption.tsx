import { ArrowRight, Check, FileText, Layers } from 'lucide-react';
import type { BranchPathMeta } from './useBranchPathMetadata';
import type { LinkedPeacockPath } from '@peacock/shared';

interface FlowBranchPathOptionProps {
  path: LinkedPeacockPath;
  index: number;
  meta?: BranchPathMeta;
  isSelected: boolean;
  layout: 'column' | 'row';
  onSelect: () => void;
}

const selectedCardClass =
  'border-peacock-300 bg-gradient-to-r from-peacock-50/90 via-white to-white shadow-md shadow-peacock-500/10 ring-2 ring-peacock-200';
const defaultCardClass =
  'border-slate-200/90 bg-white/90 hover:border-peacock-300/60 hover:bg-white hover:shadow-sm';

function IndexBadge({
  index,
  isSelected,
}: {
  index: number;
  isSelected: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg font-bold transition ${
        isSelected
          ? 'h-9 w-9 bg-gradient-to-br from-peacock-500 to-peacock-700 text-sm text-white shadow-md shadow-peacock-500/20'
          : 'h-9 w-9 bg-slate-100 text-sm text-slate-600 group-hover:bg-peacock-50 group-hover:text-peacock-700'
      }`}
    >
      {isSelected ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
    </div>
  );
}

function MetaBadges({ meta }: { meta?: BranchPathMeta }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/90 px-2 py-0.5 text-xs font-medium text-slate-600">
        <Layers className="h-3 w-3" aria-hidden />
        {meta?.stepCount
          ? `${meta.stepCount} ${meta.stepCount === 1 ? 'step' : 'steps'}`
          : 'Loading…'}
      </span>
      {meta?.rangeLabel ? (
        <span className="rounded-full bg-peacock-50 px-2 py-0.5 text-xs font-medium text-peacock-800 ring-1 ring-peacock-100">
          {meta.rangeLabel}
        </span>
      ) : null}
    </div>
  );
}

const CompactPathCard = ({
  path,
  index,
  meta,
  isSelected,
  onSelect,
}: Omit<FlowBranchPathOptionProps, 'layout'>) => (
  <li className="w-full">
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition duration-200 sm:gap-4 sm:px-4 sm:py-3 ${
        isSelected ? selectedCardClass : defaultCardClass
      }`}
    >
      <IndexBadge index={index} isSelected={isSelected} />

      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">{path.label}</p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500 sm:text-sm">
            <FileText className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{path.targetTitle}</span>
          </p>
          {path.targetDescription ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{path.targetDescription}</p>
          ) : null}
        </div>
        <MetaBadges meta={meta} />
      </div>

      <ArrowRight
        className={`h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${
          isSelected ? 'text-peacock-600' : 'text-slate-300 group-hover:text-peacock-500'
        }`}
        aria-hidden
      />
    </button>
  </li>
);

const ScrollPathCard = ({
  path,
  index,
  meta,
  isSelected,
  onSelect,
}: Omit<FlowBranchPathOptionProps, 'layout'>) => (
  <li className="w-[min(100%,280px)] shrink-0 sm:w-[240px]">
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`group flex h-full w-full flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition duration-200 sm:px-5 sm:py-5 ${
        isSelected
          ? 'border-peacock-300 bg-gradient-to-b from-peacock-50/90 via-white to-white shadow-lg shadow-peacock-500/10 ring-2 ring-peacock-200'
          : defaultCardClass
      }`}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <IndexBadge index={index} isSelected={isSelected} />
        <ArrowRight
          className={`h-5 w-5 shrink-0 ${
            isSelected ? 'text-peacock-600' : 'text-slate-300 group-hover:text-peacock-500'
          }`}
          aria-hidden
        />
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-base font-semibold leading-snug text-slate-900">{path.label}</p>
        <p className="flex items-start gap-1.5 text-sm text-slate-500">
          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="break-words">{path.targetTitle}</span>
        </p>
        {path.targetDescription ? (
          <p className="text-sm leading-relaxed text-slate-600">{path.targetDescription}</p>
        ) : null}
        <div className="mt-auto flex flex-col gap-1.5 pt-1">
          <MetaBadges meta={meta} />
        </div>
      </div>
    </button>
  </li>
);

export const FlowBranchPathOption = (props: FlowBranchPathOptionProps) =>
  props.layout === 'column' ? <CompactPathCard {...props} /> : <ScrollPathCard {...props} />;
