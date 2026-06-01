import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  countPlayableStepsInSegments,
  getPlayerOutlineSegments,
  type PlayerOutlineSegment,
} from '@peacock/shared';
import { AppHeader } from '@/components/AppHeader';
import { FlowSectionCard } from '@/components/FlowSectionCard';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useFlowStore } from '@/store/flowStore';
import type { SharedDocumentViewMode } from '@/utils/shareLink';
import { PlayerControls } from './PlayerControls';
import { PlayerStep } from './PlayerStep';
import { SharedViewToggle } from './SharedViewToggle';

const AUTO_PLAY_MS = 2500;

interface PlayerViewProps {
  documentId: string;
  onModeChange: (mode: SharedDocumentViewMode) => void;
}

function getControlsLabel(
  segment: PlayerOutlineSegment,
  playableStepCount: number,
): string {
  if (segment.type === 'section') {
    return `Chapter · ${segment.section.title}`;
  }
  return `Step ${segment.stepNumber} of ${playableStepCount}`;
}

function getProgressLabel(segmentIndex: number, segmentCount: number): string {
  return `${segmentIndex + 1} of ${segmentCount} in guide`;
}

export const PlayerView = ({ documentId, onModeChange }: PlayerViewProps) => {
  const flow = useFlowStore((state) => state.flow);
  const outline = useFlowStore((state) => state.steps);
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const segments = useMemo(() => getPlayerOutlineSegments(outline), [outline]);
  const playableStepCount = useMemo(
    () => countPlayableStepsInSegments(segments),
    [segments],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentSegment = segments[currentIndex] ?? null;

  const keyboardHandlers = useMemo(
    () => ({
      ArrowRight: () =>
        setCurrentIndex((index) => Math.min(index + 1, segments.length - 1)),
      ArrowLeft: () => setCurrentIndex((index) => Math.max(index - 1, 0)),
      Space: () => setIsPlaying((playing) => !playing),
    }),
    [segments.length],
  );

  useKeyboard(keyboardHandlers);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setTimeout(() => {
      if (currentIndex < segments.length - 1) {
        setCurrentIndex((index) => index + 1);
        return;
      }
      setIsPlaying(false);
    }, AUTO_PLAY_MS);

    return () => window.clearTimeout(timer);
  }, [isPlaying, currentIndex, segments.length]);

  useEffect(() => {
    if (currentIndex > segments.length - 1) {
      setCurrentIndex(Math.max(segments.length - 1, 0));
    }
  }, [currentIndex, segments.length]);

  if (!currentSegment) {
    return null;
  }

  const positionLabel = getControlsLabel(currentSegment, playableStepCount);
  const progressLabel = getProgressLabel(currentIndex, segments.length);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <AppHeader
        eyebrow="Peacock Studio Player"
        title={flow?.flow.title ?? 'Untitled Flow'}
        description={flow?.flow.description || undefined}
        homeLink
        documentId={documentId}
      >
        <SharedViewToggle mode="player" onChange={onModeChange} />
        <Link
          to={`/docs/${documentId}/edit`}
          className="rounded-lg border border-peacock-200 bg-peacock-50 px-3 py-2 text-sm font-medium text-peacock-800 hover:bg-peacock-100"
        >
          Edit flow
        </Link>
      </AppHeader>

      <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-4 md:px-6">
        {currentSegment.type === 'section' ? (
          <FlowSectionCard section={currentSegment.section} variant="player" />
        ) : (
          <PlayerStep
            step={currentSegment.step}
            stepNumber={currentSegment.stepNumber}
            screenshotUrls={screenshotUrls}
          />
        )}
      </main>

      <PlayerControls
        positionLabel={positionLabel}
        progressLabel={progressLabel}
        currentIndex={currentIndex}
        totalSegments={segments.length}
        isPlaying={isPlaying}
        onPrevious={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
        onNext={() =>
          setCurrentIndex((index) => Math.min(index + 1, segments.length - 1))
        }
        onTogglePlay={() => setIsPlaying((playing) => !playing)}
      />
    </div>
  );
};
