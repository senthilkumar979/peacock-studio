import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { DASHBOARD_PATH, LANDING_PATH, PRICING_PATH } from '@/constants/routes';
import { SiteNavDropdown } from './SiteNavDropdown';
import { PRODUCT_NAV_ITEMS, SOLUTION_NAV_ITEMS } from './siteNavData';

interface SiteNavProps {
  visible?: boolean;
}

const MOBILE_LINKS = [
  { label: 'Home', href: LANDING_PATH },
  { label: 'Products', href: '/products' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Pricing', href: PRICING_PATH },
] as const;

const desktopLinkClass = (active: boolean) =>
  `relative rounded-lg px-2 py-1.5 text-sm transition hover:text-white ${
    active ? 'text-white' : 'text-slate-300'
  }`;

export const SiteNav = ({ visible = true }: SiteNavProps) => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === LANDING_PATH ? pathname === LANDING_PATH : pathname.startsWith(href);

  const productItems = PRODUCT_NAV_ITEMS.map(({ label, href, description }) => ({ label, href, description }));
  const solutionItems = SOLUTION_NAV_ITEMS.map(({ label, href, description }) => ({ label, href, description }));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-peacock-900/95 backdrop-blur-xl transition duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4" aria-label="Main navigation">
        <Link
          to={LANDING_PATH}
          className="inline-flex items-center gap-2.5 rounded-lg outline-none ring-peacock-500 focus-visible:ring-2"
        >
          <img src={PEACOCK_LOGO_SRC} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          <span className="text-sm font-semibold text-white">{PEACOCK_APP_NAME}</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to={LANDING_PATH} className={desktopLinkClass(isActive(LANDING_PATH))}>
            Home
            {isActive(LANDING_PATH) ? <NavUnderline /> : null}
          </Link>
          <SiteNavDropdown label="Products" href="/products" items={productItems} isActive={isActive('/products')} />
          <SiteNavDropdown label="Solutions" href="/solutions" items={solutionItems} isActive={isActive('/solutions')} />
          <Link to={PRICING_PATH} className={desktopLinkClass(isActive(PRICING_PATH))}>
            Pricing
            {isActive(PRICING_PATH) ? <NavUnderline /> : null}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={DASHBOARD_PATH}
            className="hidden items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-peacock-800 shadow-sm transition hover:bg-slate-100 md:inline-flex"
          >
            Open App
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="inline-flex rounded-lg p-2 text-slate-200 transition hover:bg-white/10 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="space-y-1 px-6 py-4">
              {MOBILE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive(link.href) ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to={DASHBOARD_PATH}
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-peacock-800"
              >
                Open App
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

const NavUnderline = () => (
  <motion.span
    layoutId="site-nav-underline"
    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-brand-cyan"
  />
);
