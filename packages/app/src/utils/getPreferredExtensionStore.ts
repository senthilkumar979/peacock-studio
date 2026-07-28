import { parseBrowserFamily, type CaptureBrowserFamily } from '@peacock/shared';
import {
  CHROME_WEB_STORE_EXTENSION_URL,
  EXTENSION_STORE_BY_FAMILY,
  type ExtensionStoreListing,
} from '@/constants/extension';

const CHROME_FALLBACK: ExtensionStoreListing = {
  storeUrl: CHROME_WEB_STORE_EXTENSION_URL,
  extensionId: null,
  label: 'Chrome Web Store',
};

function listingForFamily(family: CaptureBrowserFamily): ExtensionStoreListing {
  const entry = EXTENSION_STORE_BY_FAMILY[family];
  if (entry?.storeUrl) return entry;
  const chrome = EXTENSION_STORE_BY_FAMILY.chrome;
  if (chrome?.storeUrl) return chrome;
  return CHROME_FALLBACK;
}

/** Resolves the preferred store listing for the current (or given) user agent. */
export function getPreferredExtensionStoreListing(
  userAgent: string = typeof navigator !== 'undefined' ? navigator.userAgent : '',
): ExtensionStoreListing {
  const { family } = parseBrowserFamily(userAgent);
  return listingForFamily(family);
}

/** Store URL for install CTAs — family listing when published, else Chrome Web Store. */
export function getPreferredExtensionStoreUrl(
  userAgent: string = typeof navigator !== 'undefined' ? navigator.userAgent : '',
): string {
  return getPreferredExtensionStoreListing(userAgent).storeUrl ?? CHROME_WEB_STORE_EXTENSION_URL;
}
