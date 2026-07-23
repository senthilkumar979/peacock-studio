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
 * Loads Clerk + cloud sync only on product/auth routes.
 *
 * Marketing routes never mount Clerk — CTAs use plain `/sign-in` / `/sign-up` links
 * (see PublicAppFooter / CloudAuthActions). This avoids Clerk third-party cookies and
 * SDK console noise on cold landing-page loads.
 *
 * If the user later returns to marketing after Clerk already loaded, the tree stays
 * mounted with cloud sync disabled so navigation stays snappy.
 */
export const DeferredCloudAuth = ({ publishableKey, children }: DeferredCloudAuthProps) => {
  const { pathname } = useLocation();
  const [Tree, setTree] = useState<ComponentType<ClerkTreeProps> | null>(null);
  const isMarketing = isMarketingPath(pathname);
  const enableCloudSync = !isMarketing;

  useEffect(() => {
    // Cold marketing: treat as signed-out guest without booting Clerk.
    if (isMarketing && !Tree) setSessionAuthState(true, false);
  }, [isMarketing, Tree]);

  useEffect(() => {
    if (Tree || isMarketing) return;

    let cancelled = false;
    void import('@/components/auth/ClerkCloudAuthTree').then((module) => {
      if (!cancelled) setTree(() => module.ClerkCloudAuthTree);
    });

    return () => {
      cancelled = true;
    };
  }, [Tree, isMarketing]);

  if (!Tree) {
    // Marketing never needs ClerkProvider. Product/auth routes must wait so
    // useAuth / <SignIn> do not mount outside the provider (console errors).
    if (isMarketing) return children;
    return <ClerkBootShell />;
  }

  return (
    <Tree publishableKey={publishableKey} enableCloudSync={enableCloudSync}>
      {children}
    </Tree>
  );
};
