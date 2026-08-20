import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { setSessionAuthState } from '@/cloud/sessionState';
import { isMarketingPath } from '@/utils/marketingRoutes';

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
 * Lazy-loads Clerk after first paint. Marketing still renders immediately; cloud sync
 * stays off there. Clerk session is synced so the landing nav can show Open App for
 * signed-in users instead of Sign in / Sign up.
 *
 * Product/auth routes wait for the Clerk tree so useAuth / SignIn never mount
 * outside the provider.
 */
export const DeferredCloudAuth = ({ publishableKey, children }: DeferredCloudAuthProps) => {
  const { pathname } = useLocation();
  const [Tree, setTree] = useState<ComponentType<ClerkTreeProps> | null>(null);
  const isMarketing = isMarketingPath(pathname);
  const enableCloudSync = !isMarketing;

  useEffect(() => {
    if (Tree) return;

    let cancelled = false;
    void import('@/components/auth/ClerkCloudAuthTree')
      .then((module) => {
        if (!cancelled) setTree(() => module.ClerkCloudAuthTree);
      })
      .catch(() => {
        if (!cancelled) setSessionAuthState(true, false);
      });

    return () => {
      cancelled = true;
    };
  }, [Tree]);

  if (!Tree) {
    if (isMarketing) return children;
    return <ClerkBootShell />;
  }

  return (
    <Tree publishableKey={publishableKey} enableCloudSync={enableCloudSync}>
      {children}
    </Tree>
  );
};
