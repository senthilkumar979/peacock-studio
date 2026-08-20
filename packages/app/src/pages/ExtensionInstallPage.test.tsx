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

vi.mock('@/hooks/useExtensionInstalled', () => ({
  useExtensionInstalled: () => ({
    status: 'missing',
    isInstalled: false,
    isChecking: false,
    recheck: vi.fn(),
  }),
}));

vi.mock('@/utils/isCaptureUnsupportedClient', () => ({
  isCaptureUnsupportedClient: () => false,
}));

import { ExtensionInstallPage } from './ExtensionInstallPage';

describe('ExtensionInstallPage', () => {
  it('renders install heading when extension is missing', () => {
    renderWithRouter(<ExtensionInstallPage />, { initialEntries: ['/install-extension'] });
    expect(
      screen.getByRole('heading', { name: /install the .* browser extension/i }),
    ).toBeInTheDocument();
  });
});
