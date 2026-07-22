import type { LucideIcon } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LifeBuoy, Settings2 } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/react";
import { SignedInUserButton } from "@/components/auth/SignedInUserButton";
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from "@/constants/branding";
import { isCloudSyncEnabled } from "@/cloud/config";
import { LIBRARY_NAV_ITEMS } from "@/constants/libraryNav";
import { DASHBOARD_PATH, ORG_ADMIN_PATH } from "@/constants/routes";
import { OrgSwitcher } from "@/components/library/OrgSwitcher";
import { useActiveOrganization } from "@/hooks/useOrganization";
import { useSessionMode } from "@/hooks/useSessionMode";
import { openSupportChat } from "@/utils/support";

interface LibraryNavLinkProps {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const LibraryNavLink = ({
  to,
  label,
  icon: Icon,
  end,
}: LibraryNavLinkProps) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `relative inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        isActive
          ? "bg-white text-peacock-700 shadow-sm ring-1 ring-slate-200/80"
          : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          className={`h-4 w-4 shrink-0 ${isActive ? "text-peacock-600" : "text-slate-400"}`}
          aria-hidden
        />
        <span className="whitespace-nowrap">{label}</span>
        {isActive ? (
          <motion.span
            layoutId="library-nav-underline"
            className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-peacock-500 to-brand-cyan"
          />
        ) : null}
      </>
    )}
  </NavLink>
);

export const LibraryNav = () => {
  const sessionMode = useSessionMode();
  const { isAdmin } = useActiveOrganization();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-peacock-300/50 to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-8xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          to={DASHBOARD_PATH}
          className="group inline-flex shrink-0 items-center gap-2.5 rounded-xl outline-none ring-peacock-500 focus-visible:ring-2"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-peacock-500 to-peacock-700 p-1.5 shadow-md shadow-peacock-500/20 ring-1 ring-peacock-600/10 transition-shadow group-hover:shadow-lg group-hover:shadow-peacock-500/25">
            <img
              src={PEACOCK_LOGO_SRC}
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
            />
          </span>
          <span className="hidden text-sm font-semibold tracking-tight text-slate-900 sm:inline">
            {PEACOCK_APP_NAME}
          </span>
        </Link>

        <nav
          aria-label="Library"
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-2xl bg-slate-100/90 p-1 ring-1 ring-inset ring-slate-200/70 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {LIBRARY_NAV_ITEMS.map((item) => (
            <LibraryNavLink
              key={item.path}
              to={item.path}
              label={item.label}
              icon={item.icon}
              end={item.end}
            />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 border-l border-slate-200/80 pl-2 sm:pl-3">
          {sessionMode === "cloud" ? <OrgSwitcher /> : null}

          {sessionMode === "cloud" && isAdmin ? (
            <Link
              to={ORG_ADMIN_PATH}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <Settings2
                className="h-4 w-4 shrink-0 text-slate-500"
                aria-hidden
              />
              <span className="hidden lg:inline">Admin</span>
            </Link>
          ) : null}

          {/* <button
            type="button"
            onClick={openSupportChat}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <LifeBuoy className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            <span className="hidden lg:inline">Support</span>
          </button> */}

          {isCloudSyncEnabled() ? (
            <div className="flex shrink-0 items-center gap-2">
              {sessionMode === "cloud" ? (
                <SignedInUserButton avatarClassName="h-9 w-9 ring-2 ring-peacock-100" />
              ) : sessionMode === "guest" ? (
                <>
                  <SignInButton
                    mode="redirect"
                    forceRedirectUrl={DASHBOARD_PATH}
                  >
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton
                    mode="redirect"
                    forceRedirectUrl={DASHBOARD_PATH}
                  >
                    <button
                      type="button"
                      className="rounded-xl bg-peacock-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-peacock-600/20 transition hover:bg-peacock-700"
                    >
                      Sign up
                    </button>
                  </SignUpButton>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
