import { ClerkProvider } from '@clerk/react';
import { BrowserRouter } from 'react-router-dom';
import { GooeyToaster } from 'goey-toast';
import 'goey-toast/styles.css';
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';
import { GlobalErrorListeners } from '@/components/errors/GlobalErrorListeners';
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
          <GlobalErrorListeners />
          {children}
          <AnalyticsTracker />
          <SupportWidget />
          <CloudSyncBanner />
          <CookieConsentBanner />
          <CookiePreferencesModal />
          <GooeyToaster
            position="bottom-right"
            preset="smooth"
            closeButton="top-right"
            showTimestamp={false}
            showProgress
            theme="light"
            offset="24px"
          />
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
