import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isSignedIn: false, isLoaded: true, getToken: vi.fn() }),
  useUser: () => ({ isLoaded: true, user: null }),
  useClerk: () => ({ redirectToSignIn: vi.fn(), signOut: vi.fn() }),
  SignedIn: () => null,
  SignedOut: ({ children }: { children?: React.ReactNode }) => children,
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => false,
  getClerkPublishableKey: () => '',
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useIsAuthenticatedAppUser: () => false,
  useSessionMode: () => 'guest',
}));

vi.mock('@/analytics/analyticsClient', () => ({
  trackEvent: vi.fn(),
  identifyUser: vi.fn(),
}));

vi.mock('@/utils/support', () => ({
  openSupportChat: vi.fn(),
}));

import { Pricing } from './Pricing';

describe('Pricing', () => {
  it('presents Peacock as free without paid-plan messaging', () => {
    renderWithRouter(<Pricing />);
    expect(
      screen.getByRole('heading', { name: /everything you need. free of cost./i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/coming soon|founding-user pricing/i)).not.toBeInTheDocument();
  });
});
