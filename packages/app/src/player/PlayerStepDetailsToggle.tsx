import { ChevronDown, ChevronUp } from 'lucide-react';

interface PlayerStepDetailsToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

export const PlayerStepDetailsToggle = ({
  isVisible,
  onToggle,
  className = '',
}: PlayerStepDetailsToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-slate-700 shadow-lg backdrop-blur-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-peacock-500 ${className}`}
    aria-expanded={isVisible}
    aria-label={isVisible ? 'Hide step details' : 'Show step details'}
  >
    {isVisible ? (
      <ChevronDown className="h-5 w-5" aria-hidden />
    ) : (
      <ChevronUp className="h-5 w-5" aria-hidden />
    )}
  </button>
);
