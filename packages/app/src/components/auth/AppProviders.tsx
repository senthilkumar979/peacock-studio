import { BrowserRouter } from 'react-router-dom';
import { GooeyToaster } from 'goey-toast';
import 'goey-toast/styles.css';
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';
import { GlobalErrorListeners } from '@/components/errors/GlobalErrorListeners';
import { DeferredCloudAuth } from '@/components/auth/DeferredCloudAuth';
import { CloudSyncBanner } from '@/components/auth/CloudSyncBanner';
import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner';
import { CookiePreferencesModal } from '@/components/consent/CookiePreferencesModal';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { SupportWidget } from '@/components/support/SupportWidget';
import { DeferredSentry } from '@/observability/DeferredSentry';
import { getClerkPublishableKey, isCloudSyncEnabled } from '@/cloud/config';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const clerkKey = getClerkPublishableKey();
  const needsClerk = isCloudSyncEnabled() && Boolean(clerkKey);

  const chrome = (
    <>
      <GlobalErrorListeners />
      <DeferredSentry />
      {children}
      <AnalyticsTracker />
      <SupportWidget />
      <CloudSyncBanner />
      <CookieConsentBanner />
      <CookiePreferencesModal />
      <GooeyToaster
        position="bottom-center"
        preset="smooth"
        closeButton="top-right"
        showTimestamp={false}
        showProgress
        theme="light"
        offset="24px"
      />
    </>
  );

  return (
    <BrowserRouter>
      <AppErrorBoundary>
        {needsClerk ? (
          <DeferredCloudAuth publishableKey={clerkKey!}>{chrome}</DeferredCloudAuth>
        ) : (
          chrome
        )}
      </AppErrorBoundary>
    </BrowserRouter>
  );
};
