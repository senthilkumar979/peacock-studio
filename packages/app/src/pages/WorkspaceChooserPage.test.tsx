import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from './test/pageTestUtils';

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isSignedIn: true, isLoaded: true, getToken: vi.fn() }),
  useUser: () => ({ isLoaded: true, user: { id: 'user_1' } }),
  useClerk: () => ({ redirectToSignIn: vi.fn(), signOut: vi.fn() }),
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => true,
  getClerkPublishableKey: () => 'pk_test_mock',
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: () => 'onboarding',
  useIsAuthenticatedAppUser: () => true,
}));

vi.mock('@/hooks/useOrganization', () => ({
  useNeedsWorkspaceOnboarding: () => true,
  useCloudAuthContext: () => ({
    userId: 'user_1',
    organizationId: null,
    role: null,
  }),
}));

const listMyPendingInvitations = vi.fn(async () => [
  {
    id: 'inv-1',
    token: 'invite-token',
    organizationId: 'org-1',
    organizationName: 'Invite Org',
    email: 'a@b.com',
    role: 'member',
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    createdAt: new Date().toISOString(),
  },
]);

vi.mock('@/cloud/repositories/organizationRepository', () => ({
  listMyPendingInvitations: (...args: any[]) => (listMyPendingInvitations as any)(...args),
  createPersonalWorkspace: vi.fn(async () => 'org-personal'),
  createTeamWorkspace: vi.fn(),
  acceptOrganizationInvitation: vi.fn(),
  syncMyMembershipEmails: vi.fn(),
}));

vi.mock('@/components/auth/CloudSyncProvider', () => ({
  refreshCloudMemberships: vi.fn(),
}));

vi.mock('@/utils/notify', () => ({
  notifyError: vi.fn(),
  notifyPromise: vi.fn((_p: Promise<unknown>) => _p),
}));

vi.mock('@/utils/appError', () => ({
  reportAppError: (_ctx: string, err: unknown) => ({
    userMessage: err instanceof Error ? err.message : 'error',
    title: 'Error',
  }),
}));

import { WorkspaceChooserPage } from './WorkspaceChooserPage';

describe('WorkspaceChooserPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders workspace setup heading and pending invite', async () => {
    renderWithRouter(<WorkspaceChooserPage />, { initialEntries: ['/workspaces'] });
    expect(screen.getByRole('heading', { name: /set up your workspace/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/invite org/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/personal workspace/i)).toBeInTheDocument();
  });

  it('opens team workspace form', async () => {
    const user = userEvent.setup();
    renderWithRouter(<WorkspaceChooserPage />, { initialEntries: ['/workspaces'] });
    await waitFor(() => {
      expect(screen.getByText(/personal workspace/i)).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /team workspace with invites/i }));
    expect(await screen.findByLabelText(/company name/i)).toBeInTheDocument();
  });
});
