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

import { Products } from './Products';

describe('Products', () => {
  it('renders products heading and product cards', () => {
    renderWithRouter(<Products />);
    expect(
      screen.getByRole('heading', { name: /three ways peacock turns usage into reusable assets/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /flow documents/i })).toBeInTheDocument();
  });
});
