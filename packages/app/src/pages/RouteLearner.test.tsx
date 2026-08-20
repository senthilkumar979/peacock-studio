import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

vi.mock('@/hooks/useRouteLearner', () => ({
  useRouteLearner: () => ({
    routeId: 'route-1',
    route: { id: 'route-1', title: 'Learner Route', description: 'Desc' },
    isLoading: false,
    isLoaded: true,
    error: null,
    hasPlayableContent: true,
    state: { stepIndex: 0, segmentIndex: 0 },
    segments: [{ id: 'seg-1' }],
    stepCount: 1,
    pendingTransition: null,
    highlightedSegmentIndex: 0,
    isTransitionActive: false,
    currentNode: null,
    branchActive: false,
    formActive: false,
    interestActive: false,
    formResponses: {},
    selectedTopicIds: [],
    activeDocumentId: null,
    canGoPrevious: false,
    canGoNext: true,
    isComplete: false,
    isAtRouteStart: true,
    isAtRouteEnd: false,
    handleSelectSegment: vi.fn(),
    confirmTransition: vi.fn(),
    handleDocumentLoaded: vi.fn(),
    handleBranchSelect: vi.fn(),
    handleFormChange: vi.fn(),
    handleInterestToggle: vi.fn(),
    handlePrevious: vi.fn(),
    handleNext: vi.fn(),
    goToFirstSegment: vi.fn(),
    goToLastSegment: vi.fn(),
    pendingDemoSummary: null,
  }),
}));

vi.mock('@/components/AppHeader', () => ({
  AppHeader: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <header>
      <h1>{title}</h1>
      {children}
    </header>
  ),
}));

vi.mock('@/route-learner/RouteLearnerSidebar', () => ({
  RouteLearnerSidebar: () => <div>sidebar</div>,
}));
vi.mock('@/route-learner/RouteLearnerProgress', () => ({
  RouteLearnerProgress: () => <div>progress</div>,
}));
vi.mock('@/route-learner/RouteLearnerStage', () => ({
  RouteLearnerStage: () => <div>stage</div>,
}));
vi.mock('@/route-learner/RouteLearnerControls', () => ({
  RouteLearnerControls: () => <div>controls</div>,
}));

import { RouteLearner } from './RouteLearner';

describe('RouteLearner', () => {
  it('renders learner chrome', () => {
    renderWithRouter(<RouteLearner />);
    expect(screen.getByRole('heading', { name: /learner route/i })).toBeInTheDocument();
    expect(screen.getByText('sidebar')).toBeInTheDocument();
    expect(screen.getByText('stage')).toBeInTheDocument();
    expect(screen.getByText('controls')).toBeInTheDocument();
  });
});
