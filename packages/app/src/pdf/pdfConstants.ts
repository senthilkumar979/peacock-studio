import {
  resolveOrgBranding,
  type OrgWithOptionalBranding,
} from '@/cloud/types/orgBranding';

export const PDF_BRAND_NAME = 'Peacock Studio';
export const PDF_FOOTER_TAGLINE = `Built using ${PDF_BRAND_NAME}`;

/**
 * PDF footer logo. Pass org metadata when available; otherwise Peacock defaults
 * (same absolute URL behavior as before branding fields exist).
 */
export function getPdfLogoUrl(org?: OrgWithOptionalBranding | null): string {
  const { logoUrl } = resolveOrgBranding(org);
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://') || logoUrl.startsWith('data:')) {
    return logoUrl;
  }
  if (typeof window !== 'undefined') {
    return new URL(logoUrl, window.location.origin).href;
  }
  return logoUrl;
}
