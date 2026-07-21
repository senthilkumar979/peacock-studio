import { PEACOCK_APP_NAME } from '@/constants/branding';
import { DASHBOARD_PATH, LANDING_PATH } from '@/constants/routes';
import { PRODUCT_NAV_ITEMS, SOLUTION_NAV_ITEMS } from '@/components/site/siteNavData';

export const FOOTER_TAGLINE = 'Platform where developers and business work together';

export const PUBLIC_EXPLORE_LINKS = [
  { label: 'Home', href: LANDING_PATH },
  { label: 'Products', href: '/products' },
  { label: 'Solutions', href: '/solutions' },
] as const;

export const PUBLIC_PRODUCT_LINKS = PRODUCT_NAV_ITEMS.map(({ label, href }) => ({
  label,
  href,
}));

export const PUBLIC_SOLUTION_LINKS = SOLUTION_NAV_ITEMS.slice(0, 5).map(({ label, href }) => ({
  label,
  href,
}));

export function getFooterCopyrightLabel(year: number): string {
  return `${year} ${PEACOCK_APP_NAME}`;
}
