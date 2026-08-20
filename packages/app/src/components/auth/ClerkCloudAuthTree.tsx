import { ClerkProvider } from '@clerk/react';
import { CloudSyncProviderInner } from '@/components/auth/CloudSyncProviderInner';
import { ClerkSessionAuthBridge } from '@/components/auth/ClerkSessionAuthBridge';

interface ClerkCloudAuthTreeProps {
  publishableKey: string;
  /** False on marketing — Clerk session only, no cloud sync/toasts. */
  enableCloudSync: boolean;
  children: React.ReactNode;
}

/** Clerk + optional cloud sync — separate chunk; marketing still paints immediately. */
export const ClerkCloudAuthTree = ({
  publishableKey,
  enableCloudSync,
  children,
}: ClerkCloudAuthTreeProps) => (
  <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
    {enableCloudSync ? (
      <CloudSyncProviderInner>{children}</CloudSyncProviderInner>
    ) : (
      <>
        <ClerkSessionAuthBridge />
        {children}
      </>
    )}
  </ClerkProvider>
);
