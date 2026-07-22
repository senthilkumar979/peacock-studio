import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { PlayerControlsPosition } from "./playerControlsPosition";
import { PlayerControlsPositionDisplay } from "./PlayerControlsPositionDisplay";
import type { PageHintControl } from "@/components/onboarding/HintAnchor";

interface PlayerControlsProps {
  position: PlayerControlsPosition;
  progressLabel: string;
  progressPercent: number;
  currentIndex: number;
  totalSegments: number;
  isPlaying: boolean;
  isPlayDisabled?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  pageHints?: PageHintControl;
}

const controlButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3";

export const PlayerControls = ({
  position,
  progressLabel,
  progressPercent,
  currentIndex,
  totalSegments,
  isPlaying,
  isPlayDisabled = false,
  onPrevious,
  onNext,
  onTogglePlay,
}: PlayerControlsProps) => {
  const isAtLastSegment = currentIndex >= totalSegments - 1;
  /** No further auto-advance once on the last content step before Guide complete. */
  const playDisabled =
    isPlayDisabled || currentIndex >= Math.max(0, totalSegments - 2);

  return (
    <footer className="relative shrink-0 border-t border-slate-200 bg-white">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6">
        <div className="min-w-0">
          <PlayerControlsPositionDisplay position={position} />
          <p className="mt-0.5 truncate text-xs text-slate-500">{progressLabel}</p>
        </div>

        <div className="flex w-[16.5rem] shrink-0 items-center justify-end gap-1.5 sm:w-[19rem] sm:gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className={`${controlButtonClass} min-w-[5.25rem] sm:min-w-[6rem]`}
          >
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
            Previous
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={playDisabled}
            className="btn-peacock inline-flex min-w-[5.25rem] items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[6rem]"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <Play className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={isAtLastSegment}
            className={`${controlButtonClass} min-w-[5.25rem] sm:min-w-[6rem]`}
          >
            Next
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        </div>
      </div>

      <div
        className="h-1 bg-slate-100"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Player progress"
      >
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-peacock-500 to-brand-violet transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </footer>
  );
};
