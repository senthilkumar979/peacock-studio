import { PEACOCK_APP_NAME } from '@/constants/branding';
import { LEGAL_ENTITY } from '@/constants/legal';
import {
  DEFAULT_DOCUMENT_TITLE,
  DEFAULT_META_DESCRIPTION,
  SITE_ORIGIN,
  absoluteUrl,
} from '@/constants/site';

export interface RouteMeta {
  title: string;
  description: string;
  path: string;
  robots: 'index,follow' | 'noindex,nofollow';
  canonical?: string;
  jsonLd?: unknown;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: 'website' | 'article';
}

export const TITLE_SUFFIX = ` · ${PEACOCK_APP_NAME}`;

export function titled(page: string): string {
  return `${page}${TITLE_SUFFIX}`;
}

/** App shells, auth, editor, and user-content URLs — keep out of SERPs. */
export const NOINDEX_PREFIXES = [
  '/dashboard',
  '/flow-docs',
  '/product-tours',
  '/test-cases',
  '/playwright-tests',
  '/flow-maps',
  '/editor',
  '/edit',
  '/docs/',
  '/capture/',
  '/tours/',
  '/compare',
  '/s/',
  '/examples/',
  '/sign-in',
  '/sign-up',
  '/onboarding/',
  '/accept-invite',
  '/org/',
  '/super-admin',
  '/platform/',
  '/health',
  '/api-docs',
  '/error',
] as const;

export function isNoindexPath(pathname: string): boolean {
  return NOINDEX_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}

export function landingJsonLd() {
  const logo = absoluteUrl('/peacock-logo.png');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#organization`,
        name: PEACOCK_APP_NAME,
        url: SITE_ORIGIN,
        logo,
        email: LEGAL_ENTITY.supportEmail,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        name: PEACOCK_APP_NAME,
        url: SITE_ORIGIN,
        description: DEFAULT_META_DESCRIPTION,
        publisher: { '@id': `${SITE_ORIGIN}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_ORIGIN}/#software`,
        name: PEACOCK_APP_NAME,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, Chrome',
        description: DEFAULT_META_DESCRIPTION,
        url: SITE_ORIGIN,
        image: logo,
        publisher: { '@id': `${SITE_ORIGIN}/#organization` },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    ],
  };
}

export function marketingStaticMeta(
  pathname: string,
): Omit<RouteMeta, 'path'> | null {
  const pages: Record<string, { title: string; description: string }> = {
    '/': {
      title: DEFAULT_DOCUMENT_TITLE,
      description: DEFAULT_META_DESCRIPTION,
    },
    '/products': {
      title: titled('Products'),
      description:
        'Flow Documents, Product Tours, and Capture & Editor — turn real browser usage into reusable guides, demos, and screenshots.',
    },
    '/solutions': {
      title: titled('Solutions by role'),
      description:
        'See how Peacock Studio helps developers, QA, product, support, sales, and leadership capture workflows as Flow Documents and Product Tours.',
    },
    '/pricing': {
      title: titled('Pricing'),
      description:
        'Peacock Studio is free during public beta. Compare Free, Team, and Enterprise plans for flow docs, product tours, and interactive documentation.',
    },
    '/privacy': {
      title: titled('Privacy Policy'),
      description: `How ${PEACOCK_APP_NAME} handles data for the web app and Chrome extension.`,
    },
    '/terms': {
      title: titled('Terms of Service'),
      description: `Terms of use for ${PEACOCK_APP_NAME}.`,
    },
    '/install-extension': {
      title: titled('Install browser extension'),
      description: `Install the ${PEACOCK_APP_NAME} browser extension to capture browser workflows.`,
    },
  };

  const page = pages[pathname];
  if (!page) return null;

  return {
    ...page,
    robots: 'index,follow',
    canonical: absoluteUrl(pathname === '/' ? '/' : pathname),
    jsonLd: pathname === '/' ? landingJsonLd() : undefined,
  };
}
