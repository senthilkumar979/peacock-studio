import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';

interface SolutionsNavProps {
  backHref?: string;
  backLabel?: string;
}

export const SolutionsNav = ({
  backHref = '/landing',
  backLabel = 'Home',
}: SolutionsNavProps) => (
  <header className="sticky top-0 z-50 border-b border-white/10 bg-peacock-900/95 backdrop-blur-xl">
    <nav
      className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
      aria-label="Solutions navigation"
    >
      <div className="flex items-center gap-4">
        <Link
          to="/landing"
          className="inline-flex items-center gap-2.5 rounded-lg outline-none ring-peacock-500 focus-visible:ring-2"
        >
          <img src={PEACOCK_LOGO_SRC} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          <span className="text-sm font-semibold text-white">{PEACOCK_APP_NAME}</span>
        </Link>
        <span className="hidden text-slate-600 sm:inline" aria-hidden>
          /
        </span>
        <Link
          to="/solutions"
          className="hidden text-sm font-medium text-slate-300 transition hover:text-white sm:inline"
        >
          Solutions
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-slate-300 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-peacock-800 shadow-sm transition hover:bg-slate-100"
        >
          Open App
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </nav>
  </header>
);
