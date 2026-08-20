import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: () => 'cloud',
}));

vi.mock('@/hooks/useOrganization', () => ({
  useCloudAuthContext: () => ({ workspaceType: 'team' }),
  useActiveOrganization: () => ({
    isAdmin: true,
    organizationId: 'org-1',
    organizationName: 'Acme Org',
  }),
}));

vi.mock('@/utils/notify', () => ({ notifyWarning: vi.fn() }));

vi.mock('@/components/org-admin/OrgAdminOverviewTab', () => ({
  OrgAdminOverviewTab: () => <div>overview-tab</div>,
}));
vi.mock('@/components/org-admin/OrgAdminMembersPanel', () => ({
  OrgAdminMembersPanel: () => <div>members-tab</div>,
}));
vi.mock('@/components/org-admin/OrgAdminGroupsPanel', () => ({
  OrgAdminGroupsPanel: () => <div>groups-tab</div>,
}));
vi.mock('@/components/org-admin/OrgAdminActivityTab', () => ({
  OrgAdminActivityTab: () => <div>activity-tab</div>,
}));

import { OrgAdminPage } from './OrgAdminPage';

describe('OrgAdminPage', () => {
  it('renders org admin chrome and overview', () => {
    renderWithRouter(<OrgAdminPage />, { initialEntries: ['/org/admin'] });
    expect(screen.getByRole('heading', { name: /acme org/i })).toBeInTheDocument();
    expect(screen.getByText('overview-tab')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /members/i })).toBeInTheDocument();
  });
});
