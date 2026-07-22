import { BookMarked, FileText, GitBranch, Route } from 'lucide-react';
import type { PlayerControlsPosition, PlayerControlsPositionKind } from './playerControlsPosition';

interface PositionKindStyle {
  label: string;
  icon: typeof FileText;
  iconWrap: string;
  iconColor: string;
  labelColor: string;
}

const POSITION_KIND_STYLES: Record<
  Exclude<PlayerControlsPositionKind, 'step' | 'status'>,
  PositionKindStyle
> = {
  finale: {
    label: 'Complete',
    icon: FileText,
    iconWrap: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    labelColor: 'text-emerald-700',
  },
  section: {
    label: 'Chapter',
    icon: BookMarked,
    iconWrap: 'bg-brand-violet/10',
    iconColor: 'text-brand-violet',
    labelColor: 'text-brand-violet',
  },
  branch: {
    label: 'Branch point',
    icon: GitBranch,
    iconWrap: 'bg-peacock-100',
    iconColor: 'text-peacock-700',
    labelColor: 'text-peacock-700',
  },
  path: {
    label: 'Path',
    icon: Route,
    iconWrap: 'bg-cyan-100',
    iconColor: 'text-cyan-700',
    labelColor: 'text-cyan-700',
  },
};

interface PlayerControlsPositionDisplayProps {
  position: PlayerControlsPosition;
}

export const PlayerControlsPositionDisplay = ({ position }: PlayerControlsPositionDisplayProps) => {
  if (position.kind === 'status') {
    return <p className="truncate text-sm font-semibold text-slate-900">{position.title}</p>;
  }

  if (position.kind === 'step') {
    return (
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-peacock-600 text-xs font-bold text-white">
          {position.stepNumber}
        </span>
        <span className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-peacock-700">Step</span>
          <span className="mt-0.5 block truncate text-sm font-semibold text-slate-900">
            {position.title}
          </span>
        </span>
      </div>
    );
  }

  const style = POSITION_KIND_STYLES[position.kind];
  const Icon = style.icon;

  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${style.iconWrap}`}
      >
        <Icon className={`h-3.5 w-3.5 ${style.iconColor}`} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className={`text-xs font-semibold uppercase tracking-wide ${style.labelColor}`}>
          {style.label}
        </span>
        <span className="mt-0.5 block truncate text-sm font-semibold text-slate-900">
          {position.title}
        </span>
        {position.subtitle ? (
          <span className="mt-0.5 block truncate text-xs text-slate-500">{position.subtitle}</span>
        ) : null}
      </span>
    </div>
  );
};
