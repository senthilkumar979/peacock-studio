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
    className="inline-flex items-center rounded-lg border border-slate-300 bg-white p-1 shadow-sm"
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
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            isActive
              ? 'bg-peacock-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
