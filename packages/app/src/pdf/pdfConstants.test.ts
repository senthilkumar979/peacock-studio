import { describe, expect, it } from 'vitest';
import { PDF_BRAND_NAME, PDF_FOOTER_TAGLINE, getPdfLogoUrl } from './pdfConstants';

describe('pdfConstants', () => {
  it('exposes brand footer copy', () => {
    expect(PDF_BRAND_NAME).toBe('Peacock Studio');
    expect(PDF_FOOTER_TAGLINE).toContain(PDF_BRAND_NAME);
  });

  it('returns absolute and data URLs as-is', () => {
    expect(getPdfLogoUrl({ logoUrl: 'https://cdn.example/logo.png' })).toBe(
      'https://cdn.example/logo.png',
    );
    expect(getPdfLogoUrl({ logoUrl: 'data:image/png;base64,abc' })).toBe(
      'data:image/png;base64,abc',
    );
  });

  it('resolves relative logos against window.origin', () => {
    expect(getPdfLogoUrl(null)).toBe(
      new URL('/peacock-logo.png', window.location.origin).href,
    );
  });
});
