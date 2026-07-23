import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  EXTENSION_INSTALL_PATH,
  LANDING_PATH,
  PRICING_PATH,
  PRIVACY_PATH,
  TERMS_PATH,
} from '@/constants/routes';

interface DeferredCloudAuthProps {
  publishableKey: string;
  children: ReactNode;
}

interface ClerkTreeProps {
  publishableKey: string;
  children: ReactNode;
}

const MARKETING_PREFIXES = [
  '/products',
  '/solutions',
  PRICING_PATH,
  PRIVACY_PATH,
  TERMS_PATH,
  EXTENSION_INSTALL_PATH,
] as const;

function isMarketingPath(pathname: string): boolean {
  if (pathname === LANDING_PATH) return true;
  return MARKETING_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function scheduleIdle(task: () => void, timeoutMs = 3000): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(() => task(), { timeout: timeoutMs });
    return () => window.cancelIdleCallback(id);
  }
  const timer = window.setTimeout(task, 1200);
  return () => window.clearTimeout(timer);
}

/**
 * Loads Clerk + cloud sync after first paint on marketing routes so `/` is not
 * blocked by auth SDK download/init. App routes boot Clerk immediately.
 */
export const DeferredCloudAuth = ({ publishableKey, children }: DeferredCloudAuthProps) => {
  const { pathname } = useLocation();
  const [Tree, setTree] = useState<ComponentType<ClerkTreeProps> | null>(null);
  const deferBoot = isMarketingPath(pathname);

  useEffect(() => {
    if (Tree) return;

    let cancelled = false;
    const load = () => {
      void import('@/components/auth/ClerkCloudAuthTree').then((module) => {
        if (!cancelled) setTree(() => module.ClerkCloudAuthTree);
      });
    };

    if (!deferBoot) {
      load();
      return () => {
        cancelled = true;
      };
    }

    const cancelIdle = scheduleIdle(load);
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [Tree, deferBoot]);

  if (!Tree) return children;

  return <Tree publishableKey={publishableKey}>{children}</Tree>;
};
