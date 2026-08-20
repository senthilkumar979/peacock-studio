import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isSignedIn: false, isLoaded: true, getToken: vi.fn() }),
  useUser: () => ({ isLoaded: true, user: null }),
  useClerk: () => ({ redirectToSignIn: vi.fn(), signOut: vi.fn() }),
  SignedIn: () => null,
  SignedOut: ({ children }: { children?: React.ReactNode }) => children,
  SignIn: () => <div>Sign in widget</div>,
  SignUp: () => <div>Sign up widget</div>,
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => true,
  getClerkPublishableKey: () => 'pk_test_mock',
  getCloudSyncMissingConfigMessage: () => null,
}));

vi.mock('@/components/auth/ClerkAuthWidget', () => ({
  ClerkAuthWidget: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

import { SignUpPage } from './SignUpPage';

describe('SignUpPage', () => {
  it('renders sign-up heading and clerk widget', () => {
    renderWithRouter(<SignUpPage />, { initialEntries: ['/sign-up'] });
    expect(
      screen.getByRole('heading', { name: /create your peacock account/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/sign up widget/i)).toBeInTheDocument();
  });
});
