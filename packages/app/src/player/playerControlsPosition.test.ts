import { describe, expect, it } from 'vitest';
import {
  getPlayerControlsPosition,
  getPlayerControlsProgressLabel,
  getPlayerProgressPercent,
} from './playerControlsPosition';

function playback(partial: Record<string, unknown>) {
  return {
    isAtFinale: false,
    isLoadingLinked: false,
    linkedError: null,
    linkedPlayback: null,
    currentSegment: null,
    currentIndex: 0,
    totalNavigableSegments: 1,
    ...partial,
  } as Parameters<typeof getPlayerControlsPosition>[0];
}

describe('getPlayerControlsPosition', () => {
  it('returns finale when at end', () => {
    expect(getPlayerControlsPosition(playback({ isAtFinale: true }))).toEqual({
      kind: 'finale',
      title: 'Guide complete',
    });
  });

  it('returns loading status for linked demos', () => {
    expect(getPlayerControlsPosition(playback({ isLoadingLinked: true }))).toEqual({
      kind: 'status',
      title: 'Loading linked demo…',
    });
  });

  it('returns linked error status', () => {
    expect(
      getPlayerControlsPosition(playback({ linkedError: 'Failed to load path' })),
    ).toEqual({ kind: 'status', title: 'Failed to load path' });
  });

  it('returns path position from linked playback', () => {
    expect(
      getPlayerControlsPosition(
        playback({
          linkedPlayback: {
            path: { label: 'Admin path' },
            stepIndex: 1,
            steps: [{ title: 'Open admin' }, { title: 'Save' }],
          },
        }),
      ),
    ).toEqual({
      kind: 'path',
      title: 'Admin path',
      subtitle: 'Save',
      stepNumber: 2,
    });
  });

  it('returns generic status when there is no segment', () => {
    expect(getPlayerControlsPosition(playback({}))).toEqual({
      kind: 'status',
      title: 'Guide',
    });
  });

  it('returns section, branch, and step kinds from current segment', () => {
    expect(
      getPlayerControlsPosition(
        playback({
          currentSegment: { type: 'section', section: { title: 'Setup' } },
        }),
      ),
    ).toEqual({ kind: 'section', title: 'Setup' });

    expect(
      getPlayerControlsPosition(
        playback({
          currentSegment: { type: 'branch', branch: { title: 'Choose role' } },
        }),
      ),
    ).toEqual({ kind: 'branch', title: 'Choose role' });

    expect(
      getPlayerControlsPosition(
        playback({
          currentSegment: {
            type: 'step',
            step: { title: 'Click save' },
            stepNumber: 3,
          },
        }),
      ),
    ).toEqual({ kind: 'step', title: 'Click save', stepNumber: 3 });
  });
});

describe('getPlayerControlsProgressLabel', () => {
  it('labels linked path progress', () => {
    expect(
      getPlayerControlsProgressLabel(
        playback({
          linkedPlayback: {
            stepIndex: 0,
            steps: [{}, {}],
          },
        }),
      ),
    ).toBe('Step 1 of 2 in path');
  });

  it('labels main guide progress', () => {
    expect(
      getPlayerControlsProgressLabel(
        playback({ currentIndex: 2, totalNavigableSegments: 5 }),
      ),
    ).toBe('3 of 5 in guide');
  });
});

describe('getPlayerProgressPercent', () => {
  it('returns 100 at finale', () => {
    expect(getPlayerProgressPercent(playback({ isAtFinale: true }))).toBe(100);
  });

  it('computes linked path percent and handles empty steps', () => {
    expect(
      getPlayerProgressPercent(
        playback({
          linkedPlayback: { stepIndex: 1, steps: [{}, {}, {}] },
        }),
      ),
    ).toBe(67);

    expect(
      getPlayerProgressPercent(playback({ linkedPlayback: { stepIndex: 0, steps: [] } })),
    ).toBe(0);
  });

  it('returns 0 when guide has one or fewer segments', () => {
    expect(
      getPlayerProgressPercent(playback({ currentIndex: 0, totalNavigableSegments: 1 })),
    ).toBe(0);
  });

  it('computes main guide percent', () => {
    expect(
      getPlayerProgressPercent(playback({ currentIndex: 1, totalNavigableSegments: 4 })),
    ).toBe(50);
  });
});
