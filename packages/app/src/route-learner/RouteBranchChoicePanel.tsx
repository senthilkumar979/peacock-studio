import { GitBranch, Sparkles } from 'lucide-react';
import type { RouteBranchNode } from '@/types/route';

interface RouteBranchChoicePanelProps {
  branch: RouteBranchNode;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
}

export const RouteBranchChoicePanel = ({
  branch,
  selectedOptionId,
  onSelect,
}: RouteBranchChoicePanelProps) => (
  <div className="relative mx-auto w-full max-w-xl">
    <div className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-peacock-50/60 via-transparent to-transparent" />
      <div className="absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-peacock-200/20 blur-3xl" />
    </div>

    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-peacock-50/70 via-white/40 to-transparent" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-peacock-300/60 to-transparent"
      />

      <div className="relative">
        <div className="flex items-center gap-2 text-peacock-700">
          <GitBranch className="h-5 w-5" aria-hidden />
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Choose your path
          </p>
        </div>
        <h2 className="mt-3 text-xl font-bold text-slate-900">{branch.title}</h2>
        {branch.description ? (
          <p className="mt-2 text-sm text-slate-600">{branch.description}</p>
        ) : null}
        <ul className="mt-5 space-y-2">
          {branch.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => onSelect(option.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    isSelected
                      ? 'border-peacock-300 bg-peacock-50 text-peacock-800 ring-2 ring-peacock-200'
                      : 'border-slate-200/90 bg-white/90 text-slate-800 hover:border-peacock-300/60 hover:bg-peacock-50/50'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  </div>
);
