import { CalendarDays, GitBranch, Layers3, LayoutList, Link2, Sparkles } from 'lucide-react';
import { FlowVersionBadge } from '@/components/dashboard/FlowVersionBadge';
import { RichTextContent } from '@/components/editor/RichTextContent';
import { FlowTagList } from '@/components/flow/FlowTagList';
import { formatFlowDate } from '@/utils/formatFlowDate';
import { isEmptyRichText } from '@/utils/richText';
import { FlowDetailsGuideHints } from '@/player/FlowDetailsGuideHints';
import { FlowDetailsStatChip } from '@/player/FlowDetailsStatChip';

interface FlowDetailsIntroProps {
  title: string;
  description: string;
  version: string;
  createdAt?: number;
  stepCount?: number;
  sectionCount?: number;
  branchCount?: number;
  resourceCount?: number;
  tags?: string[];
  variant: 'doc' | 'player' | 'hub';
  fillHeight?: boolean;
  isActive?: boolean;
}

export const FlowDetailsIntro = ({
  title,
  description,
  version,
  createdAt,
  stepCount,
  sectionCount,
  branchCount,
  resourceCount,
  tags = [],
  variant,
  fillHeight = false,
  isActive = false,
}: FlowDetailsIntroProps) => {
  const hasDescription = !isEmptyRichText(description);
  const isPlayer = variant === 'player';
  const isHub = variant === 'hub';
  const badgeLabel = isHub ? 'Flow overview' : isPlayer ? 'Flow overview' : 'Flow details';

  return (
    <article
      className={`relative min-w-0 overflow-hidden rounded-3xl border shadow-lg shadow-slate-200/50 transition ${
        fillHeight ? 'h-full' : ''
      } ${
        isActive
          ? 'border-peacock-300 ring-2 ring-peacock-100'
          : 'border-slate-200/80'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-peacock-50/80 via-white to-brand-violet/5" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-peacock-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 h-36 w-36 rounded-full bg-brand-violet/10 blur-3xl" />

      <div className="relative flex h-full flex-col p-5 sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-peacock-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-peacock-800 shadow-sm">
            <Sparkles className="h-3 w-3" aria-hidden />
            {badgeLabel}
          </span>
          <FlowVersionBadge version={version} />
        </div>

        <h2
          className={`mt-5 font-bold tracking-tight text-slate-900 ${
            isPlayer || isHub ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
          }`}
        >
          {title}
        </h2>

        {hasDescription ? (
          <RichTextContent
            html={description}
            className={`mt-3 text-slate-600 ${
              isPlayer || isHub ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
            }`}
          />
        ) : (
          <p className="mt-3 text-sm italic text-slate-500">No description provided.</p>
        )}

        {tags.length > 0 ? <FlowTagList tags={tags} className="mt-4" /> : null}

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {typeof stepCount === 'number' ? (
            <FlowDetailsStatChip
              icon={Layers3}
              label="Recorded steps"
              value={`${stepCount} ${stepCount === 1 ? 'step' : 'steps'}`}
            />
          ) : null}
          {typeof sectionCount === 'number' && sectionCount > 0 ? (
            <FlowDetailsStatChip
              icon={LayoutList}
              label="Sections"
              value={`${sectionCount} ${sectionCount === 1 ? 'section' : 'sections'}`}
            />
          ) : null}
          {typeof branchCount === 'number' && branchCount > 0 ? (
            <FlowDetailsStatChip
              icon={GitBranch}
              label="Branches"
              value={`${branchCount} ${branchCount === 1 ? 'branch' : 'branches'}`}
            />
          ) : null}
          {typeof resourceCount === 'number' && resourceCount > 0 ? (
            <FlowDetailsStatChip
              icon={Link2}
              label="Resources"
              value={`${resourceCount} ${resourceCount === 1 ? 'link' : 'links'}`}
            />
          ) : null}
          {createdAt ? (
            <FlowDetailsStatChip
              icon={CalendarDays}
              label="Created"
              value={formatFlowDate(createdAt)}
            />
          ) : null}
        </div>

        <div className="mt-4">
          {!isHub ? <FlowDetailsGuideHints variant={variant} stepCount={stepCount} /> : null}
        </div>
      </div>
    </article>
  );
};
