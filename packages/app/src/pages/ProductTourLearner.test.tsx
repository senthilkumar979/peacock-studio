import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAtRoute } from './test/pageTestUtils';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ tourId: 'tour-1' }) };
});

const tour = {
  id: 'tour-1',
  title: 'Onboarding Tour',
  description: 'Learn the product',
  personaId: 'persona-1',
  features: [],
  completionCta: null,
};

vi.mock('@/hooks/useSavedProductTour', () => ({
  useSavedProductTour: () => ({
    tour,
    isLoading: false,
    isLoaded: true,
    error: null,
  }),
}));

vi.mock('@/hooks/useProductTourLearner', () => ({
  useProductTourLearner: () => ({
    isLoading: false,
    currentSegment: { type: 'persona-intro' },
    goNext: vi.fn(),
    goPrevious: vi.fn(),
    jumpToSegment: vi.fn(),
    setCurrentIndex: vi.fn(),
    canGoNext: true,
    canGoPrevious: false,
    segmentIndex: 0,
    segments: [{ type: 'persona-intro' }],
    stepCounts: [],
    demoMeta: {},
  }),
}));

vi.mock('@/hooks/useFirstTimeHint', () => ({
  useFirstTimeHintTour: () => ({
    activeHintId: null,
    dismissHint: vi.fn(),
    skipAllHints: vi.fn(),
  }),
}));

vi.mock('@/hooks/useKeyboard', () => ({ useKeyboard: vi.fn() }));

vi.mock('@/cloud/repositories/analyticsRepository', () => ({
  recordOrgEvent: vi.fn(),
}));

vi.mock('@/services/productTourLibraryService', () => ({
  getPersona: vi.fn(async () => ({
    id: 'persona-1',
    name: 'Alex',
    role: 'PM',
  })),
}));

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: vi.fn(),
}));

vi.mock('@/store/productTourBuilderStore', () => ({
  getSortedFeatures: () => [],
}));

vi.mock('@/utils/createProductTour', () => ({
  countTourDemos: () => 0,
}));

vi.mock('@/utils/productTourLearner', () => ({
  countTourStepsFromCounts: () => 0,
  estimateTourDurationMinutes: vi.fn(async () => 5),
  findDemoIntroSegmentIndex: () => -1,
  findFeatureIntroSegmentIndex: () => -1,
  getTourDemoDisplayTitle: () => 'Demo',
}));

vi.mock('@/components/AppHeader', () => ({
  AppHeader: ({ title }: { title?: string }) => <header>{title}</header>,
}));

vi.mock('@/components/onboarding/HintAnchor', () => ({
  HintAnchor: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/product-tour-builder/ProductTourOverviewCanvas', () => ({
  ProductTourOverviewCanvas: () => <div>overview</div>,
}));

vi.mock('@/route-learner/RoutePeacockPlayer', () => ({
  RoutePeacockPlayer: () => <div>route-player</div>,
}));

vi.mock('@/player/PlayerStep', () => ({ PlayerStep: () => <div>player-step</div> }));

vi.mock('@/product-tour-learner/TourCompletePanel', () => ({
  TourCompletePanel: () => <div>complete</div>,
}));
vi.mock('@/product-tour-learner/TourFeatureIntroPanel', () => ({
  TourFeatureIntroPanel: () => <div>feature-intro</div>,
}));
vi.mock('@/product-tour-learner/TourPersonaIntroPanel', () => ({
  TourPersonaIntroPanel: () => <div>persona-intro</div>,
}));
vi.mock('@/product-tour-learner/TourDetailsPanel', () => ({
  TourDetailsPanel: () => <div>details-panel</div>,
}));
vi.mock('@/product-tour-learner/TourDemoIntroPanel', () => ({
  TourDemoIntroPanel: () => <div>demo-intro</div>,
}));
vi.mock('@/product-tour-learner/TourBranchPointPanel', () => ({
  TourBranchPointPanel: () => <div>branch-panel</div>,
}));

import { ProductTourLearner } from './ProductTourLearner';

describe('ProductTourLearner', () => {
  it('renders persona intro segment', async () => {
    renderAtRoute('/tours/tour-1', <ProductTourLearner />);
    expect(await screen.findByText('persona-intro')).toBeInTheDocument();
  });
});
