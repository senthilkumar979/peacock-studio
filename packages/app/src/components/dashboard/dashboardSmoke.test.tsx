import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { SavedFlowSummary } from '@/types/savedFlow';
import { EMPTY_ANALYTICS_SUMMARY } from '@/types/analytics';

vi.mock('@/cloud/planLimits', () => ({
  getGuestVisibleDocLimit: () => 3,
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => true,
}));

vi.mock('@/hooks/useOrgAnalytics', () => ({
  useOrgAnalytics: () => ({
    summary: {
      ...EMPTY_ANALYTICS_SUMMARY,
      totals: { views: 12, embedViews: 3, pdfExports: 2 },
      daily: [{ day: '2026-01-01', views: 4 }],
      topReferrers: [{ referrerDomain: 'google.com', count: 2 }],
    },
    isLoading: false,
    isAvailable: true,
  }),
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useIsGuestSession: () => false,
  useCanDeleteLibraryItems: () => true,
  useSessionMode: () => 'cloud',
}));

vi.mock('@/components/share/ShareDocumentModal', () => ({
  ShareDocumentModal: () => null,
}));
vi.mock('@/components/share/ShareRouteModal', () => ({
  ShareRouteModal: () => null,
}));
vi.mock('@/components/share/ShareProductTourModal', () => ({
  ShareProductTourModal: () => null,
}));

vi.mock('@/hooks/useWorkflowArtifacts', () => ({
  useDocumentWorkflowArtifacts: () => ({
    summaries: [],
    isLoading: false,
  }),
}));

import { FlowLibraryCards } from './FlowLibraryCards';
import { FlowLibraryTable } from './FlowLibraryTable';
import { FlowLibraryList } from './FlowLibraryList';
import { FlowLibrarySection } from './FlowLibrarySection';
import { FlowDocumentActions } from './FlowDocumentActions';
import { DashboardHero } from './DashboardHero';
import { DashboardStats } from './DashboardStats';
import { ExpandableLibrarySearch } from './ExpandableLibrarySearch';
import { ProductTourLibraryCards } from './ProductTourLibraryCards';
import { RouteLibraryCards } from './RouteLibraryCards';
import { RouteDocumentActions } from './RouteDocumentActions';
import { DashboardAnalyticsSection } from './DashboardAnalyticsSection';
import { DashboardWorkflowOutputsSection } from './DashboardWorkflowOutputsSection';
import { GuestLibraryIntroModal } from './GuestLibraryIntroModal';

const summary: SavedFlowSummary = {
  id: 'doc-1',
  title: 'Payroll flow',
  description: 'Desc',
  version: '1.0',
  status: 'live',
  generatedAt: Date.now(),
  updatedAt: Date.now(),
  stepCount: 3,
};

describe('dashboard smoke', () => {
  it('FlowLibraryCards shows title', () => {
    renderWithProviders(
      <FlowLibraryCards summaries={[summary]} onRequestDelete={vi.fn()} />,
    );
    expect(screen.getByText('Payroll flow')).toBeInTheDocument();
  });

  it('FlowLibraryTable shows title', () => {
    renderWithProviders(
      <FlowLibraryTable summaries={[summary]} onRequestDelete={vi.fn()} />,
    );
    expect(screen.getByText('Payroll flow')).toBeInTheDocument();
  });

  it('FlowLibraryList shows title', () => {
    renderWithProviders(
      <FlowLibraryList summaries={[summary]} onRequestDelete={vi.fn()} />,
    );
    expect(screen.getByText('Payroll flow')).toBeInTheDocument();
  });

  it('FlowLibrarySection cards mode', () => {
    renderWithProviders(
      <FlowLibrarySection viewMode="card" summaries={[summary]} onRequestDelete={vi.fn()} />,
    );
    expect(screen.getByText('Payroll flow')).toBeInTheDocument();
  });

  it('FlowDocumentActions shows Share', () => {
    renderWithProviders(
      <FlowDocumentActions documentId="doc-1" status="live" onRequestDelete={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
  });

  it('DashboardHero shows workspace heading', () => {
    renderWithProviders(<DashboardHero />);
    expect(screen.getByRole('heading', { name: 'Documentation workspace' })).toBeInTheDocument();
  });

  it('DashboardStats shows totals', () => {
    renderWithProviders(
      <DashboardStats
        stats={{
          totalDocuments: 2,
          totalThisWeek: 1,
          totalThisMonth: 2,
          totalStepsDocumented: 10,
          averageStepsPerDocument: 5,
        }}
      />,
    );
    expect(screen.getByText('Total documentations')).toBeInTheDocument();
  });

  it('ExpandableLibrarySearch button', () => {
    renderWithProviders(<ExpandableLibrarySearch value="" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Search documentations/i })).toBeInTheDocument();
  });

  it('ProductTourLibraryCards shows tour title', () => {
    renderWithProviders(
      <ProductTourLibraryCards
        summaries={[
          {
            id: 'tour-1',
            title: 'Onboarding',
            description: '',
            personaName: 'Alex',
            featureCount: 2,
            demoCount: 1,
            estimatedMinutes: 5,
            updatedAt: Date.now(),
          } as never,
        ]}
        onRequestDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Onboarding')).toBeInTheDocument();
  });

  it('RouteLibraryCards shows route', () => {
    renderWithProviders(
      <RouteLibraryCards
        summaries={[
          {
            id: 'r1',
            title: 'Checkout',
            description: '',
            status: 'live',
            chapterCount: 1,
            peacockCount: 1,
            branchCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ]}
        onRequestDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });

  it('RouteDocumentActions renders share control', () => {
    renderWithProviders(<RouteDocumentActions routeId="r1" onRequestDelete={vi.fn()} />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('DashboardAnalyticsSection heading', () => {
    renderWithProviders(<DashboardAnalyticsSection documentCount={2} />);
    expect(screen.getByText(/Engagement analytics/i)).toBeInTheDocument();
  });

  it('DashboardWorkflowOutputsSection heading', () => {
    renderWithProviders(<DashboardWorkflowOutputsSection />);
    expect(screen.getByRole('heading', { name: 'Generated artifacts' })).toBeInTheDocument();
  });

  it('GuestLibraryIntroModal opens', () => {
    renderWithProviders(
      <GuestLibraryIntroModal isOpen visibleCount={2} totalCount={5} onClose={vi.fn()} />,
    );
    expect(screen.getByText(/Guest preview limits|Some recordings are hidden/i)).toBeInTheDocument();
  });
});
