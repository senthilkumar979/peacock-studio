import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';
import { AppFooter } from '@/components/AppFooter';
import { SiteNav } from '@/components/site/SiteNav';
import { DASHBOARD_PATH, LANDING_PATH } from '@/constants/routes';
import { getExtensionGatePath } from '@/utils/extensionGate';

/** Branded 404 for unknown marketing/app URLs (replaces silent redirect to landing). */
export const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col bg-slate-50">
    <SiteNav />
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-peacock-50 text-peacock-600 ring-1 ring-peacock-100">
        <SearchX className="h-7 w-7" aria-hidden />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
        That URL does not match a Peacock Studio page. Check the link or head back home.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={LANDING_PATH}
          className="inline-flex items-center gap-2 rounded-xl bg-peacock-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-peacock-800"
        >
          <Home className="h-4 w-4" aria-hidden />
          Home
        </Link>
        <Link
          to={getExtensionGatePath(DASHBOARD_PATH)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Open library
        </Link>
      </div>
    </main>
    <AppFooter />
  </div>
);
