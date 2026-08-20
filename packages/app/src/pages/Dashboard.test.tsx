import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: () => 'cloud',
  useIsGuestSession: () => false,
}));

vi.mock('@/hooks/useCloudInitError', () => ({
  useCloudInitError: () => null,
  useCloudInitErrorDetail: () => null,
}));

vi.mock('@/hooks/useFlowLibrary', () => ({
  useFlowLibrary: () => ({
    summaries: [
      {
        id: 'doc-1',
        title: 'Demo Doc',
        updatedAt: Date.now(),
        createdAt: Date.now(),
        stepCount: 3,
        version: '1.0.0',
      },
    ],
    isLoading: false,
    error: null,
    deleteDocument: vi.fn(),
    duplicateDocument: vi.fn(),
  }),
}));

vi.mock('@/hooks/useProductTourLibrary', () => ({
  useProductTourLibrary: () => ({
    summaries: [],
    isLoading: false,
    error: null,
    deleteTourById: vi.fn(),
  }),
}));

vi.mock('@/hooks/useFirstTimeHint', () => ({
  useDashboardFirstTimeHint: () => ({
    activeHintId: null,
    dismissHint: vi.fn(),
  }),
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => true,
}));

vi.mock('@/cloud/planLimits', () => ({
  getGuestVisibleDocLimit: () => 3,
}));

vi.mock('@/components/extension/ExtensionMissingBanner', () => ({
  ExtensionMissingBanner: () => null,
}));
vi.mock('@/components/motion/SmoothLoadReveal', () => ({
  SmoothLoadReveal: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/dashboard/DashboardHero', () => ({
  DashboardHero: () => <div>dashboard-hero</div>,
}));
vi.mock('@/components/dashboard/DashboardStats', () => ({
  DashboardStats: () => <div>dashboard-stats</div>,
}));
vi.mock('@/components/dashboard/DashboardAnalyticsSection', () => ({
  DashboardAnalyticsSection: () => <div>dashboard-analytics</div>,
}));
vi.mock('@/components/dashboard/FlowLibrarySection', () => ({
  FlowLibrarySection: () => <div>flow-library</div>,
}));
vi.mock('@/components/dashboard/ProductTourLibraryCards', () => ({
  ProductTourLibraryCards: () => <div>tour-cards</div>,
}));
vi.mock('@/components/dashboard/LibraryEmptyCta', () => ({
  LibraryEmptyCta: ({ title }: { title: string }) => <div>{title}</div>,
}));
vi.mock('@/components/dashboard/ViewModeToggle', () => ({
  ViewModeToggle: () => null,
}));
vi.mock('@/components/dashboard/DashboardEmptyState', () => ({
  DashboardEmptyState: () => null,
}));
vi.mock('@/components/dashboard/GuestLibraryHiddenNotice', () => ({
  GuestLibraryHiddenNotice: () => null,
}));
vi.mock('@/components/dashboard/GuestLibraryIntroModal', () => ({
  GuestLibraryIntroModal: () => null,
}));
vi.mock('@/components/library/LibraryPageHeader', () => ({
  DashboardRecentSection: ({ title, children }: { title: string; children?: React.ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));
vi.mock('@/components/ConfirmDialog', () => ({ ConfirmDialog: () => null }));
vi.mock('@/components/dashboard/DeleteDocumentConfirmContent', () => ({
  DeleteDocumentConfirmContent: () => null,
}));
vi.mock('@/components/dashboard/DeleteProductTourConfirmContent', () => ({
  DeleteProductTourConfirmContent: () => null,
}));

import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('renders dashboard sections with library content', () => {
    renderWithRouter(<Dashboard />, { initialEntries: ['/dashboard'] });
    expect(screen.getByText('dashboard-hero')).toBeInTheDocument();
    expect(screen.getByText('dashboard-stats')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Product Tours' })).toBeInTheDocument();
    expect(screen.getByText('flow-library')).toBeInTheDocument();
  });
});
