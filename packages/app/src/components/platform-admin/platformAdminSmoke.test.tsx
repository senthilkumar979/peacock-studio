import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { PlatformOverview, PlatformOrganizationSummary } from '@/cloud/repositories/platformAdminRepository';
import { PlatformAdminOverviewTab } from './PlatformAdminOverviewTab';
import { PlatformOrganizationsTable } from './PlatformOrganizationsTable';
import { PlatformOrgDetailPanel } from './PlatformOrgDetailPanel';

const overview: PlatformOverview = {
  organizationCount: 2,
  userCount: 5,
  documentCount: 10,
  tourCount: 3,
  activeShareLinkCount: 1,
  totalStorageBytes: 2048,
  topDomains: [{ domain: 'example.com', count: 4 }],
};

const org: PlatformOrganizationSummary = {
  id: 'org-1',
  name: 'Acme',
  workspaceType: 'team',
  plan: 'free',
  ownerEmail: 'owner@acme.com',
  memberCount: 3,
  documentCount: 4,
  tourCount: 1,
  storageBytes: 1024,
  createdAt: new Date().toISOString(),
};

describe('platform-admin smoke', () => {
  it('overview cards', () => {
    renderWithProviders(<PlatformAdminOverviewTab overview={overview} />);
    expect(screen.getByText('Organizations')).toBeInTheDocument();
  });

  it('organizations table', () => {
    renderWithProviders(
      <PlatformOrganizationsTable
        organizations={[org]}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('org detail empty state', () => {
    renderWithProviders(<PlatformOrgDetailPanel detail={null} isLoading={false} />);
    expect(screen.getByText(/Select an organization/i)).toBeInTheDocument();
  });
});
