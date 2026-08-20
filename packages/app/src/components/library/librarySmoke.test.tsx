import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { LIBRARY_GUIDE_IDS } from '@/constants/libraryGuideContent';

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isSignedIn: false, isLoaded: true }),
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => false,
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: () => 'guest',
  useIsGuestSession: () => true,
}));

vi.mock('@/hooks/useOrganization', () => ({
  useActiveOrganization: () => ({
    isAdmin: false,
    memberships: [],
    organizationId: null,
    organizationName: null,
  }),
}));

vi.mock('@/hooks/useIsPlatformSuperAdmin', () => ({
  useIsPlatformSuperAdmin: () => ({ isPlatformSuperAdmin: false }),
}));

vi.mock('@/hooks/useFlowLibrary', () => ({
  useFlowLibrary: () => ({
    summaries: [],
    isLoading: false,
    error: null,
    deleteDocument: vi.fn(),
    duplicateDocument: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/hooks/useProductTourLibrary', () => ({
  useProductTourLibrary: () => ({
    summaries: [],
    isLoading: false,
    error: null,
    deleteTourById: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/hooks/useLibraryGuidePanel', () => ({
  useLibraryGuidePanel: () => ({
    showGuide: false,
    showGuideToggle: false,
    isGuideOpen: false,
    toggleGuide: vi.fn(),
  }),
}));

vi.mock('@/cloud/planLimits', () => ({
  getGuestVisibleDocLimit: () => 5,
}));

vi.mock('@/components/auth/CloudSyncProvider', () => ({
  refreshCloudMemberships: vi.fn(),
}));

vi.mock('@/utils/notify', () => ({
  notifyPromise: vi.fn((p: Promise<unknown>) => p),
}));

import { FlowDocsLibraryPanel } from './FlowDocsLibraryPanel';
import { ProductToursLibraryPanel } from './ProductToursLibraryPanel';
import { LibraryNav } from './LibraryNav';
import { FlowDocsLibraryToolbar } from './FlowDocsLibraryToolbar';
import { OrgSwitcher } from './OrgSwitcher';
import { LibraryGuideSection } from './LibraryGuideSection';

describe('library smoke', () => {
  it('FlowDocsLibraryPanel empty state', async () => {
    renderWithProviders(<FlowDocsLibraryPanel />);
    expect(await screen.findByRole('heading', { name: 'Flow Docs' })).toBeInTheDocument();
  });

  it('ProductToursLibraryPanel heading', async () => {
    renderWithProviders(<ProductToursLibraryPanel />);
    expect(await screen.findByRole('heading', { name: 'Product Tours' })).toBeInTheDocument();
  });

  it('LibraryNav shows nav landmark', () => {
    renderWithProviders(<LibraryNav />, { routerEntries: ['/dashboard'] });
    expect(screen.getByRole('navigation', { name: 'Library' })).toBeInTheDocument();
  });

  it('FlowDocsLibraryToolbar renders search', () => {
    renderWithProviders(
      <FlowDocsLibraryToolbar
        searchQuery=""
        sortMode="newest"
        statusFilter="all"
        viewMode="card"
        onSearchChange={vi.fn()}
        onSortChange={vi.fn()}
        onStatusFilterChange={vi.fn()}
        onViewChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /Search documentations/i })).toBeInTheDocument();
  });

  it('OrgSwitcher returns null without org', () => {
    const { container } = renderWithProviders(<OrgSwitcher />);
    expect(container).toBeEmptyDOMElement();
  });

  it('LibraryGuideSection shows guide headline', () => {
    renderWithProviders(<LibraryGuideSection guideId={LIBRARY_GUIDE_IDS.flowDocs} />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });
});
