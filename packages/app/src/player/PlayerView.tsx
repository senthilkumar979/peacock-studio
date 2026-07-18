import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { FlowSectionCard } from '@/components/FlowSectionCard';
import { HintAnchor, type PageHintControl } from '@/components/onboarding/HintAnchor';
import { PLAYER_HINT_IDS } from '@/constants/firstTimeHints';
import { useBranchingPlayback } from '@/hooks/useBranchingPlayback';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useFlowStore } from '@/store/flowStore';
import type { SharedDocumentViewMode } from '@/utils/shareLink';
import { FlowBranchChoicePanel } from './FlowBranchChoicePanel';
import { FlowDetailsOverviewLayout } from '@/components/flow/FlowDetailsOverviewLayout';
import { PlayerControls } from './PlayerControls';
import {
  getPlayerControlsPosition,
  getPlayerControlsProgressLabel,
} from './playerControlsPosition';
import { PlayerFinale } from './PlayerFinale';
import { PlayerStep } from './PlayerStep';
import { SharedViewToggle } from './SharedViewToggle';

const AUTO_PLAY_MS = 2500;

interface PlayerViewProps {
  documentId: string;
  onModeChange: (mode: SharedDocumentViewMode) => void;
  pageHints?: PageHintControl;
}

export const PlayerView = ({
  documentId,
  onModeChange,
  pageHints,
}: PlayerViewProps) => {
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
    playback.isAtIntro,
  ]);

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
      if (playback.currentIndex < playback.totalNavigableSegments - 1) {
        playback.goNext();
        return;
      }
      setIsPlaying(false);
    }, AUTO_PLAY_MS);

    return () => window.clearTimeout(timer);
  }, [isPlaying, playback]);

  const position = getPlayerControlsPosition(playback);
  const progressLabel = getPlayerControlsProgressLabel(playback);

  const handleReplay = () => {
    playback.replay();
    setIsPlaying(false);
  };

  const isScrollableMain =
    playback.isAtIntro || atBranch || playback.isAtFinale;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <AppHeader
        eyebrow="Peacock Studio Player"
        title={flow?.flow.title ?? 'Untitled Flow'}
        description={flow?.flow.description || undefined}
        homeLink
        documentId={documentId}
      >
        <HintAnchor
          hints={pageHints}
          hintId={PLAYER_HINT_IDS.viewToggle}
          title="Doc or Player"
          description="Switch between a scrollable guide and a step-by-step player. Share either view with your audience."
        >
          <SharedViewToggle mode="player" onChange={onModeChange} />
        </HintAnchor>
        <HintAnchor
          hints={pageHints}
          hintId={PLAYER_HINT_IDS.editFlow}
          title="Edit this flow"
          description="Jump back to the editor to update steps, branching, and screenshots."
          placement="bottom"
        >
          <Link
            to={`/docs/${documentId}/edit`}
            className="rounded-lg border border-peacock-200 bg-peacock-50 px-3 py-2 text-sm font-medium text-peacock-800 hover:bg-peacock-100"
          >
            Edit flow
          </Link>
        </HintAnchor>
      </AppHeader>

      <main
        ref={mainRef}
        className={`flex min-h-0 flex-1 px-3 py-3 md:px-6 md:py-4 ${
          isScrollableMain
            ? 'items-start overflow-y-auto overscroll-contain'
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
          />
        ) : playback.isAtIntro ? (
          <div className="w-full self-stretch">
            <FlowDetailsOverviewLayout
            variant="player"
            documentId={documentId}
            title={flow?.flow.title ?? 'Untitled Flow'}
            description={flow?.flow.description ?? ''}
            version={flow?.flow.version ?? ''}
            captureEnvironment={flow?.metadata.captureEnvironment ?? null}
            createdAt={flow?.metadata.createdAt}
            stepCount={playback.playableStepCount}
          />
          </div>
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
        position={position}
        progressLabel={progressLabel}
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
