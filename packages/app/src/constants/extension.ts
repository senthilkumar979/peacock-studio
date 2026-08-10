import type { CaptureBrowserFamily } from '@peacock/shared';

/** Published Chrome Web Store listing for Peacock Studio. */
export const CHROME_WEB_STORE_EXTENSION_URL =
  'https://chromewebstore.google.com/detail/peacock-studio/abjglkkkjaoabboginagilnejoacnnnm' as const;

/** Extension ID from the published Chrome Web Store listing. */
export const PUBLISHED_EXTENSION_ID = 'abjglkkkjaoabboginagilnejoacnnnm' as const;

/** Published Microsoft Edge Add-ons listing for Peacock Studio. */
export const EDGE_ADDONS_EXTENSION_URL =
  'https://microsoftedge.microsoft.com/addons/detail/peacock-studio/jehdcpioaiikjafefnbjnnigalpjikob' as const;

/** Extension ID from the published Edge Add-ons listing. */
export const PUBLISHED_EDGE_EXTENSION_ID = 'jehdcpioaiikjafefnbjnnigalpjikob' as const;

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
 * Fill Firefox fields after AMO publishes — no redesign needed.
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
    storeUrl: EDGE_ADDONS_EXTENSION_URL,
    extensionId: PUBLISHED_EDGE_EXTENSION_ID,
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
