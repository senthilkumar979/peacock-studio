import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { CloudInitConnectingError } from '@/components/auth/CloudNetworkBlockedNotice';
import { setSessionAuthState } from '@/cloud/sessionState';
import { getCloudNetworkBlockedError } from '@/cloud/cloudInitErrors';
import {
  isClerkForbiddenPath,
  isClerkOptionalPath,
  isMarketingPath,
  isPublicSharePath,
} from '@/utils/marketingRoutes';

interface DeferredCloudAuthProps {
  publishableKey: string;
  children: ReactNode;
}

interface ClerkTreeProps {
  publishableKey: string;
  /** When false, mount Clerk only (no cloud sync / setup toasts). */
  enableCloudSync: boolean;
  children: ReactNode;
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

/**
 * Lazy-loads Clerk after first paint.
 *
 * - Marketing: paint immediately; Clerk may warm in the background for nav.
 * - Public share embeds (`/s/:token/embed`): never load Clerk — corp networks often
 *   block clerk.*; embeds only need the first-party resolve-share + screenshot proxies.
 * - Other `/s/*`: paint immediately; Clerk loads in background for auth-gated shares.
 * - App routes: wait for Clerk; on script failure show allowlist workarounds.
 */
export const DeferredCloudAuth = ({ publishableKey, children }: DeferredCloudAuthProps) => {
  const { pathname } = useLocation();
  const [Tree, setTree] = useState<ComponentType<ClerkTreeProps> | null>(null);
  const [clerkLoadFailed, setClerkLoadFailed] = useState(false);
  const isMarketing = isMarketingPath(pathname);
  const isShare = isPublicSharePath(pathname);
  const clerkOptional = isClerkOptionalPath(pathname);
  const forbidClerk = isClerkForbiddenPath(pathname);
  const enableCloudSync = !isMarketing && !isShare;

  useEffect(() => {
    if (forbidClerk) {
      setSessionAuthState(true, false);
      return;
    }

    if (Tree) return;

    let cancelled = false;
    void import('@/components/auth/ClerkCloudAuthTree')
      .then((module) => {
        if (!cancelled) setTree(() => module.ClerkCloudAuthTree);
      })
      .catch(() => {
        if (cancelled) return;
        setSessionAuthState(true, false);
        setClerkLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [Tree, forbidClerk]);

  if (forbidClerk) return <>{children}</>;

  if (!Tree) {
    if (clerkOptional) return <>{children}</>;
    if (clerkLoadFailed) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
          <CloudInitConnectingError
            error={getCloudNetworkBlockedError()}
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }
    return <ClerkBootShell />;
  }

  return (
    <Tree publishableKey={publishableKey} enableCloudSync={enableCloudSync}>
      {children}
    </Tree>
  );
};
