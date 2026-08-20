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

import { PrivacyPolicy } from './PrivacyPolicy';

describe('PrivacyPolicy', () => {
  it('renders Privacy Policy heading', () => {
    renderWithRouter(<PrivacyPolicy />);
    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument();
  });
});
