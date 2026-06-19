import type { PlayerControlsPosition } from './playerControlsPosition';
import { PlayerControlsPositionDisplay } from './PlayerControlsPositionDisplay';

interface PlayerControlsProps {
  position: PlayerControlsPosition;
  progressLabel: string;
  currentIndex: number;
  totalSegments: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
}

export const PlayerControls = ({
  position,
  progressLabel,
  currentIndex,
  totalSegments,
  isPlaying,
  onPrevious,
  onNext,
  onTogglePlay,
}: PlayerControlsProps) => (
  <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <PlayerControlsPositionDisplay position={position} />
      <p className="mt-1 text-xs text-slate-500">{progressLabel}</p>
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>
      <button type="button" onClick={onTogglePlay} className="btn-peacock">
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={currentIndex >= totalSegments - 1}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>

    <p className="hidden text-xs text-slate-400 lg:block">← → navigate · Space play/pause</p>
  </div>
);
