import { ClerkProvider } from '@clerk/react';
import { CloudSyncProviderInner } from '@/components/auth/CloudSyncProviderInner';

interface ClerkCloudAuthTreeProps {
  publishableKey: string;
  children: React.ReactNode;
}

/** Clerk + cloud sync — loaded as a separate chunk so marketing pages can defer it. */
export const ClerkCloudAuthTree = ({ publishableKey, children }: ClerkCloudAuthTreeProps) => (
  <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
    <CloudSyncProviderInner>{children}</CloudSyncProviderInner>
  </ClerkProvider>
);
