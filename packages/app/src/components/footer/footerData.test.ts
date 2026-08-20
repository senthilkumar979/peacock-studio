import { describe, expect, it } from 'vitest';
import { PEACOCK_APP_NAME } from '@/constants/branding';
import { CHROME_WEB_STORE_EXTENSION_URL } from '@/constants/extension';
import {
  FOOTER_EXTENSION_LINK,
  FOOTER_TAGLINE,
  getFooterCopyrightLabel,
  PUBLIC_EXPLORE_LINKS,
  PUBLIC_PRODUCT_LINKS,
  PUBLIC_SOLUTION_LINKS,
} from './footerData';

describe('footerData', () => {
  it('exposes explore, product, and solution link lists', () => {
    expect(FOOTER_TAGLINE.length).toBeGreaterThan(0);
    expect(PUBLIC_EXPLORE_LINKS.some((l) => l.label === 'Home')).toBe(true);
    expect(PUBLIC_PRODUCT_LINKS.length).toBeGreaterThan(0);
    expect(PUBLIC_SOLUTION_LINKS.length).toBeGreaterThan(0);
    expect(PUBLIC_SOLUTION_LINKS.length).toBeLessThanOrEqual(5);
  });

  it('points the extension link at the Chrome Web Store', () => {
    expect(FOOTER_EXTENSION_LINK.href).toBe(CHROME_WEB_STORE_EXTENSION_URL);
  });

  it('formats copyright with the app name', () => {
    expect(getFooterCopyrightLabel(2026)).toBe(`2026 ${PEACOCK_APP_NAME}`);
  });
});
