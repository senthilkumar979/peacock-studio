import { Fragment, useMemo, type ReactNode } from 'react';
import type { PlayerOutlineSegment } from '@peacock/shared';
import { BookMarked, CheckCircle2, GitBranch, Play, Route } from 'lucide-react';
import {
  buildFlowJourneyNodes,
  type JourneyNode,
  type JourneyNodeKind,
} from '@/utils/flowDocJourneyNodes';

interface FlowDocJourneyStripProps {
  segments: PlayerOutlineSegment[];
  stepCount: number;
  sectionCount: number;
  branchCount: number;
}

const NODE_STYLES: Record<
  JourneyNodeKind,
  { ring: string; bg: string; icon: string; label: string; iconComponent?: typeof Play }
> = {
  start: {
    ring: 'ring-slate-300',
    bg: 'bg-slate-100',
    icon: 'text-slate-700',
    label: 'text-slate-700',
    iconComponent: Play,
  },
  step: {
    ring: 'ring-peacock-200',
    bg: 'bg-peacock-100',
    icon: 'text-peacock-800',
    label: 'text-peacock-800',
  },
  'step-group': {
    ring: 'ring-slate-200',
    bg: 'bg-slate-100',
    icon: 'text-slate-700',
    label: 'text-slate-700',
    iconComponent: Route,
  },
  section: {
    ring: 'ring-brand-violet/25',
    bg: 'bg-brand-violet/10',
    icon: 'text-brand-violet',
    label: 'text-brand-violet',
    iconComponent: BookMarked,
  },
  branch: {
    ring: 'ring-cyan-200',
    bg: 'bg-cyan-50',
    icon: 'text-cyan-800',
    label: 'text-cyan-800',
    iconComponent: GitBranch,
  },
  finish: {
    ring: 'ring-emerald-200',
    bg: 'bg-emerald-50',
    icon: 'text-emerald-700',
    label: 'text-emerald-700',
    iconComponent: CheckCircle2,
  },
};

const KIND_LABELS: Record<JourneyNodeKind, string> = {
  start: 'Start',
  step: 'Step',
  'step-group': 'Steps',
  section: 'Section',
  branch: 'Branch',
  finish: 'Complete',
};

const JourneyConnector = () => (
  <div
    aria-hidden
    className="mt-5 h-0.5 min-w-[0.75rem] flex-1 bg-gradient-to-r from-peacock-400/15 via-peacock-300/70 to-peacock-400/15"
  />
);

const JourneyNodeMarker = ({ node }: { node: JourneyNode }) => {
  const style = NODE_STYLES[node.kind];
  const Icon = style.iconComponent;
  const headline = node.kind === 'step' ? `Step ${node.label}` : node.label;

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center px-1">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${style.ring} ${style.bg} shadow-sm`}
        title={node.detail ?? headline}
      >
        {Icon ? (
          <Icon className={`h-4 w-4 ${style.icon}`} aria-hidden />
        ) : (
          <span className={`text-xs font-bold ${style.label}`}>{node.label}</span>
        )}
      </div>
      <div className="mt-2 w-full text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-peacock-300/90">
          {KIND_LABELS[node.kind]}
        </p>
        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-white">
          {headline}
        </p>
        {node.detail ? (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-300">{node.detail}</p>
        ) : null}
      </div>
    </div>
  );
};

const StatPill = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200">
    {children}
  </span>
);

export const FlowDocJourneyStrip = ({
  segments,
  stepCount,
  sectionCount,
  branchCount,
}: FlowDocJourneyStripProps) => {
  const nodes = useMemo(() => buildFlowJourneyNodes(segments), [segments]);
  if (nodes.length <= 2) return null;

  return (
    <section
      aria-label="Flow structure"
      className="overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-lg"
    >
      <div className="flex w-full flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
            Flow structure
          </p>
          <h3 className="mt-1 text-sm font-semibold text-white sm:text-base">
            How this walkthrough is organized
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatPill>
            {stepCount} {stepCount === 1 ? 'step' : 'steps'}
          </StatPill>
          {sectionCount > 0 ? (
            <StatPill>
              {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}
            </StatPill>
          ) : null}
          {branchCount > 0 ? (
            <StatPill>
              {branchCount} {branchCount === 1 ? 'branch' : 'branches'}
            </StatPill>
          ) : null}
        </div>
      </div>

      <div className="w-full border-t border-white/10 bg-slate-950/30 px-3 py-5 sm:px-4 sm:py-6">
        <div className="flex w-full min-w-0 items-start">
          {nodes.map((node, index) => (
            <Fragment key={node.id}>
              {index > 0 ? <JourneyConnector /> : null}
              <JourneyNodeMarker node={node} />
            </Fragment>
          ))}
        </div>
      </div>

      <p className="border-t border-white/10 px-4 py-3 text-xs text-slate-400 sm:px-5">
        Open Guide or Player below to walk through every step in full detail.
      </p>
    </section>
  );
};
