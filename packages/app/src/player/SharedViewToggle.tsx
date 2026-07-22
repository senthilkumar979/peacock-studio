import type { SharedDocumentViewMode } from '@/utils/shareLink';

interface SharedViewToggleProps {
  mode: SharedDocumentViewMode;
  onChange: (mode: SharedDocumentViewMode) => void;
}

const TOGGLE_OPTIONS: Array<{ id: SharedDocumentViewMode; label: string }> = [
  { id: 'doc', label: 'Doc' },
  { id: 'player', label: 'Player' },
];

export const SharedViewToggle = ({ mode, onChange }: SharedViewToggleProps) => (
  <div
    className="inline-flex items-center gap-0.5 rounded-xl bg-slate-100/90 p-1 ring-1 ring-inset ring-slate-200/70"
    role="tablist"
    aria-label="Shared guide view"
  >
    {TOGGLE_OPTIONS.map((option) => {
      const isActive = option.id === mode;

      return (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(option.id)}
          className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all sm:px-3 ${
            isActive
              ? 'bg-white text-peacock-700 shadow-sm ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
