import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from "@/constants/branding";
import { DASHBOARD_PATH, LANDING_PATH } from "@/constants/routes";
import { useActiveSection } from "@/pages/solutions/useActiveSection";
import { Link } from "react-router-dom";
import { LANDING_SUB_NAV_ITEMS } from "./siteNavData";

interface LandingSubNavProps {
  visible?: boolean;
}

export const LandingSubNav = ({ visible = false }: LandingSubNavProps) => {
  const sectionIds = LANDING_SUB_NAV_ITEMS.map((item) => item.id);
  const activeId = useActiveSection(sectionIds, 120);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl transition duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:gap-6 sm:px-6"
        aria-label="Page sections"
      >
        <Link
          to={LANDING_PATH}
          className="inline-flex shrink-0 items-center gap-2.5 rounded-lg outline-none ring-peacock-500 focus-visible:ring-2"
        >
          <img
            src={PEACOCK_LOGO_SRC}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
          <span className="hidden text-sm font-semibold text-slate-900 sm:inline">
            {PEACOCK_APP_NAME}
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto sm:gap-2">
          {LANDING_SUB_NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-peacock-100 text-peacock-800 ring-peacock-500 "
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <Link
          to={DASHBOARD_PATH}
          className="rounded-lg bg-peacock-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-peacock-600"
        >
          Open App
        </Link>
      </nav>
    </header>
  );
};
