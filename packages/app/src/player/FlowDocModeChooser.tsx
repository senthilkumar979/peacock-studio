import { ArrowRight, BookOpen, PlayCircle } from 'lucide-react';
import type { SharedDocumentViewMode } from '@/utils/shareLink';

interface FlowDocModeChooserProps {
  onSelectMode: (mode: SharedDocumentViewMode) => void;
}

const MODE_OPTIONS = [
  {
    id: 'doc' as const,
    title: 'Guide',
    subtitle: 'Scrollable reference',
    description:
      'Read the full documentation with outline navigation, sections, branches, and export-friendly layout.',
    cta: 'Open guide',
    icon: BookOpen,
    accent: 'from-sky-50 to-white border-sky-200/80 ring-sky-100',
    iconClass: 'bg-sky-100 text-sky-700 ring-sky-200/80',
    buttonClass: 'border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100',
  },
  {
    id: 'player' as const,
    title: 'Player',
    subtitle: 'Step-by-step walkthrough',
    description:
      'Focused screenshots with click markers, keyboard navigation, and auto-play for demos and onboarding.',
    cta: 'Start player',
    icon: PlayCircle,
    accent: 'from-peacock-50 to-white border-peacock-200/80 ring-peacock-100',
    iconClass: 'bg-peacock-100 text-peacock-800 ring-peacock-200/80',
    buttonClass: 'border-peacock-200 bg-peacock-50 text-peacock-900 hover:bg-peacock-100',
  },
] as const;

export const FlowDocModeChooser = ({ onSelectMode }: FlowDocModeChooserProps) => (
  <section aria-labelledby="flow-doc-mode-heading" className="w-full">
    <div className="mb-4">
      <h2 id="flow-doc-mode-heading" className="text-lg font-bold text-slate-900 sm:text-xl">
        Choose how to explore
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Open the scrollable guide or start the interactive player walkthrough.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      {MODE_OPTIONS.map((option) => {
        const Icon = option.icon;

        return (
          <article
            key={option.id}
            className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br p-5 shadow-lg shadow-slate-200/40 ring-1 sm:p-6 ${option.accent}`}
          >
            <div className="flex items-start gap-4">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${option.iconClass}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {option.subtitle}
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{option.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{option.description}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectMode(option.id)}
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition sm:w-auto ${option.buttonClass}`}
            >
              {option.cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </article>
        );
      })}
    </div>
  </section>
);
