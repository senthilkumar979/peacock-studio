import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true, userId: 'u1' }),
  useSession: () => ({ session: null }),
  useUser: () => ({ user: null, isLoaded: true }),
  useClerk: () => ({ signOut: vi.fn() }),
  UserButton: () => <div>UserButton</div>,
  ClerkLoading: () => null,
  ClerkLoaded: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ClerkFailed: () => null,
}));

vi.mock('@/cloud/planLimits', () => ({
  getFreeAccountDocLimit: () => 5,
  getFreeAccountStorageBytesLimit: () => 1024 * 1024,
}));

vi.mock('@/cloud/config', () => ({
  isCloudSyncEnabled: () => false,
  getClerkPublishableKey: () => '',
}));

vi.mock('@/hooks/useSessionMode', () => ({
  useIsGuestSession: () => false,
  useSessionMode: () => 'cloud',
}));

vi.mock('@/hooks/useIsPlatformSuperAdmin', () => ({
  useIsPlatformSuperAdmin: () => ({ isPlatformSuperAdmin: true, isLoading: false }),
}));

const CLOUD_SYNC_SNAPSHOT = {
  phase: 'syncing' as const,
  message: 'Syncing to cloud…',
  visible: true,
  importedDocuments: 0,
  exceedsFreeLimit: false,
};

vi.mock('@/cloud/cloudSyncState', () => ({
  getCloudSyncSnapshot: () => CLOUD_SYNC_SNAPSHOT,
  subscribeCloudSyncState: () => () => undefined,
  setCloudSyncState: vi.fn(),
  resetCloudSyncState: vi.fn(),
}));

vi.mock('@/cloud/sessionState', () => ({
  setSessionAuthState: vi.fn(),
}));

vi.mock('@/cloud/sessionIntent', () => ({
  markIntentionalSignOut: vi.fn(),
  consumeIntentionalSignOut: () => false,
}));

vi.mock('@/cloud/authContext', () => ({
  buildCloudAuthContext: vi.fn(),
  getCloudAuthContext: () => null,
  setCloudAuthContext: vi.fn(),
  setCloudInitError: vi.fn(),
  resolveClerkDisplayName: () => null,
  resolveClerkNameParts: () => ({ firstName: null, lastName: null }),
  getCloudLibraryActiveSnapshot: () => false,
  subscribeCloudAuthContext: () => () => undefined,
}));

vi.mock('@/utils/notify', () => ({
  notifyError: vi.fn(),
  notifyWarning: vi.fn(),
  notifyInfo: vi.fn(),
}));

vi.mock('goey-toast', () => ({
  GooeyToaster: () => null,
}));

vi.mock('@/observability/DeferredSentry', () => ({ DeferredSentry: () => null }));
vi.mock('@/observability/VercelObservability', () => ({ VercelObservability: () => null }));
vi.mock('@/components/analytics/AnalyticsTracker', () => ({ AnalyticsTracker: () => null }));
vi.mock('@/components/support/SupportWidget', () => ({ SupportWidget: () => null }));
vi.mock('@/components/consent/CookieConsentBanner', () => ({ CookieConsentBanner: () => null }));
vi.mock('@/components/consent/CookiePreferencesModal', () => ({ CookiePreferencesModal: () => null }));
vi.mock('@/components/auth/DeferredCloudAuth', () => ({
  DeferredCloudAuth: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/auth/ImportLocalLibraryPrompt', () => ({
  ImportLocalLibraryPrompt: () => null,
}));
vi.mock('@/components/auth/CloudSyncBanner', () => ({
  CloudSyncBanner: () => null,
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

import { ProtectedRoute } from './ProtectedRoute';
import { GuestDocumentGate } from './GuestDocumentGate';
import { UpgradeAccountModal } from './UpgradeAccountModal';
import { CloudSignInCallout } from './CloudSignInCallout';
import { RequirePlatformSuperAdmin } from './RequirePlatformSuperAdmin';
import { WorkspaceOnboardingGate } from './WorkspaceOnboardingGate';
import { ClerkAuthWidget } from './ClerkAuthWidget';
import { SignedInUserButton } from './SignedInUserButton';
import { CloudSyncProviderInner } from './CloudSyncProviderInner';
import { AppProviders } from './AppProviders';
import { ImportLocalLibraryPrompt } from './ImportLocalLibraryPrompt';

describe('auth smoke', () => {
  it('ProtectedRoute passes children when cloud sync off', () => {
    renderWithProviders(
      <ProtectedRoute>
        <p>Secret</p>
      </ProtectedRoute>,
    );
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });

  it('GuestDocumentGate passes children for non-guest', () => {
    renderWithProviders(
      <GuestDocumentGate documentId="doc-1">
        <p>Doc body</p>
      </GuestDocumentGate>,
    );
    expect(screen.getByText('Doc body')).toBeInTheDocument();
  });

  it('UpgradeAccountModal opens', () => {
    renderWithProviders(
      <UpgradeAccountModal isOpen importedCount={3} onClose={vi.fn()} />,
    );
    expect(screen.getByText(/Upgrade to keep your full library/i)).toBeInTheDocument();
  });

  it('CloudSignInCallout shows message', () => {
    renderWithProviders(<CloudSignInCallout message="Please sign in" />);
    expect(screen.getByText('Please sign in')).toBeInTheDocument();
  });

  it('RequirePlatformSuperAdmin allows when admin', () => {
    renderWithProviders(
      <RequirePlatformSuperAdmin>
        <p>Admin panel</p>
      </RequirePlatformSuperAdmin>,
    );
    expect(screen.getByText('Admin panel')).toBeInTheDocument();
  });

  it('WorkspaceOnboardingGate passes children when sync off', () => {
    renderWithProviders(
      <WorkspaceOnboardingGate>
        <p>Workspace ready</p>
      </WorkspaceOnboardingGate>,
    );
    expect(screen.getByText('Workspace ready')).toBeInTheDocument();
  });

  it('ClerkAuthWidget shows children when ClerkLoaded', () => {
    renderWithProviders(
      <ClerkAuthWidget>
        <p>Auth children</p>
      </ClerkAuthWidget>,
    );
    expect(screen.getByText('Auth children')).toBeInTheDocument();
  });

  it('SignedInUserButton renders', () => {
    renderWithProviders(<SignedInUserButton />);
    expect(screen.getByText('UserButton')).toBeInTheDocument();
  });

  it('CloudSyncProviderInner renders children', () => {
    renderWithProviders(
      <CloudSyncProviderInner>
        <p>Synced tree</p>
      </CloudSyncProviderInner>,
    );
    expect(screen.getByText('Synced tree')).toBeInTheDocument();
  });

  it('AppProviders renders children', () => {
    renderWithProviders(
      <AppProviders>
        <p>App root</p>
      </AppProviders>,
    );
    expect(screen.getByText('App root')).toBeInTheDocument();
  });

  it('ImportLocalLibraryPrompt is null when sync off', () => {
    const { container } = renderWithProviders(<ImportLocalLibraryPrompt />);
    expect(container).toBeEmptyDOMElement();
  });
});
