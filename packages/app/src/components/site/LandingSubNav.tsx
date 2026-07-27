import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { DASHBOARD_PATH, LANDING_PATH, PRICING_PATH } from '@/constants/routes';
import { isCloudSyncEnabled } from '@/cloud/config';
import { useActiveSection } from '@/pages/solutions/useActiveSection';
import { getExtensionGatePath } from '@/utils/extensionGate';
import { LANDING_SUB_NAV_ITEMS } from './siteNavData';

interface LandingSubNavProps {
  visible?: boolean;
}

const SITE_LINKS = [
  { label: 'Home', href: LANDING_PATH },
  { label: 'Products', href: '/products' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Pricing', href: PRICING_PATH },
] as const;

/**
 * Post-hero sticky nav — same collapsible pattern as SiteNav:
 * desktop shows section links inline; mobile/tablet uses a hamburger panel.
 */
export const LandingSubNav = ({ visible = false }: LandingSubNavProps) => {
  const sectionIds = LANDING_SUB_NAV_ITEMS.map((item) => item.id);
  const activeId = useActiveSection(sectionIds, 120);
  const [menuOpen, setMenuOpen] = useState(false);
  const showAuthLinks = isCloudSyncEnabled();

  useEffect(() => {
    if (!visible) setMenuOpen(false);
  }, [visible]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl transition duration-300 ${
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4"
        aria-label="Page sections"
      >
        <Link
          to={LANDING_PATH}
          className="inline-flex shrink-0 items-center gap-2.5 rounded-lg outline-none ring-peacock-500 focus-visible:ring-2"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src={PEACOCK_LOGO_SRC}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
          <span className="text-sm font-semibold text-slate-900">{PEACOCK_APP_NAME}</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1.5 px-4 md:flex lg:gap-2">
          {LANDING_SUB_NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-peacock-100 text-peacock-800 ring-1 ring-peacock-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={getExtensionGatePath(DASHBOARD_PATH)}
            className="hidden items-center gap-1.5 rounded-lg bg-peacock-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-peacock-600 md:inline-flex"
          >
            Open App
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="inline-flex rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
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
            className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
          >
            <div className="max-h-[min(75vh,32rem)] space-y-1 overflow-y-auto px-4 py-4 sm:px-6">
              {SITE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 border-t border-slate-100 pt-2">
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  On this page
                </p>
                {LANDING_SUB_NAV_ITEMS.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setMenuOpen(false)}
                      className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-peacock-50 text-peacock-800'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>

              {showAuthLinks ? (
                <>
                  <Link
                    to="/sign-in"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/sign-up"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Sign up
                  </Link>
                </>
              ) : null}

              <Link
                to={getExtensionGatePath(DASHBOARD_PATH)}
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-peacock-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-peacock-600"
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
