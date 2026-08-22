import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';
import type { VideoBeat } from './videoBeats';
import { VideoBrowserChrome } from './VideoBrowserChrome';
import {
  MARKER_HOLD_FRAMES,
  MARKER_HOLD_IN_FRAMES,
  MARKER_ZOOM_IN_FRAMES,
  MARKER_ZOOM_OUT_FRAMES,
  VIDEO_ZOOM_SCALE,
} from './videoConstants';

interface VideoStepSceneProps {
  beat: VideoBeat;
}

function zoomScaleForFrame(frame: number, shouldZoom: boolean): number {
  if (!shouldZoom) return 1;
  const zoomStart = MARKER_HOLD_IN_FRAMES;
  const holdStart = zoomStart + MARKER_ZOOM_IN_FRAMES;
  const zoomOutStart = holdStart + MARKER_HOLD_FRAMES;
  const zoomOutEnd = zoomOutStart + MARKER_ZOOM_OUT_FRAMES;
  return interpolate(
    frame,
    [zoomStart, holdStart, zoomOutStart, zoomOutEnd],
    [1, VIDEO_ZOOM_SCALE, VIDEO_ZOOM_SCALE, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
}

export const VideoStepScene = ({ beat }: VideoStepSceneProps) => {
  const frame = useCurrentFrame();
  const shouldZoom = Boolean(beat.screenshotUrl && beat.marker);
  const scale = zoomScaleForFrame(frame, shouldZoom);
  const originX = beat.marker ? beat.marker.x * 100 : 50;
  const originY = beat.marker ? beat.marker.y * 100 : 50;
  const pulse = interpolate(frame % 30, [0, 15, 30], [0.45, 1, 0.45], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="bg-slate-950 px-16 py-12">
      <div className="flex h-full w-full flex-col gap-6">
        <div className="min-h-0 flex-1">
          <VideoBrowserChrome url={beat.url}>
            {beat.screenshotUrl ? (
              <div
                className="relative h-full w-full"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: `${originX}% ${originY}%`,
                }}
              >
                <Img
                  src={beat.screenshotUrl}
                  className="h-full w-full object-contain"
                />
                {beat.marker ? (
                  <div
                    className="absolute h-8 w-8 rounded-full bg-sky-500"
                    style={{
                      left: `${beat.marker.x * 100}%`,
                      top: `${beat.marker.y * 100}%`,
                      opacity: pulse,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ) : null}
              </div>
            ) : null}
          </VideoBrowserChrome>
        </div>
        <div className="shrink-0 rounded-2xl bg-slate-900 px-8 py-5 text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-400">
            Step {beat.stepNumber}
          </p>
          <p className="mt-1 text-3xl font-semibold text-white">{beat.title}</p>
          {beat.description ? (
            <p className="mt-2 text-lg text-slate-300">{beat.description}</p>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
