import { ClerkProvider } from '@clerk/react';
import { BrowserRouter } from 'react-router-dom';
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';
import { CloudSyncProvider } from '@/components/auth/CloudSyncProvider';
import { CloudSyncBanner } from '@/components/auth/CloudSyncBanner';
import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner';
import { CookiePreferencesModal } from '@/components/consent/CookiePreferencesModal';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { SupportWidget } from '@/components/support/SupportWidget';
import { getClerkPublishableKey, isCloudSyncEnabled } from '@/cloud/config';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const clerkKey = getClerkPublishableKey();
  const needsClerk = isCloudSyncEnabled() && Boolean(clerkKey);

  const routed = (
    <BrowserRouter>
      <AppErrorBoundary>
        <CloudSyncProvider>
          {children}
          <AnalyticsTracker />
          <SupportWidget />
          <CloudSyncBanner />
          <CookieConsentBanner />
          <CookiePreferencesModal />
        </CloudSyncProvider>
      </AppErrorBoundary>
    </BrowserRouter>
  );

  if (!needsClerk) return routed;

  return (
    <ClerkProvider publishableKey={clerkKey!} afterSignOutUrl="/">
      {routed}
    </ClerkProvider>
  );
};
