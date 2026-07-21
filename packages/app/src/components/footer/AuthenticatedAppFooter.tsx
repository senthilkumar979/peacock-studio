import { Copyright } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { isCloudSyncEnabled } from '@/cloud/config';
import { DASHBOARD_PATH } from '@/constants/routes';
import { LIBRARY_NAV_ITEMS } from '@/constants/libraryNav';
import { ChromeWebStoreLink } from '@/components/extension/ChromeWebStoreLink';
import { FOOTER_TAGLINE, getFooterCopyrightLabel } from '@/components/footer/footerData';
import { FooterLegalLinks } from '@/components/footer/FooterLegalLinks';
import { useSessionMode } from '@/hooks/useSessionMode';

const AUTHENTICATED_FOOTER_HINT = {
  cloud: 'Library synced to your account',
  local: 'Library stored on this device',
} as const;

const footerNavClass = ({ isActive }: { isActive: boolean }) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
    isActive
      ? 'bg-peacock-50/90 ring-1 ring-peacock-100/80'
      : 'hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-200/70'
  }`;

export const AuthenticatedAppFooter = () => {
  const year = new Date().getFullYear();
  const sessionMode = useSessionMode();
  const sessionHint =
    isCloudSyncEnabled() && sessionMode === 'cloud'
      ? AUTHENTICATED_FOOTER_HINT.cloud
      : AUTHENTICATED_FOOTER_HINT.local;

  return (
    <footer className="mt-auto border-t border-slate-200/70 bg-white/75 py-10 backdrop-blur-md supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto max-w-8xl px-4 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
          <div className="max-w-sm shrink-0 lg:border-r lg:border-slate-200/70 lg:pr-12">
            <Link
              to={DASHBOARD_PATH}
              className="group inline-flex items-center gap-3.5 rounded-2xl outline-none ring-peacock-500 focus-visible:ring-2"
            >
              <span className="inline-flex rounded-2xl bg-gradient-to-br from-peacock-500 to-peacock-700 p-3 shadow-lg shadow-peacock-500/15 ring-1 ring-peacock-600/10 transition group-hover:shadow-peacock-500/25">
                <img src={PEACOCK_LOGO_SRC} alt="" className="h-12 w-12 object-contain" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-base font-semibold tracking-tight text-slate-900">
                  {PEACOCK_APP_NAME}
                </span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-peacock-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-peacock-500" aria-hidden />
                  {sessionHint}
                </span>
              </span>
            </Link>

            <p className="mt-5 text-sm leading-relaxed text-slate-500">{FOOTER_TAGLINE}</p>
            <ChromeWebStoreLink
              showIcon
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-peacock-700 transition hover:text-peacock-900"
            />
          </div>

          <div className="min-w-0 flex-1 lg:pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </p>
            <nav
              aria-label="Library shortcuts"
              className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3"
            >
              {LIBRARY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={footerNavClass}
                  >
                    <span className="inline-flex rounded-lg bg-peacock-50 p-2 ring-1 ring-peacock-100/80 transition group-hover:bg-peacock-100/70">
                      <Icon className="h-4 w-4 shrink-0 text-peacock-600" aria-hidden />
                    </span>
                    <span className="text-sm font-medium text-slate-700 transition group-hover:text-peacock-800">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <FooterLegalLinks
            withSeparators
            className="flex flex-wrap items-center gap-x-1 gap-y-2"
            linkClassName="px-1.5 py-1 text-xs font-medium text-slate-500 transition hover:text-peacock-700"
          />
          <p className="inline-flex shrink-0 items-center gap-1.5 px-2 text-xs text-slate-500 sm:justify-end">
            <Copyright className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="font-medium text-slate-600">{getFooterCopyrightLabel(year)}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
