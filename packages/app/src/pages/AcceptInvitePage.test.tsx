import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

vi.mock('@clerk/react', () => ({
  SignInButton: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  SignUpButton: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useSessionMode: () => 'guest',
}));

vi.mock('@/cloud/repositories/organizationRepository', () => ({
  acceptOrganizationInvitation: vi.fn(),
}));

vi.mock('@/components/auth/CloudSyncProvider', () => ({
  refreshCloudMemberships: vi.fn(),
}));

vi.mock('@/utils/notify', () => ({ notifyPromise: vi.fn() }));
vi.mock('@/utils/appError', () => ({
  reportAppError: () => ({ userMessage: 'err', title: 'Error' }),
}));

import { AcceptInvitePage } from './AcceptInvitePage';

describe('AcceptInvitePage', () => {
  it('shows invalid invite without token', () => {
    renderWithRouter(<AcceptInvitePage />, { initialEntries: ['/accept-invite'] });
    expect(screen.getByText(/invalid invite link/i)).toBeInTheDocument();
  });

  it('prompts guest to sign in when token present', () => {
    renderWithRouter(<AcceptInvitePage />, {
      initialEntries: ['/accept-invite?token=abc'],
    });
    expect(screen.getByRole('heading', { name: /you're invited/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
