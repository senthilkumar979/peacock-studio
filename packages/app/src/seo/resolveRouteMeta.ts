import { PEACOCK_APP_NAME } from '@/constants/branding';
import { DEFAULT_META_DESCRIPTION, absoluteUrl } from '@/constants/site';
import { getProductBySlug } from '@/pages/products/productsData';
import { getSolutionRoleBySlug } from '@/pages/solutions/solutionsData';
import {
  isNoindexPath,
  marketingStaticMeta,
  titled,
  type RouteMeta,
} from '@/seo/routeMetaData';

export type { RouteMeta } from '@/seo/routeMetaData';

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
      };
    }
  }

  return {
    title: PEACOCK_APP_NAME,
    description: DEFAULT_META_DESCRIPTION,
    path: pathname,
    robots: 'index,follow',
  };
}
