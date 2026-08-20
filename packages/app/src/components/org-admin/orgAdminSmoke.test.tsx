import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { FileText } from 'lucide-react';
import { renderWithProviders } from '@/test/renderWithProviders';
import {
  ALL_CAPABILITIES_TRUE,
  DEFAULT_MEMBER_CAPABILITIES,
  type OrganizationInvitationRecord,
  type OrganizationMemberRecord,
} from '@/cloud/types/organization';
import type { OrgAdminActivity } from '@/cloud/repositories/organizationRepository';

vi.mock('@/cloud/repositories/organizationRepository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/cloud/repositories/organizationRepository')>();
  return {
    ...actual,
    listOrganizationMembers: vi.fn().mockResolvedValue([]),
    listOrganizationInvitations: vi.fn().mockResolvedValue([]),
    listOrganizationGroups: vi.fn().mockResolvedValue([]),
    fetchOrgAdminActivity: vi.fn().mockResolvedValue({
      memberCount: 2,
      documentCount: 3,
      tourCount: 1,
      exportCount: 4,
      shareCount: 5,
      byActor: [],
      docsByCreator: [],
      toursByCreator: [],
      exportsByActor: [],
      sharesByActor: [],
    }),
    fetchOrgDomainUsage: vi.fn().mockResolvedValue([{ domain: 'example.com', count: 2 }]),
  };
});

vi.mock('@/cloud/repositories/profileRepository', () => ({
  fetchProfilesByClerkUserIds: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/hooks/useOrgAnalytics', () => ({
  useOrgAnalytics: () => ({
    summary: {
      totals: { views: 10, embedViews: 2, pdfExports: 1 },
      byType: [],
      daily: [],
      topReferrers: [],
    },
    isLoading: false,
  }),
}));

vi.mock('@/analytics/featureFlags', () => ({
  isOrgInvitesFeatureEnabled: () => true,
}));

vi.mock('@/analytics/analyticsClient', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('@/utils/notify', () => ({
  notifyError: vi.fn(),
  notifyPromise: vi.fn((p: Promise<unknown>) => p),
  notifySuccess: vi.fn(),
  notifyWarning: vi.fn(),
}));

vi.mock('@/components/auth/CloudSyncProvider', () => ({
  refreshCloudMemberships: vi.fn(),
}));

vi.mock('@/cloud/refreshCloudMemberships', () => ({
  refreshCloudMemberships: vi.fn(),
}));

import { InviteMemberForm } from './InviteMemberForm';
import { PendingInvitesSection } from './PendingInvitesSection';
import { MembersAccessTable } from './MembersAccessTable';
import { OrgAdminMembersPanel } from './OrgAdminMembersPanel';
import { OrgAdminGroupsPanel } from './OrgAdminGroupsPanel';
import { OrgAdminOverviewTab } from './OrgAdminOverviewTab';
import { OrgAdminActivityTab } from './OrgAdminActivityTab';
import { OrgAdminFirstWeekChecklist } from './OrgAdminFirstWeekChecklist';
import { MembersRoster } from './MembersRoster';
import { CapabilityChipGrid } from './CapabilityChipGrid';
import { CapabilityAccessToggle } from './CapabilityAccessToggle';
import { SoloMemberCard } from './SoloMemberCard';
import { ContributorBoardCard } from './ContributorBoardCard';
import { OrgContributorLeaders } from './OrgContributorLeaders';
import { OrgDomainUsageTable } from './OrgDomainUsageTable';

const member: OrganizationMemberRecord = {
  id: 'm1',
  organizationId: 'org-1',
  clerkUserId: 'user-1',
  email: 'you@example.com',
  role: 'admin',
  capabilities: { ...ALL_CAPABILITIES_TRUE },
  status: 'active',
  joinedAt: new Date().toISOString(),
};

const invite: OrganizationInvitationRecord = {
  id: 'inv-1',
  organizationId: 'org-1',
  email: 'teammate@example.com',
  role: 'member',
  capabilities: { ...DEFAULT_MEMBER_CAPABILITIES },
  token: 'tok',
  expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
  createdAt: new Date().toISOString(),
};

const emptyActivity: OrgAdminActivity = {
  memberCount: 1,
  documentCount: 0,
  tourCount: 0,
  exportCount: 0,
  shareCount: 0,
  byActor: [],
  docsByCreator: [],
  toursByCreator: [],
  exportsByActor: [],
  sharesByActor: [],
};

describe('org-admin smoke', () => {
  it('InviteMemberForm shows invite heading', () => {
    renderWithProviders(
      <InviteMemberForm busy={false} onInvite={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByRole('heading', { name: 'Invite a teammate' })).toBeInTheDocument();
  });

  it('PendingInvitesSection lists invite email', () => {
    renderWithProviders(
      <PendingInvitesSection
        invites={[invite]}
        busy={false}
        onResend={vi.fn()}
        onRevoke={vi.fn()}
      />,
    );
    expect(screen.getByText('teammate@example.com')).toBeInTheDocument();
  });

  it('MembersAccessTable shows member column', () => {
    renderWithProviders(
      <MembersAccessTable
        members={[member]}
        profileByClerkId={{}}
        currentUser={{ clerkUserId: 'user-1', email: 'you@example.com' }}
        busy={false}
        onUpdateCapabilities={vi.fn()}
        onRequestRevokeAccess={vi.fn()}
        onRequestRemove={vi.fn()}
      />,
    );
    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getByText('you@example.com')).toBeInTheDocument();
  });

  it('OrgAdminMembersPanel loads invite teammates CTA', async () => {
    renderWithProviders(
      <OrgAdminMembersPanel
        organizationId="org-1"
        organizationName="Acme"
        workspaceType="team"
        inviterName="You"
        currentClerkUserId="user-1"
        currentUserEmail="you@example.com"
        currentUserDisplayName="You"
      />,
    );
    expect(await screen.findByText('Invite teammates')).toBeInTheDocument();
  });

  it('OrgAdminGroupsPanel shows create group', async () => {
    renderWithProviders(<OrgAdminGroupsPanel organizationId="org-1" />);
    expect(await screen.findByRole('heading', { name: 'Create group' })).toBeInTheDocument();
  });

  it('OrgAdminOverviewTab shows analytics cards', async () => {
    renderWithProviders(<OrgAdminOverviewTab organizationId="org-1" />);
    expect(await screen.findByText('Total views')).toBeInTheDocument();
  });

  it('OrgAdminActivityTab shows Members metric', async () => {
    renderWithProviders(<OrgAdminActivityTab organizationId="org-1" />);
    expect(await screen.findByText('Members')).toBeInTheDocument();
  });

  it('OrgAdminFirstWeekChecklist shows first week', () => {
    renderWithProviders(
      <OrgAdminFirstWeekChecklist onOpenMembers={vi.fn()} onOpenActivity={vi.fn()} />,
    );
    expect(screen.getByText('First week')).toBeInTheDocument();
  });

  it('MembersRoster renders solo member', () => {
    renderWithProviders(
      <MembersRoster
        members={[member]}
        profileByClerkId={{}}
        currentClerkUserId="user-1"
        currentUserEmail="you@example.com"
        currentUserDisplayName="You"
        busy={false}
        onUpdateCapabilities={vi.fn()}
        onRequestRevokeAccess={vi.fn()}
        onRequestRemove={vi.fn()}
      />,
    );
    expect(screen.getByText('you@example.com')).toBeInTheDocument();
  });

  it('CapabilityChipGrid and toggle render', () => {
    renderWithProviders(
      <>
        <CapabilityChipGrid value={DEFAULT_MEMBER_CAPABILITIES} onChange={vi.fn()} />
        <CapabilityAccessToggle capability="read" active onToggle={vi.fn()} />
      </>,
    );
    expect(screen.getAllByText('Allowed').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Read allowed/i)).toBeInTheDocument();
  });

  it('SoloMemberCard shows email', () => {
    renderWithProviders(
      <SoloMemberCard
        member={member}
        displayName="You"
        displayEmail="you@example.com"
        currentClerkUserId="user-1"
        busy={false}
        onUpdateCapabilities={vi.fn()}
      />,
    );
    expect(screen.getByText('you@example.com')).toBeInTheDocument();
  });

  it('ContributorBoardCard and leaders render', () => {
    renderWithProviders(
      <>
        <ContributorBoardCard
          board={{
            title: 'Docs created',
            subtitle: 'All time',
            unit: 'docs',
            icon: FileText,
            accent: 'from-peacock-500 to-peacock-700',
            rows: [{ email: 'a@x.com', displayName: 'A', count: 3 }],
          }}
        />
        <OrgContributorLeaders activity={emptyActivity} />
      </>,
    );
    expect(screen.getAllByText('Docs created').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Top contributors' })).toBeInTheDocument();
  });

  it('OrgDomainUsageTable shows domain', () => {
    renderWithProviders(<OrgDomainUsageTable rows={[{ domain: 'app.example.com', count: 4 }]} />);
    expect(screen.getByText('Domains used in flows')).toBeInTheDocument();
    expect(screen.getByText('app.example.com')).toBeInTheDocument();
  });
});
