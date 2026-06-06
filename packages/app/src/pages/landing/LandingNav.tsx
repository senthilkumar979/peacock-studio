import { Link } from 'react-router-dom';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';

export const LandingNav = () => (
  <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
    <nav
      className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
      aria-label="Main navigation"
    >
      <Link to="/landing" className="inline-flex items-center gap-2.5 rounded-lg outline-none ring-peacock-500 focus-visible:ring-2">
        <img src={PEACOCK_LOGO_SRC} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
        <span className="text-sm font-semibold text-white">{PEACOCK_APP_NAME}</span>
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        <a href="#features" className="text-sm text-slate-300 transition hover:text-white">
          Features
        </a>
        <a href="#workflow" className="text-sm text-slate-300 transition hover:text-white">
          Workflow
        </a>
        <a href="#architecture" className="text-sm text-slate-300 transition hover:text-white">
          Architecture
        </a>
        <a href="#faq" className="text-sm text-slate-300 transition hover:text-white">
          FAQ
        </a>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="hidden rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition hover:text-white sm:inline-flex"
        >
          Dashboard
        </Link>
        <Link
          to="/editor"
          className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-peacock-800 shadow-sm transition hover:bg-slate-100"
        >
          Open App
        </Link>
      </div>
    </nav>
  </header>
);
