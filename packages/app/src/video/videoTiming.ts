import type { VideoBeat } from './videoBeats';
import {
  COVER_FRAMES,
  END_FRAMES,
  MARKER_TOTAL_FRAMES,
  NAV_FRAMES,
} from './videoConstants';

export function framesForBeat(beat: VideoBeat): number {
  if (beat.kind === 'step' && beat.screenshotUrl && beat.marker) {
    return MARKER_TOTAL_FRAMES;
  }
  return NAV_FRAMES;
}

export function getCompositionDurationInFrames(beats: VideoBeat[]): number {
  const beatFrames = beats.reduce((total, beat) => total + framesForBeat(beat), 0);
  return COVER_FRAMES + beatFrames + END_FRAMES;
}

export function getBeatStartFrame(beats: VideoBeat[], beatIndex: number): number {
  let frame = COVER_FRAMES;
  const end = Math.min(Math.max(beatIndex, 0), beats.length);
  for (let index = 0; index < end; index += 1) {
    const beat = beats[index];
    if (beat) frame += framesForBeat(beat);
  }
  return frame;
}
