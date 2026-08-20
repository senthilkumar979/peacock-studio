import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAtRoute } from './test/pageTestUtils';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ tourId: 'tour-1' }) };
});

vi.mock('@/hooks/useSavedProductTour', () => ({
  useSavedProductTour: () => ({
    tour: { id: 'tour-1', title: 'Tour', features: [], completionCta: null },
    isLoading: false,
    isLoaded: true,
    error: null,
  }),
}));

vi.mock('@/hooks/usePersistProductTour', () => ({
  usePersistProductTour: vi.fn(),
}));

vi.mock('@/hooks/useFirstTimeHint', () => ({
  useFirstTimeHintTour: () => ({
    activeHintId: null,
    dismissHint: vi.fn(),
    skipAllHints: vi.fn(),
  }),
}));

const builderState = {
  tour: { id: 'tour-1', title: 'Tour', features: [], completionCta: null },
  setCompletionCta: vi.fn(),
};

vi.mock('@/store/productTourBuilderStore', () => ({
  useProductTourBuilderStore: (selector: (s: typeof builderState) => unknown) =>
    selector(builderState),
}));

vi.mock('@/services/flowLibraryService', () => ({
  listFlowSummaries: vi.fn(async () => []),
}));

vi.mock('@/product-tour-builder/ProductTourBuilderToolbar', () => ({
  ProductTourBuilderToolbar: () => <div>tour-toolbar</div>,
}));
vi.mock('@/product-tour-builder/ProductTourFeatureList', () => ({
  ProductTourFeatureList: () => <div>feature-list</div>,
}));
vi.mock('@/product-tour-builder/ProductTourOverviewCanvas', () => ({
  ProductTourOverviewCanvas: () => <div>overview-canvas</div>,
}));
vi.mock('@/components/onboarding/HintAnchor', () => ({
  HintAnchor: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

import { ProductTourBuilder } from './ProductTourBuilder';

describe('ProductTourBuilder', () => {
  it('renders builder layout', () => {
    renderAtRoute('/tours/tour-1/edit', <ProductTourBuilder />);
    expect(screen.getByText('tour-toolbar')).toBeInTheDocument();
    expect(screen.getByText('feature-list')).toBeInTheDocument();
    expect(screen.getByText('overview-canvas')).toBeInTheDocument();
    expect(screen.getByText(/completion cta/i)).toBeInTheDocument();
  });
});
