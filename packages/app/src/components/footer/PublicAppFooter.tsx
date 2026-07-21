import { Copyright } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignInButton, SignUpButton } from '@clerk/react';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { isCloudSyncEnabled } from '@/cloud/config';
import { DASHBOARD_PATH } from '@/constants/routes';
import { ChromeWebStoreLink } from '@/components/extension/ChromeWebStoreLink';
import {
  FOOTER_TAGLINE,
  getFooterCopyrightLabel,
  PUBLIC_EXPLORE_LINKS,
  PUBLIC_PRODUCT_LINKS,
  PUBLIC_SOLUTION_LINKS,
} from '@/components/footer/footerData';
import { FooterLegalLinks } from '@/components/footer/FooterLegalLinks';

export const PublicAppFooter = () => {
  const year = new Date().getFullYear();
  const showAuthActions = isCloudSyncEnabled();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-gradient-to-b from-white to-slate-50/90 py-10 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 rounded-lg outline-none ring-peacock-500 focus-visible:ring-2"
            >
              <img src={PEACOCK_LOGO_SRC} alt="" className="h-9 w-9 object-contain" />
              <span className="text-sm font-semibold text-slate-900">{PEACOCK_APP_NAME}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">{FOOTER_TAGLINE}</p>
            <ChromeWebStoreLink
              showIcon
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-peacock-700 transition hover:text-peacock-900"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-900">Explore</p>
            <ul className="mt-3 space-y-2">
              {PUBLIC_EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-600 transition hover:text-peacock-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-900">Products</p>
            <ul className="mt-3 space-y-2">
              {PUBLIC_PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-600 transition hover:text-peacock-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-900">Solutions</p>
            <ul className="mt-3 space-y-2">
              {PUBLIC_SOLUTION_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-600 transition hover:text-peacock-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <Copyright className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="font-medium text-slate-600">{getFooterCopyrightLabel(year)}</span>
          </p>

          <div className="flex flex-col gap-3 sm:items-end">
            {showAuthActions ? (
              <div className="flex flex-wrap items-center gap-2">
                <SignInButton mode="redirect" forceRedirectUrl={DASHBOARD_PATH}>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="redirect" forceRedirectUrl={DASHBOARD_PATH}>
                  <button
                    type="button"
                    className="rounded-lg bg-peacock-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-peacock-700"
                  >
                    Create account
                  </button>
                </SignUpButton>
              </div>
            ) : null}
            <FooterLegalLinks className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end" />
          </div>
        </div>
      </div>
    </footer>
  );
};
