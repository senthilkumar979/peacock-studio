import { ClerkProvider } from '@clerk/react';
import { BrowserRouter } from 'react-router-dom';
import { CloudSyncProvider } from '@/components/auth/CloudSyncProvider';
import { CloudSyncBanner } from '@/components/auth/CloudSyncBanner';
import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner';
import { CookiePreferencesModal } from '@/components/consent/CookiePreferencesModal';
import { getClerkPublishableKey, isCloudSyncEnabled } from '@/cloud/config';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const clerkKey = getClerkPublishableKey();
  const needsClerk = isCloudSyncEnabled() && Boolean(clerkKey);

  const routed = (
    <BrowserRouter>
      <CloudSyncProvider>
        {children}
        <CloudSyncBanner />
        <CookieConsentBanner />
        <CookiePreferencesModal />
      </CloudSyncProvider>
    </BrowserRouter>
  );

  if (!needsClerk) return routed;

  return (
    <ClerkProvider publishableKey={clerkKey!} afterSignOutUrl="/">
      {routed}
    </ClerkProvider>
  );
};
