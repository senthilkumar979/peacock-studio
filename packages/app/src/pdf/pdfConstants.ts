export const PDF_BRAND_NAME = 'Peacock Studio';
export const PDF_FOOTER_TAGLINE = `Built using ${PDF_BRAND_NAME}`;

export function getPdfLogoUrl(): string {
  if (typeof window !== 'undefined') {
    return new URL('/peacock-logo.png', window.location.origin).href;
  }
  return '/peacock-logo.png';
}
