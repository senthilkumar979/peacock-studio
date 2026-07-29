import { PRODUCTS } from '@/pages/products/productsData';
import { SOLUTION_ROLES } from '@/pages/solutions/solutionsData';

/** Static marketing paths with dedicated copy in `marketingStaticMeta`. */
export const MARKETING_STATIC_PATHS = [
  '/',
  '/products',
  '/solutions',
  '/pricing',
  '/privacy',
  '/terms',
  '/install-extension',
] as const;

export function listPublicMarketingPaths(): string[] {
  const paths = new Set<string>(MARKETING_STATIC_PATHS);
  for (const product of PRODUCTS) {
    paths.add(`/products/${product.slug}`);
  }
  for (const role of SOLUTION_ROLES) {
    paths.add(`/solutions/${role.slug}`);
  }
  return [...paths];
}
