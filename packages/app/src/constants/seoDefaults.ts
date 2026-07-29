import { PEACOCK_APP_NAME } from './branding';

export const SITE_ORIGIN = 'https://peacockstudio.app' as const;

export const SITE_NAME = PEACOCK_APP_NAME;

export const DEFAULT_META_DESCRIPTION =
  'Peacock Studio turns real browser workflows into editable Flow Documents and Product Tours — interactive documentation with screenshots, branches, PDF export, cloud sync, and team workspaces.';

export const DEFAULT_DOCUMENT_TITLE = `${PEACOCK_APP_NAME} — Flow docs & product tours from real workflows`;

export const OG_IMAGE_PATH = '/og-social.png' as const;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 800;
export const OG_LOCALE = 'en_US';
export const APPLE_TOUCH_ICON_PATH = '/peacock-logo.png';

export function productHeroImagePath(slug: string): string {
  return `/products/${slug}/hero.png`;
}

export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized === '/' ? '' : normalized}` || SITE_ORIGIN;
}

export function ogImageUrl(): string {
  return absoluteUrl(OG_IMAGE_PATH);
}
