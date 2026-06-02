import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { FlowSectionCard } from '@/components/FlowSectionCard';
import { useBranchingPlayback } from '@/hooks/useBranchingPlayback';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useFlowStore } from '@/store/flowStore';
import type { SharedDocumentViewMode } from '@/utils/shareLink';
import { FlowBranchChoicePanel } from './FlowBranchChoicePanel';
import { PlayerControls } from './PlayerControls';
import { PlayerFinale } from './PlayerFinale';
import { PlayerStep } from './PlayerStep';
import { SharedViewToggle } from './SharedViewToggle';

const AUTO_PLAY_MS = 2500;

interface PlayerViewProps {
  documentId: string;
  onModeChange: (mode: SharedDocumentViewMode) => void;
}

function getControlsLabel(
  playback: ReturnType<typeof useBranchingPlayback>,
): string {
  if (playback.isAtFinale) return 'Guide complete';
  if (playback.linkedPlayback) {
    const { path, stepIndex, steps } = playback.linkedPlayback;
    return `${path.label} · Step ${stepIndex + 1} of ${steps.length}`;
  }
  const segment = playback.currentSegment;
  if (!segment) return 'Guide';
  if (segment.type === 'section') return `Chapter · ${segment.section.title}`;
  if (segment.type === 'branch') return `Branch · ${segment.branch.title}`;
  return `Step ${segment.stepNumber} of ${playback.playableStepCount}`;
}

function getProgressLabel(currentIndex: number, segmentCount: number): string {
  return `${currentIndex + 1} of ${segmentCount} in guide`;
}

export const PlayerView = ({ documentId, onModeChange }: PlayerViewProps) => {
  const flow = useFlowStore((state) => state.flow);
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const playback = useBranchingPlayback();
  const [isPlaying, setIsPlaying] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const linkedStep = playback.linkedPlayback?.steps[playback.linkedPlayback.stepIndex];
  const atBranch =
    !playback.linkedPlayback && playback.currentSegment?.type === 'branch'
      ? playback.currentSegment.branch
      : null;

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [playback.currentIndex, atBranch?.id, playback.linkedPlayback?.path.id, playback.isAtFinale]);

  const keyboardHandlers = useMemo(
    () => ({
      ArrowRight: () => playback.goNext(),
      ArrowLeft: () => playback.goPrevious(),
      Space: () => setIsPlaying((playing) => !playing),
    }),
    [playback],
  );

  useKeyboard(keyboardHandlers);

  useEffect(() => {
    if (!isPlaying || playback.linkedPlayback || playback.isAtFinale) return;
    if (playback.currentSegment?.type === 'branch') return;

    const timer = window.setTimeout(() => {
      if (playback.currentIndex < playback.segments.length) {
        playback.goNext();
        return;
      }
      setIsPlaying(false);
    }, AUTO_PLAY_MS);

    return () => window.clearTimeout(timer);
  }, [isPlaying, playback]);

  if (!playback.segments.length && !playback.linkedPlayback) {
    return null;
  }

  const positionLabel = getControlsLabel(playback);
  const progressLabel = playback.linkedPlayback
    ? positionLabel
    : getProgressLabel(playback.currentIndex, playback.totalNavigableSegments);

  const handleReplay = () => {
    playback.replay();
    setIsPlaying(false);
  };

  const isScrollableMain = atBranch || playback.isAtFinale;

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

      <main
        ref={mainRef}
        className={`flex min-h-0 flex-1 px-3 py-3 md:px-6 md:py-4 ${
          isScrollableMain
            ? 'items-start overflow-y-auto overscroll-contain'
            : 'items-center justify-center overflow-hidden'
        }`}
      >
        {playback.isAtFinale ? (
          <PlayerFinale
            title={flow?.flow.title ?? 'Untitled Flow'}
            description={(flow?.flow.description ?? '').trim()}
            stepCount={playback.playableStepCount}
            branchCount={playback.branchCount}
            sectionCount={playback.sectionCount}
            onReplay={handleReplay}
          />
        ) : playback.isLoadingLinked ? (
          <p className="text-sm text-slate-500">Loading linked demo…</p>
        ) : playback.linkedError ? (
          <p className="text-sm text-amber-800">{playback.linkedError}</p>
        ) : linkedStep && playback.linkedPlayback ? (
          <PlayerStep
            step={linkedStep}
            stepNumber={playback.linkedPlayback.stepIndex + 1}
            screenshotUrls={playback.linkedPlayback.screenshotUrls}
          />
        ) : atBranch ? (
          <FlowBranchChoicePanel branch={atBranch} onSelect={playback.selectBranchPath} />
        ) : playback.currentSegment?.type === 'section' ? (
          <FlowSectionCard section={playback.currentSegment.section} variant="player" />
        ) : playback.currentSegment?.type === 'step' ? (
          <PlayerStep
            step={playback.currentSegment.step}
            stepNumber={playback.currentSegment.stepNumber}
            screenshotUrls={screenshotUrls}
          />
        ) : null}
      </main>

      <PlayerControls
        positionLabel={positionLabel}
        progressLabel={progressLabel}
        currentIndex={playback.currentIndex}
        totalSegments={playback.totalNavigableSegments}
        isPlaying={isPlaying}
        onPrevious={playback.goPrevious}
        onNext={playback.goNext}
        onTogglePlay={() => setIsPlaying((playing) => !playing)}
      />
    </div>
  );
};
