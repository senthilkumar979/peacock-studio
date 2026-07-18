import { BookOpen, MousePointerClick, PlayCircle } from 'lucide-react';

interface FlowDetailsGuideHintsProps {
  variant: 'doc' | 'player';
  stepCount?: number;
}

const DOC_HINTS = [
  {
    icon: BookOpen,
    title: 'Scroll the guide',
    detail: 'Use the outline to jump between sections, steps, and branch paths.',
  },
  {
    icon: PlayCircle,
    title: 'Switch to player',
    detail: 'Open player mode for a focused, step-by-step walkthrough.',
  },
  {
    icon: MousePointerClick,
    title: 'Share either view',
    detail: 'Doc and player links stay in sync with the same recorded flow.',
  },
];

const PLAYER_HINTS = [
  {
    icon: PlayCircle,
    title: 'Step-by-step playback',
    detail: 'Screenshots and actions replay in the order they were captured.',
  },
  {
    icon: MousePointerClick,
    title: 'Keyboard friendly',
    detail: 'Use Next, arrow keys, or on-screen controls to move through steps.',
  },
  {
    icon: BookOpen,
    title: 'Need full context?',
    detail: 'Switch to doc view for the complete scrollable reference guide.',
  },
];

export const FlowDetailsGuideHints = ({ variant, stepCount }: FlowDetailsGuideHintsProps) => {
  const hints = variant === 'player' ? PLAYER_HINTS : DOC_HINTS;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 ring-1 ring-white/80 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {variant === 'player' ? 'Before you start' : 'How to use this guide'}
      </p>
      {typeof stepCount === 'number' ? (
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {stepCount} interactive {stepCount === 1 ? 'step' : 'steps'} in this walkthrough
        </p>
      ) : null}
      <ul className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-3 xl:grid-cols-1">
        {hints.map(({ icon: Icon, title, detail }) => (
          <li key={title} className="flex gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-peacock-50 text-peacock-700 ring-1 ring-peacock-100">
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
