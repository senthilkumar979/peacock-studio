import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@remotion/player', () => ({
  Player: ({ durationInFrames }: { durationInFrames: number }) => (
    <div data-testid="remotion-player">{durationInFrames}</div>
  ),
}));

vi.mock('./FlowVideoComposition', () => ({
  FlowVideoComposition: () => null,
}));

vi.mock('./useCinematicBeats', () => ({
  useCinematicBeats: () => ({
    beats: [
      {
        kind: 'step',
        stepNumber: 1,
        title: 'Click',
        description: '',
        screenshotUrl: 'blob:1',
        marker: { x: 0.5, y: 0.5 },
        url: 'https://example.com',
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/store/flowStore', () => ({
  useFlowStore: (selector: (state: { flow: { flow: { title: string; description: string; version: string } } }) => unknown) =>
    selector({
      flow: { flow: { title: 'Demo', description: 'A walkthrough', version: '1.0' } },
    }),
}));

import { CinematicPlayerView } from './CinematicPlayerView';
import { COVER_FRAMES, END_FRAMES, MARKER_TOTAL_FRAMES } from './videoConstants';

describe('CinematicPlayerView', () => {
  it('mounts the Remotion player with composition duration', () => {
    render(<CinematicPlayerView pathSelections={{}} />);
    expect(screen.getByTestId('remotion-player')).toHaveTextContent(
      String(COVER_FRAMES + MARKER_TOTAL_FRAMES + END_FRAMES),
    );
  });
});
