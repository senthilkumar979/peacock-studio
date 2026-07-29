import { PEACOCK_APP_NAME } from '@/constants/branding';
import { absoluteUrl, DEFAULT_META_DESCRIPTION } from '@/constants/site';
import { getProductBySlug } from '@/pages/products/productsData';
import { getSolutionRoleBySlug } from '@/pages/solutions/solutionsData';
import { listPublicMarketingPaths } from '@/seo/publicPaths';
import {
  isNoindexPath,
  marketingStaticMeta,
  titled,
  type RouteMeta,
} from '@/seo/routeMetaData';

export type { RouteMeta } from '@/seo/routeMetaData';

export function isKnownMarketingPath(pathname: string): boolean {
  return listPublicMarketingPaths().includes(pathname);
}

export function resolveRouteMeta(pathname: string): RouteMeta {
  if (isNoindexPath(pathname)) {
    return {
      title: PEACOCK_APP_NAME,
      description: DEFAULT_META_DESCRIPTION,
      path: pathname,
      robots: 'noindex,nofollow',
    };
  }

  const staticMeta = marketingStaticMeta(pathname);
  if (staticMeta) {
    return { ...staticMeta, path: pathname };
  }

  const productMatch = pathname.match(/^\/products\/([^/]+)\/?$/);
  if (productMatch) {
    const product = getProductBySlug(productMatch[1]);
    if (product) {
      return {
        title: titled(product.name),
        description: product.summary,
        path: pathname,
        robots: 'index,follow',
        canonical: absoluteUrl(pathname),
        ogImageAlt: `${product.name} — ${PEACOCK_APP_NAME}`,
      };
    }
  }

  const roleMatch = pathname.match(/^\/solutions\/([^/]+)\/?$/);
  if (roleMatch) {
    const role = getSolutionRoleBySlug(roleMatch[1]);
    if (role) {
      return {
        title: titled(role.title),
        description: role.summary,
        path: pathname,
        robots: 'index,follow',
        canonical: absoluteUrl(pathname),
        ogImageAlt: `${role.title} — ${PEACOCK_APP_NAME}`,
      };
    }
  }

  return {
    title: titled('Page not found'),
    description: 'That URL does not match a Peacock Studio page.',
    path: pathname,
    robots: 'noindex,nofollow',
  };
}
