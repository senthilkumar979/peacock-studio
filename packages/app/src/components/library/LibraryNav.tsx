import { NavLink, Link } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton } from '@clerk/react';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { isCloudSyncEnabled } from '@/cloud/config';
import { LIBRARY_NAV_ITEMS } from '@/constants/libraryNav';
import { DASHBOARD_PATH } from '@/constants/routes';
import { useSessionMode } from '@/hooks/useSessionMode';
import { openSupportChat } from '@/utils/support';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-peacock-50 text-peacock-800 ring-1 ring-peacock-200'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export const LibraryNav = () => {
  const sessionMode = useSessionMode();

  return (
  <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
    <div className="mx-auto flex w-full max-w-8xl items-center gap-2 px-4 py-3 sm:px-6 lg:gap-3">
      <Link
        to={DASHBOARD_PATH}
        className="mr-1 inline-flex shrink-0 items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
      >
        <img src={PEACOCK_LOGO_SRC} alt="" className="h-9 w-9 object-contain" />
        <span className="hidden font-semibold text-slate-900 sm:inline">{PEACOCK_APP_NAME}</span>
      </Link>

      <nav
        aria-label="Library"
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {LIBRARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} end={item.end} className={navLinkClass}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={openSupportChat}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <LifeBuoy className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden lg:inline">Support</span>
      </button>

      {isCloudSyncEnabled() ? (
        <div className="relative flex shrink-0 items-center gap-2">
          {sessionMode === 'cloud' ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-9 w-9 ring-2 ring-peacock-100',
                },
              }}
            />
          ) : sessionMode === 'guest' ? (
            <>
              <SignInButton mode="redirect" forceRedirectUrl={DASHBOARD_PATH}>
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="redirect" forceRedirectUrl={DASHBOARD_PATH}>
                <button
                  type="button"
                  className="rounded-lg bg-peacock-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-peacock-700"
                >
                  Sign up
                </button>
              </SignUpButton>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  </header>
  );
};
