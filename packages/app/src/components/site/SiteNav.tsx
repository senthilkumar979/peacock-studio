import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { Link, useLocation } from 'react-router-dom';
import { SiteNavDropdown } from './SiteNavDropdown';
import { PRODUCT_NAV_ITEMS, SOLUTION_NAV_ITEMS } from './siteNavData';

interface SiteNavProps {
  visible?: boolean;
}

export const SiteNav = ({ visible = true }: SiteNavProps) => {
  const { pathname } = useLocation();
  const isHome = pathname === '/landing' || pathname === '/';
  const isProducts = pathname.startsWith('/products');
  const isSolutions = pathname.startsWith('/solutions');

  const productItems = PRODUCT_NAV_ITEMS.map(({ label, href, description }) => ({
    label,
    href,
    description,
  }));

  const solutionItems = SOLUTION_NAV_ITEMS.map(({ label, href, description }) => ({
    label,
    href,
    description,
  }));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-peacock-900/95 backdrop-blur-xl transition duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        aria-label="Main navigation"
      >
        <Link
          to="/landing"
          className="inline-flex items-center gap-2.5 rounded-lg outline-none ring-peacock-500 focus-visible:ring-2"
        >
          <img src={PEACOCK_LOGO_SRC} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          <span className="text-sm font-semibold text-white">{PEACOCK_APP_NAME}</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/landing"
            className={`rounded-lg px-2 py-1.5 text-sm transition hover:text-white ${
              isHome ? 'text-white' : 'text-slate-300'
            }`}
          >
            Home
          </Link>
          <SiteNavDropdown
            label="Products"
            href="/products"
            items={productItems}
            isActive={isProducts}
          />
          <SiteNavDropdown
            label="Solutions"
            href="/solutions"
            items={solutionItems}
            isActive={isSolutions}
          />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link to="/products" className="text-xs font-medium text-slate-300 hover:text-white">
            Products
          </Link>
          <Link to="/solutions" className="text-xs font-medium text-slate-300 hover:text-white">
            Solutions
          </Link>
        </div>

        <Link
          to="/"
          className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-peacock-800 shadow-sm transition hover:bg-slate-100"
        >
          Open App
        </Link>
      </nav>
    </header>
  );
};
