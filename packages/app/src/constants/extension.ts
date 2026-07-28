import type { CaptureBrowserFamily } from '@peacock/shared';

/** Published Chrome Web Store listing for Peacock Studio. */
export const CHROME_WEB_STORE_EXTENSION_URL =
  'https://chromewebstore.google.com/detail/peacock-studio/abjglkkkjaoabboginagilnejoacnnnm' as const;

/** Extension ID from the published Chrome Web Store listing. */
export const PUBLISHED_EXTENSION_ID = 'abjglkkkjaoabboginagilnejoacnnnm' as const;

export const EXTENSION_DISPLAY_NAME = 'Peacock Studio extension' as const;

export interface ExtensionStoreListing {
  /** Store listing URL; null until that store publishes. */
  storeUrl: string | null;
  /** Store extension ID for runtime messaging fallback; null until published. */
  extensionId: string | null;
  /** Human-readable store name for CTAs. */
  label: string;
}

/**
 * Install / messaging registry keyed by browser family.
 * Fill Edge and Firefox fields after each store publishes — no redesign needed.
 */
export const EXTENSION_STORE_BY_FAMILY: Partial<
  Record<CaptureBrowserFamily, ExtensionStoreListing>
> = {
  chrome: {
    storeUrl: CHROME_WEB_STORE_EXTENSION_URL,
    extensionId: PUBLISHED_EXTENSION_ID,
    label: 'Chrome Web Store',
  },
  edge: {
    storeUrl: null,
    extensionId: null,
    label: 'Edge Add-ons',
  },
  firefox: {
    storeUrl: null,
    extensionId: null,
    label: 'Firefox Add-ons',
  },
  // Chromium-like browsers without a dedicated listing use Chrome via helpers.
  brave: {
    storeUrl: CHROME_WEB_STORE_EXTENSION_URL,
    extensionId: PUBLISHED_EXTENSION_ID,
    label: 'Chrome Web Store',
  },
  opera: {
    storeUrl: CHROME_WEB_STORE_EXTENSION_URL,
    extensionId: PUBLISHED_EXTENSION_ID,
    label: 'Chrome Web Store',
  },
};

/** Families whose store IDs are tried for runtime messaging (in order). */
export const EXTENSION_MESSAGING_FAMILY_ORDER = ['chrome', 'edge', 'firefox'] as const satisfies ReadonlyArray<
  CaptureBrowserFamily
>;
