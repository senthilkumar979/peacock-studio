interface PlayerControlsProps {
  currentIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
}

export const PlayerControls = ({
  currentIndex,
  totalSteps,
  isPlaying,
  onPrevious,
  onNext,
  onTogglePlay,
}: PlayerControlsProps) => (
  <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-4">
    <p className="text-sm text-slate-600">
      Step {currentIndex + 1} of {totalSteps}
    </p>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>
      <button
        type="button"
        onClick={onTogglePlay}
        className="btn-peacock"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={currentIndex >= totalSteps - 1}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>

    <p className="hidden text-xs text-slate-400 sm:block">← → navigate · Space play/pause</p>
  </div>
);
