import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FlowSectionCard } from '@/components/FlowSectionCard';
import type { PageHintControl } from '@/components/onboarding/HintAnchor';
import { FlowDocViewHeader } from '@/player/FlowDocViewHeader';
import { useBranchingPlayback } from '@/hooks/useBranchingPlayback';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useFlowStore } from '@/store/flowStore';
import type { SharedDocumentViewMode } from '@/utils/shareLink';
import { FlowBranchChoicePanel } from './FlowBranchChoicePanel';
import { PlayerControls } from './PlayerControls';
import {
  getPlayerControlsPosition,
  getPlayerControlsProgressLabel,
  getPlayerProgressPercent,
} from './playerControlsPosition';
import { PlayerFinale } from './PlayerFinale';
import { PlayerStep } from './PlayerStep';

const AUTO_PLAY_MS = 2500;

interface PlayerViewProps {
  documentId: string;
  onModeChange: (mode: SharedDocumentViewMode) => void;
  onOverview?: () => void;
  pageHints?: PageHintControl;
  showOwnerActions?: boolean;
  isEmbed?: boolean;
}

export const PlayerView = ({
  documentId,
  onModeChange,
  onOverview,
  pageHints,
  showOwnerActions = true,
  isEmbed = false,
}: PlayerViewProps) => {
  const location = useLocation();
  const libraryBackState = location.state;
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
  }, [
    playback.currentIndex,
    atBranch?.id,
    playback.linkedPlayback?.path.id,
    playback.isAtFinale,
  ]);

  useEffect(() => {
    if (!isPlaying || playback.linkedPlayback || playback.isAtFinale) return;
    if (playback.currentSegment?.type === 'branch') return;
    if (playback.currentIndex >= playback.totalNavigableSegments - 2) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      if (playback.currentIndex < playback.totalNavigableSegments - 2) {
        playback.goNext();
        return;
      }
      setIsPlaying(false);
    }, AUTO_PLAY_MS);

    return () => window.clearTimeout(timer);
  }, [isPlaying, playback]);

  useEffect(() => {
    if (playback.currentIndex >= playback.totalNavigableSegments - 2) {
      setIsPlaying(false);
    }
  }, [playback.currentIndex, playback.totalNavigableSegments]);

  const keyboardHandlers = useMemo(
    () => ({
      ArrowRight: () => playback.goNext(),
      ArrowLeft: () => playback.goPrevious(),
      Space: () => {
        if (playback.currentIndex >= playback.totalNavigableSegments - 2) return;
        setIsPlaying((playing) => !playing);
      },
    }),
    [playback],
  );

  useKeyboard(keyboardHandlers);

  const position = getPlayerControlsPosition(playback);
  const progressLabel = getPlayerControlsProgressLabel(playback);
  const progressPercent = getPlayerProgressPercent(playback);

  const handleReplay = () => {
    playback.replay();
    setIsPlaying(false);
  };

  const isScrollableMain = atBranch;
  const isCenteredPlayerContent =
    playback.isAtFinale || playback.currentSegment?.type === 'section';

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <FlowDocViewHeader
        documentId={documentId}
        title={flow?.flow.title ?? 'Untitled Flow'}
        viewMode="player"
        onViewModeChange={onModeChange}
        onOverview={onOverview}
        editHref={`/docs/${documentId}/edit`}
        editLinkState={libraryBackState}
        pageHints={pageHints}
        showOwnerActions={showOwnerActions}
        isEmbed={isEmbed}
      />

      <main
        ref={mainRef}
        className={`flex min-h-0 flex-1 px-3 py-3 md:px-6 md:py-4 ${
          isScrollableMain
            ? 'items-start overflow-y-auto overscroll-contain'
            : isCenteredPlayerContent
              ? 'items-center justify-center overflow-y-auto overscroll-contain'
              : 'items-start justify-center overflow-hidden'
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
            isEmbed={isEmbed}
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
          <FlowBranchChoicePanel
            branch={atBranch}
            selectedPathId={playback.selectedPathByBranchId[atBranch.id] ?? null}
            onSelectedPathChange={(pathId) =>
              playback.setBranchPathSelection(atBranch.id, pathId)
            }
            onSelect={playback.selectBranchPath}
          />
        ) : playback.currentSegment?.type === 'section' ? (
          <FlowSectionCard
            section={playback.currentSegment.section}
            variant="player"
            sectionIndex={playback.segments
              .slice(0, playback.currentIndex)
              .filter((segment) => segment.type === 'section').length}
          />
        ) : playback.currentSegment?.type === 'step' ? (
          <PlayerStep
            step={playback.currentSegment.step}
            stepNumber={playback.currentSegment.stepNumber}
            screenshotUrls={screenshotUrls}
          />
        ) : null}
      </main>

      <PlayerControls
        position={position}
        progressLabel={progressLabel}
        progressPercent={progressPercent}
        currentIndex={playback.currentIndex}
        totalSegments={playback.totalNavigableSegments}
        isPlaying={isPlaying}
        onPrevious={playback.goPrevious}
        onNext={playback.goNext}
        onTogglePlay={() => setIsPlaying((playing) => !playing)}
        pageHints={pageHints}
      />
    </div>
  );
};
