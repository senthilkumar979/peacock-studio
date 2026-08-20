import { ClerkFailed, ClerkLoaded, ClerkLoading, ClerkProvider } from '@clerk/react';
import { CloudInitConnectingError } from '@/components/auth/CloudNetworkBlockedNotice';
import { CloudSyncProviderInner } from '@/components/auth/CloudSyncProviderInner';
import { ClerkSessionAuthBridge } from '@/components/auth/ClerkSessionAuthBridge';
import { getCloudNetworkBlockedError } from '@/cloud/cloudInitErrors';

interface ClerkCloudAuthTreeProps {
  publishableKey: string;
  /** False on marketing/share — Clerk session only, no cloud sync/toasts. */
  enableCloudSync: boolean;
  children: React.ReactNode;
}

const ClerkBootShell = () => (
  <div
    className="flex min-h-screen items-center justify-center bg-slate-50"
    role="status"
    aria-live="polite"
  >
    <p className="text-sm font-medium text-slate-600">Loading…</p>
  </div>
);

const ClerkNetworkBlocked = () => (
  <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
    <CloudInitConnectingError
      error={getCloudNetworkBlockedError()}
      onRetry={() => window.location.reload()}
    />
  </div>
);

/** Clerk + optional cloud sync — separate chunk; marketing never mounts this. */
export const ClerkCloudAuthTree = ({
  publishableKey,
  enableCloudSync,
  children,
}: ClerkCloudAuthTreeProps) => (
  <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
    {enableCloudSync ? (
      <>
        <ClerkFailed>
          <ClerkNetworkBlocked />
        </ClerkFailed>
        <ClerkLoading>
          <ClerkBootShell />
        </ClerkLoading>
        <ClerkLoaded>
          <CloudSyncProviderInner>{children}</CloudSyncProviderInner>
        </ClerkLoaded>
      </>
    ) : (
      <>
        <ClerkSessionAuthBridge />
        {children}
      </>
    )}
  </ClerkProvider>
);
