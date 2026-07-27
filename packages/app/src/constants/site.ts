import { PEACOCK_APP_NAME } from '@/constants/branding';

/**
 * Primary production origin (Vercel custom domain).
 * Prefer this over *.vercel.app for canonical / OG / sitemap URLs.
 * `LEGAL_ENTITY.websiteUrl` may differ until the brand domain is live.
 */
export const SITE_ORIGIN = 'https://peacock.mentorbridge.in' as const;

export const SITE_NAME = PEACOCK_APP_NAME;

/** Default meta description — also used in index.html */
export const DEFAULT_META_DESCRIPTION =
  'Peacock Studio turns real browser workflows into editable Flow Documents and Product Tours — interactive documentation with screenshots, branches, PDF export, cloud sync, and team workspaces.';

export const DEFAULT_DOCUMENT_TITLE = `${PEACOCK_APP_NAME} — Flow docs & product tours from real workflows`;

export const OG_IMAGE_PATH = '/og-social.png' as const;

export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized === '/' ? '' : normalized}` || SITE_ORIGIN;
}

export function ogImageUrl(): string {
  return absoluteUrl(OG_IMAGE_PATH);
}
