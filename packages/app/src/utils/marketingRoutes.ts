import {
  EXTENSION_INSTALL_PATH,
  LANDING_PATH,
  PRICING_PATH,
  PRIVACY_PATH,
  TERMS_PATH,
  isEmbedSharePath,
  isStaticExamplePath,
} from '@/constants/routes';
import { PUBLIC_SHARE_PATH } from '@/utils/shareLink';

export { isStaticExamplePath };

const MARKETING_PREFIXES = [
  '/products',
  '/solutions',
  PRICING_PATH,
  PRIVACY_PATH,
  TERMS_PATH,
  EXTENSION_INSTALL_PATH,
] as const;

/** Public marketing surfaces — no Clerk boot; cloud sync stays silent. */
export function isMarketingPath(pathname: string): boolean {
  if (pathname === LANDING_PATH) return true;
  return MARKETING_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Public share viewer/embed/edit routes (`/s/:token…`). */
export function isPublicSharePath(pathname: string): boolean {
  return (
    pathname === PUBLIC_SHARE_PATH ||
    pathname.startsWith(`${PUBLIC_SHARE_PATH}/`)
  );
}

/**
 * Routes that must paint without waiting for Clerk.
 * Embed iframes never need Clerk; waiting blocks screenshots when corp networks block clerk.*.
 */
export function isClerkOptionalPath(pathname: string): boolean {
  return (
    isMarketingPath(pathname) ||
    isPublicSharePath(pathname) ||
    isStaticExamplePath(pathname)
  );
}

/**
 * Never boot Clerk — avoids blocked clerk.peacock* / "Failed to load Clerk JS" on
 * restricted networks. Marketing CTAs go to /sign-in (graceful failure UI there).
 * Covers landing/marketing, share embeds, and static `/examples/*` demos.
 */
export function isClerkForbiddenPath(pathname: string): boolean {
  return (
    isMarketingPath(pathname) ||
    isEmbedSharePath(pathname) ||
    isStaticExamplePath(pathname)
  );
}
