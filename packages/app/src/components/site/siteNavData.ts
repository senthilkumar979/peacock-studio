import { PRODUCTS } from '@/pages/products/productsData';
import { SOLUTION_ROLES } from '@/pages/solutions/solutionsData';

export const LANDING_SUB_NAV_ITEMS = [
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution' },
  { id: 'preview', label: 'Preview' },
  { id: 'features', label: 'Features' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'platform-comparison', label: 'Compare' },
  { id: 'faq', label: 'FAQ' },
] as const;

export const PRODUCT_NAV_ITEMS = PRODUCTS.map((product) => ({
  slug: product.slug,
  label: product.shortName,
  href: `/products/${product.slug}`,
  description: product.tagline,
}));

export const SOLUTION_NAV_ITEMS = SOLUTION_ROLES.map((role) => ({
  slug: role.slug,
  label: role.shortTitle,
  href: `/solutions/${role.slug}`,
  description: role.tagline,
}));
