import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/hooks/useSuperAdminAcquisition', () => ({
  useSuperAdminAcquisition: () => ({
    summary: {
      days: 30,
      signupsBySource: [{ source: 'google', signups: 3 }],
      topCampaigns: [
        { source: 'google', medium: 'cpc', campaign: 'spring', signups: 2 },
      ],
      posthogProjectUrl: 'https://eu.posthog.com',
    },
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

vi.mock('@/hooks/useHealthChecks', () => ({
  useHealthChecks: () => ({
    results: [],
    isRunning: false,
    ranAt: Date.now(),
    error: null,
    refresh: vi.fn(),
    copyReport: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock('@/hooks/usePlatformAdminData', () => ({
  usePlatformAdminData: () => ({
    overview: {
      organizationCount: 1,
      userCount: 2,
      documentCount: 3,
      tourCount: 1,
      activeShareLinkCount: 0,
      totalStorageBytes: 0,
      topDomains: [],
    },
    organizations: [],
    orgDetail: null,
    loadingOverview: false,
    loadingOrgs: false,
    loadingDetail: false,
  }),
}));

vi.mock('swagger-ui-dist', () => ({
  SwaggerUIBundle: Object.assign(vi.fn(() => ({ getSystem: () => null })), {
    presets: { apis: {} },
  }),
}));

import { SuperAdminAcquisitionTab } from './SuperAdminAcquisitionTab';
import { SuperAdminApiTab } from './SuperAdminApiTab';
import { SuperAdminHealthTab } from './SuperAdminHealthTab';
import { SuperAdminPlatformTab } from './SuperAdminPlatformTab';

describe('super-admin smoke', () => {
  it('Acquisition tab', async () => {
    renderWithProviders(<SuperAdminAcquisitionTab />);
    expect(await screen.findByRole('heading', { name: 'Signups by source' })).toBeInTheDocument();
  });

  it('Api tab', () => {
    renderWithProviders(<SuperAdminApiTab />);
    expect(screen.getByText(/OpenAPI catalog/i)).toBeInTheDocument();
  });

  it('Health tab', () => {
    renderWithProviders(<SuperAdminHealthTab />);
    expect(screen.getByRole('button', { name: /Re-run checks/i })).toBeInTheDocument();
  });

  it('Platform tab', () => {
    renderWithProviders(<SuperAdminPlatformTab />);
    expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
  });
});
