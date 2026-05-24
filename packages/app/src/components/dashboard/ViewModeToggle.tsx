import type { LucideIcon } from 'lucide-react';
import { LayoutGrid, List, Table2 } from 'lucide-react';
import type { DashboardViewMode } from '@/types/savedFlow';

interface ViewModeToggleProps {
  value: DashboardViewMode;
  onChange: (mode: DashboardViewMode) => void;
}

const MODES: { id: DashboardViewMode; label: string; icon: LucideIcon }[] = [
  { id: 'table', label: 'Table', icon: Table2 },
  { id: 'card', label: 'Cards', icon: LayoutGrid },
  { id: 'list', label: 'List', icon: List },
];

export const ViewModeToggle = ({ value, onChange }: ViewModeToggleProps) => (
  <div
    className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1"
    role="group"
    aria-label="Library view mode"
  >
    {MODES.map((mode) => {
      const isActive = value === mode.id;
      const Icon = mode.icon;
      return (
        <button
          key={mode.id}
          type="button"
          onClick={() => onChange(mode.id)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            isActive
              ? 'bg-white text-peacock-700 shadow-sm ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-pressed={isActive}
        >
          <Icon className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      );
    })}
  </div>
);
