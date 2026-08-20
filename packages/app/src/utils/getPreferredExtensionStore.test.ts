import { describe, expect, it } from 'vitest';
import {
  CHROME_WEB_STORE_EXTENSION_URL,
  EDGE_ADDONS_EXTENSION_URL,
} from '@/constants/extension';
import {
  getPreferredExtensionStoreListing,
  getPreferredExtensionStoreUrl,
} from './getPreferredExtensionStore';

describe('getPreferredExtensionStore', () => {
  it('resolves Chrome listing for Chrome UA', () => {
    const chromeUa =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const listing = getPreferredExtensionStoreListing(chromeUa);
    expect(listing.storeUrl).toBe(CHROME_WEB_STORE_EXTENSION_URL);
    expect(getPreferredExtensionStoreUrl(chromeUa)).toBe(CHROME_WEB_STORE_EXTENSION_URL);
  });

  it('resolves Edge listing for Edge UA', () => {
    const edgeUa =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
    expect(getPreferredExtensionStoreListing(edgeUa).storeUrl).toBe(EDGE_ADDONS_EXTENSION_URL);
    expect(getPreferredExtensionStoreUrl(edgeUa)).toBe(EDGE_ADDONS_EXTENSION_URL);
  });

  it('falls back to Chrome Web Store for Firefox (unpublished listing)', () => {
    const firefoxUa =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0';
    expect(getPreferredExtensionStoreUrl(firefoxUa)).toBe(CHROME_WEB_STORE_EXTENSION_URL);
  });
});
