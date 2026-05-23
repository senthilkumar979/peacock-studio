import type { DashboardViewMode } from '@/types/savedFlow';

interface ViewModeToggleProps {
  value: DashboardViewMode;
  onChange: (mode: DashboardViewMode) => void;
}

const MODES: { id: DashboardViewMode; label: string }[] = [
  { id: 'table', label: 'Table' },
  { id: 'card', label: 'Cards' },
  { id: 'list', label: 'List' },
];

export const ViewModeToggle = ({ value, onChange }: ViewModeToggleProps) => (
  <div
    className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1"
    role="group"
    aria-label="Library view mode"
  >
    {MODES.map((mode) => {
      const isActive = value === mode.id;
      return (
        <button
          key={mode.id}
          type="button"
          onClick={() => onChange(mode.id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            isActive
              ? 'bg-white text-peacock-700 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-pressed={isActive}
        >
          {mode.label}
        </button>
      );
    })}
  </div>
);
