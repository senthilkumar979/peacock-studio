import { ClerkProvider } from '@clerk/react';
import { CloudSyncProviderInner } from '@/components/auth/CloudSyncProviderInner';

interface ClerkCloudAuthTreeProps {
  publishableKey: string;
  /** False when returning to marketing after Clerk already loaded — no cloud sync/toasts. */
  enableCloudSync: boolean;
  children: React.ReactNode;
}

/** Clerk + optional cloud sync — separate chunk; marketing cold loads never import this. */
export const ClerkCloudAuthTree = ({
  publishableKey,
  enableCloudSync,
  children,
}: ClerkCloudAuthTreeProps) => (
  <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
    {enableCloudSync ? (
      <CloudSyncProviderInner>{children}</CloudSyncProviderInner>
    ) : (
      children
    )}
  </ClerkProvider>
);
