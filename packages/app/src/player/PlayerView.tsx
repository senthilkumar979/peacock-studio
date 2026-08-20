import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FlowSectionCard } from '@/components/FlowSectionCard';
import type { PageHintControl } from '@/components/onboarding/HintAnchor';
import { FlowDocViewHeader } from '@/player/FlowDocViewHeader';
import { useBranchingPlayback } from '@/hooks/useBranchingPlayback';
import { useKeyboard } from '@/hooks/useKeyboard';
import { usePresenterMode } from '@/hooks/usePresenterMode';
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
  isPresenter?: boolean;
}

export const PlayerView = ({
  documentId,
  onModeChange,
  onOverview,
  pageHints,
  showOwnerActions = true,
  isEmbed = false,
  isPresenter: isPresenterProp = false,
}: PlayerViewProps) => {
  const location = useLocation();
  const libraryBackState = location.state;
  const flow = useFlowStore((state) => state.flow);
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const playback = useBranchingPlayback();
  const [isPlaying, setIsPlaying] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const {
    rootRef,
    isPresenter,
    enterPresenter,
    exitPresenter,
  } = usePresenterMode({ forcedPresenter: isPresenterProp });

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
      Escape: () => {
        if (isPresenter && !isPresenterProp) exitPresenter();
      },
    }),
    [playback, isPresenter, isPresenterProp, exitPresenter],
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
  const showChrome = !isPresenter;

  return (
    <div
      ref={rootRef}
      className={`relative flex flex-col overflow-hidden ${
        atBranch
          ? 'bg-gradient-to-b from-peacock-50/80 via-slate-50 to-slate-50'
          : 'bg-slate-50'
      } ${isEmbed ? 'h-full min-h-0' : 'h-screen'}${isPresenter ? ' presenter-mode' : ''}`}
    >
      {showChrome ? (
        <FlowDocViewHeader
          documentId={documentId}
          title={flow?.flow.title ?? 'Untitled Flow'}
          version={flow?.flow.version}
          viewMode="player"
          onViewModeChange={onModeChange}
          onOverview={onOverview}
          guideProgressPercent={progressPercent}
          editHref={`/docs/${documentId}/edit`}
          editLinkState={libraryBackState}
          pageHints={pageHints}
          showOwnerActions={showOwnerActions}
          isEmbed={isEmbed}
          onEnterPresenter={isEmbed ? undefined : enterPresenter}
        />
      ) : null}

      <main
        ref={mainRef}
        className={`flex min-h-0 flex-1 ${
          isEmbed || isPresenter ? 'px-4 py-5 sm:px-6 sm:py-6' : 'px-3 py-3 md:px-6 md:py-4'
        } ${
          isScrollableMain
            ? 'items-start overflow-y-auto overscroll-contain'
            : isCenteredPlayerContent
              ? 'items-center justify-center overflow-y-auto overscroll-contain'
              : isEmbed || isPresenter
                ? 'items-center justify-center overflow-hidden'
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
            isEmbed={isEmbed}
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
            isEmbed={isEmbed}
          />
        ) : null}
      </main>

      {showChrome ? (
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
      ) : (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex max-w-[min(100%-2rem,36rem)] -translate-x-1/2 flex-col items-center gap-1.5 rounded-2xl bg-slate-900/80 px-4 py-2 text-center text-xs text-white shadow-lg backdrop-blur-sm">
          <p className="font-medium">{progressLabel}</p>
          <p className="text-[11px] leading-relaxed text-slate-200">
            <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-sans">←</kbd>
            {' / '}
            <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-sans">→</kbd>
            {' step · '}
            <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-sans">Space</kbd>
            {' play/pause · '}
            <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-sans">Esc</kbd>
            {' exit'}
          </p>
        </div>
      )}
    </div>
  );
};
