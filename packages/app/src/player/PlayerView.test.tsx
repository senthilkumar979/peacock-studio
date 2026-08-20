import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const flowState = {
  flow: {
    flow: { title: 'Player Flow', description: '', version: '1.0.0', tags: [] },
    metadata: { createdAt: 1 },
  },
  screenshotUrls: {},
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: (selector: (s: typeof flowState) => unknown) => selector(flowState),
}));

vi.mock('@/hooks/useBranchingPlayback', () => ({
  useBranchingPlayback: () => ({
    currentSegment: {
      type: 'step',
      step: {
        id: 's1',
        title: 'Step',
        notes: '',
        generatedTitle: 'Step',
        generatedDescription: 'Do it',
        screenshotId: '',
        event: { type: 'click', timestamp: 0 } as never,
      },
      stepNumber: 1,
    },
    currentIndex: 0,
    segments: [{ type: 'step' }, { type: 'step' }],
    totalNavigableSegments: 2,
    goNext: vi.fn(),
    goPrevious: vi.fn(),
    replay: vi.fn(),
    selectBranchPath: vi.fn(),
    selectedPathId: null,
    setSelectedPathId: vi.fn(),
    playableStepCount: 1,
    sectionCount: 0,
    branchCount: 0,
    isAtFinale: false,
    isLoadingLinked: false,
    linkedError: null,
    linkedPlayback: null,
  }),
}));

vi.mock('@/hooks/useKeyboard', () => ({ useKeyboard: vi.fn() }));
vi.mock('@/hooks/usePresenterMode', () => ({
  usePresenterMode: () => ({ rootRef: { current: null }, isPresenter: false }),
}));

vi.mock('@/player/FlowDocViewHeader', () => ({
  FlowDocViewHeader: ({ title }: { title?: string }) => <header>{title}</header>,
}));
vi.mock('@/components/FlowSectionCard', () => ({ FlowSectionCard: () => null }));
vi.mock('./FlowBranchChoicePanel', () => ({ FlowBranchChoicePanel: () => null }));
vi.mock('./PlayerControls', () => ({ PlayerControls: () => <div>controls</div> }));
vi.mock('./PlayerFinale', () => ({ PlayerFinale: () => <div>finale</div> }));
vi.mock('./PlayerStep', () => ({ PlayerStep: () => <div>player-step</div> }));

import { PlayerView } from './PlayerView';

describe('PlayerView', () => {
  it('renders player chrome and step', () => {
    render(
      <MemoryRouter>
        <PlayerView documentId="doc-1" onModeChange={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText('player-step')).toBeInTheDocument();
    expect(screen.getByText('controls')).toBeInTheDocument();
  });
});
