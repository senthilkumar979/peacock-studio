import { describe, expect, it } from 'vitest';
import type { VideoBeat } from './videoBeats';
import {
  COVER_FRAMES,
  END_FRAMES,
  MARKER_TOTAL_FRAMES,
  NAV_FRAMES,
} from './videoConstants';
import {
  framesForBeat,
  getBeatStartFrame,
  getCompositionDurationInFrames,
} from './videoTiming';

const markerBeat: VideoBeat = {
  kind: 'step',
  stepNumber: 1,
  title: 'Click',
  description: 'Click save',
  screenshotUrl: 'blob:shot',
  marker: { x: 0.4, y: 0.5 },
  url: 'https://example.com',
};

const navBeat: VideoBeat = {
  kind: 'nav',
  stepNumber: 2,
  title: 'Go',
  description: '',
  screenshotUrl: null,
  marker: null,
  url: 'https://example.com/next',
};

const stillBeat: VideoBeat = {
  kind: 'step',
  stepNumber: 3,
  title: 'Page',
  description: '',
  screenshotUrl: 'blob:page',
  marker: null,
  url: 'https://example.com/page',
};

describe('videoTiming', () => {
  it('uses zoom duration for marker steps and nav duration otherwise', () => {
    expect(framesForBeat(markerBeat)).toBe(MARKER_TOTAL_FRAMES);
    expect(framesForBeat(navBeat)).toBe(NAV_FRAMES);
    expect(framesForBeat(stillBeat)).toBe(NAV_FRAMES);
  });

  it('includes cover and end cards in composition duration', () => {
    expect(getCompositionDurationInFrames([markerBeat, navBeat])).toBe(
      COVER_FRAMES + MARKER_TOTAL_FRAMES + NAV_FRAMES + END_FRAMES,
    );
    expect(getCompositionDurationInFrames([])).toBe(COVER_FRAMES + END_FRAMES);
  });

  it('returns the start frame of each beat after the cover', () => {
    const beats = [markerBeat, navBeat];
    expect(getBeatStartFrame(beats, 0)).toBe(COVER_FRAMES);
    expect(getBeatStartFrame(beats, 1)).toBe(COVER_FRAMES + MARKER_TOTAL_FRAMES);
    expect(getBeatStartFrame(beats, 2)).toBe(
      COVER_FRAMES + MARKER_TOTAL_FRAMES + NAV_FRAMES,
    );
  });
});
