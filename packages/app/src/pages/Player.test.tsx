import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAtRoute } from './test/pageTestUtils';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ documentId: 'doc-1' }),
  };
});

vi.mock('@/hooks/useSavedDocument', () => ({
  useSavedDocument: () => ({ isLoading: false, isLoaded: true, error: null }),
}));

vi.mock('@/hooks/useHydrateResourceLabels', () => ({
  useHydrateResourceLabels: vi.fn(),
}));

vi.mock('@/hooks/useFlowDocDefaultView', () => ({
  useFlowDocDefaultView: () => 'hub',
}));

vi.mock('@/hooks/useFirstTimeHint', () => ({
  useFirstTimeHintTour: () => ({
    activeHintId: null,
    dismissHint: vi.fn(),
    skipAllHints: vi.fn(),
  }),
}));

const flowState = {
  steps: [],
  shareSettings: null,
  setViewerFilter: vi.fn(),
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: (selector: (s: typeof flowState) => unknown) => selector(flowState),
}));

vi.mock('@/cloud/repositories/analyticsRepository', () => ({
  recordOrgEvent: vi.fn(),
}));

vi.mock('@/analytics/analyticsClient', () => ({ trackEvent: vi.fn() }));

vi.mock('@/components/auth/GuestDocumentGate', () => ({
  GuestDocumentGate: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/errors/AppErrorBoundary', () => ({
  AppErrorBoundary: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/player/FlowDocExperienceViews', () => ({
  FlowDocExperienceViews: () => <div>experience-views</div>,
}));

import { Player } from './Player';

describe('Player', () => {
  it('renders experience views when document loaded', () => {
    renderAtRoute('/docs/doc-1', <Player />);
    expect(screen.getByText('experience-views')).toBeInTheDocument();
  });
});
