import { useEffect, useState } from 'react';
import { ClerkFailed, ClerkLoaded, ClerkLoading } from '@clerk/react';
import { CloudInitConnectingError } from '@/components/auth/CloudNetworkBlockedNotice';
import { getCloudNetworkBlockedError } from '@/cloud/cloudInitErrors';

interface ClerkAuthWidgetProps {
  children: React.ReactNode;
  /** Shown while Clerk.js is downloading / initializing. */
  loadingLabel?: string;
}

const LOAD_TIMEOUT_MS = 12_000;

const shellClass =
  'w-full max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm';

const AuthLoadError = () => (
  <CloudInitConnectingError
    error={getCloudNetworkBlockedError()}
    onRetry={() => window.location.reload()}
  />
);

function clerkUiMounted(): boolean {
  return Boolean(document.querySelector('.cl-rootBox, .cl-card, [data-clerk-component]'));
}

export const ClerkAuthWidget = ({
  children,
  loadingLabel = 'Loading sign-in…',
}: ClerkAuthWidgetProps) => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (clerkUiMounted()) return;

    const started = Date.now();
    const id = window.setInterval(() => {
      if (clerkUiMounted()) {
        window.clearInterval(id);
        return;
      }
      if (Date.now() - started >= LOAD_TIMEOUT_MS) {
        setTimedOut(true);
        window.clearInterval(id);
      }
    }, 400);

    return () => window.clearInterval(id);
  }, []);

  if (timedOut) return <AuthLoadError />;

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <ClerkLoading>
        <div className={shellClass} role="status" aria-live="polite">
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-peacock-200 border-t-peacock-700"
            aria-hidden
          />
          <p className="mt-4 text-sm font-medium text-slate-700">{loadingLabel}</p>
          <p className="mt-1 text-xs text-slate-500">Connecting to Clerk…</p>
        </div>
      </ClerkLoading>

      <ClerkFailed>
        <AuthLoadError />
      </ClerkFailed>

      <ClerkLoaded>{children}</ClerkLoaded>
    </div>
  );
};
