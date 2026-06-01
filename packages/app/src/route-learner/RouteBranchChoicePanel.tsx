import { GitBranch } from 'lucide-react';
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
  <div className="mx-auto w-full max-w-xl rounded-2xl border border-brand-violet/20 bg-white p-6 shadow-lg">
    <div className="flex items-center gap-2 text-brand-violet">
      <GitBranch className="h-5 w-5" aria-hidden />
      <p className="text-xs font-semibold uppercase tracking-wide">Choose your path</p>
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
                  ? 'border-brand-violet bg-brand-violet/10 text-brand-violet'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-brand-violet/30 hover:bg-white'
              }`}
            >
              {option.label}
            </button>
          </li>
        );
      })}
    </ul>
  </div>
);
