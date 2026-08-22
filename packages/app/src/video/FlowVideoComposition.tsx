import { AbsoluteFill, Sequence } from 'remotion';
import type { FlowVideoCompositionProps } from './videoBeats';
import { COVER_FRAMES, END_FRAMES } from './videoConstants';
import { framesForBeat, getBeatStartFrame } from './videoTiming';
import { VideoCoverScene } from './VideoCoverScene';
import { VideoEndScene } from './VideoEndScene';
import { VideoNavScene } from './VideoNavScene';
import { VideoStepScene } from './VideoStepScene';

export const FlowVideoComposition = ({
  beats,
  title,
  description,
  version,
  logoUrl,
  primaryColor,
  appName,
}: FlowVideoCompositionProps) => (
  <AbsoluteFill className="bg-slate-950">
    <Sequence durationInFrames={COVER_FRAMES}>
      <VideoCoverScene
        title={title}
        description={description}
        version={version}
        logoUrl={logoUrl}
        primaryColor={primaryColor}
        appName={appName}
      />
    </Sequence>
    {beats.map((beat, index) => (
      <Sequence
        key={`${beat.kind}-${beat.stepNumber}-${index}`}
        from={getBeatStartFrame(beats, index)}
        durationInFrames={framesForBeat(beat)}
      >
        {beat.kind === 'nav' ? (
          <VideoNavScene beat={beat} />
        ) : (
          <VideoStepScene beat={beat} />
        )}
      </Sequence>
    ))}
    <Sequence from={getBeatStartFrame(beats, beats.length)} durationInFrames={END_FRAMES}>
      <VideoEndScene
        title={title}
        stepCount={beats.length}
        logoUrl={logoUrl}
        appName={appName}
        primaryColor={primaryColor}
      />
    </Sequence>
  </AbsoluteFill>
);
