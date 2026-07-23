import {
  EXTENSION_INSTALL_PATH,
  LANDING_PATH,
  PRICING_PATH,
  PRIVACY_PATH,
  TERMS_PATH,
} from '@/constants/routes';

const MARKETING_PREFIXES = [
  '/products',
  '/solutions',
  PRICING_PATH,
  PRIVACY_PATH,
  TERMS_PATH,
  EXTENSION_INSTALL_PATH,
] as const;

/** Public marketing surfaces — Clerk may warm in the background, but cloud sync must stay silent. */
export function isMarketingPath(pathname: string): boolean {
  if (pathname === LANDING_PATH) return true;
  return MARKETING_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
