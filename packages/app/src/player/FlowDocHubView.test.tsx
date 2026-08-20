import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const flowState = {
  flow: {
    flow: { title: 'Hub Flow', description: '', version: '1.0.0', tags: [] },
    metadata: { createdAt: 1, captureEnvironment: null },
  },
  steps: [],
  stepResources: [],
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: (selector: (s: typeof flowState) => unknown) => selector(flowState),
}));

vi.mock('@/hooks/useBranchingPlayback', () => ({
  useBranchingPlayback: () => ({
    playableStepCount: 2,
    sectionCount: 0,
    branchCount: 0,
    segments: [],
  }),
}));

vi.mock('@/player/FlowDocHubHeader', () => ({
  FlowDocHubHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
vi.mock('@/components/flow/FlowDetailsOverviewLayout', () => ({
  FlowDetailsOverviewLayout: () => <div>overview-layout</div>,
}));
vi.mock('@/player/FlowDocResourcesOverview', () => ({
  FlowDocResourcesOverview: () => <div>resources</div>,
  countResourcesForOutline: () => 0,
}));
vi.mock('@/player/FlowDocJourneyStrip', () => ({
  FlowDocJourneyStrip: () => <div>journey</div>,
}));
vi.mock('@/player/FlowDocQuickGlance', () => ({
  FlowDocQuickGlance: () => <div>glance</div>,
}));
vi.mock('@/player/FlowDocModeChooser', () => ({
  FlowDocModeChooser: () => <div>mode-chooser</div>,
}));

import { FlowDocHubView } from './FlowDocHubView';

describe('FlowDocHubView', () => {
  it('renders hub sections', () => {
    render(
      <MemoryRouter>
        <FlowDocHubView documentId="doc-1" onSelectMode={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /hub flow/i })).toBeInTheDocument();
    expect(screen.getByText('overview-layout')).toBeInTheDocument();
    expect(screen.getByText('mode-chooser')).toBeInTheDocument();
  });
});
