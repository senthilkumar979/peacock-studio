import { Player } from '@remotion/player';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { resolveOrgBranding } from '@/cloud/types/orgBranding';
import { useFlowStore } from '@/store/flowStore';
import { stripHtmlTags } from '@/utils/richText';
import type { PdfPathSelections } from '@/utils/pdfPathSelection';
import { FlowVideoComposition } from './FlowVideoComposition';
import { useCinematicBeats } from './useCinematicBeats';
import type { FlowVideoCompositionProps } from './videoBeats';
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from './videoConstants';
import { getCompositionDurationInFrames } from './videoTiming';

interface CinematicPlayerViewProps {
  pathSelections: PdfPathSelections;
}

export const CinematicPlayerView = ({ pathSelections }: CinematicPlayerViewProps) => {
  const flow = useFlowStore((state) => state.flow);
  const { beats, isLoading, error } = useCinematicBeats(pathSelections);
  const branding = resolveOrgBranding();

  if (isLoading || !beats) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3">
        <PeacockStudioLoader size={96} />
        <p className="text-sm text-slate-500">Preparing cinematic walkthrough…</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-amber-800">{error}</p>;
  }

  if (!beats.length) {
    return (
      <p className="text-sm text-slate-500">This flow has no steps to play as a walkthrough.</p>
    );
  }

  const inputProps: FlowVideoCompositionProps = {
    beats,
    title: flow?.flow.title ?? 'Untitled Flow',
    description: stripHtmlTags(flow?.flow.description ?? ''),
    version: flow?.flow.version ?? '',
    logoUrl: branding.logoUrl,
    primaryColor: branding.primaryColor,
    appName: branding.appName,
  };

  return (
    <div className="h-full min-h-0 w-full overflow-hidden rounded-2xl bg-slate-950">
      <Player
        component={FlowVideoComposition}
        inputProps={inputProps}
        durationInFrames={getCompositionDurationInFrames(beats)}
        compositionWidth={VIDEO_WIDTH}
        compositionHeight={VIDEO_HEIGHT}
        fps={VIDEO_FPS}
        controls
        autoPlay
        loop={false}
        showVolumeControls={false}
        spaceKeyToPlayOrPause
        acknowledgeRemotionLicense
        className="h-full w-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
