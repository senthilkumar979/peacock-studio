import { CircleHelp } from 'lucide-react';

interface LibraryGuideInfoButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const LibraryGuideInfoButton = ({ isOpen, onClick }: LibraryGuideInfoButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-expanded={isOpen}
    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-peacock-200 hover:bg-peacock-50/40 hover:text-peacock-700"
  >
    <CircleHelp className="h-4 w-4 shrink-0 text-peacock-600" aria-hidden />
    <span>{isOpen ? 'Hide guide' : 'How it works'}</span>
  </button>
);
