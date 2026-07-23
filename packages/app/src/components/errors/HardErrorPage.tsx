import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { trackEvent } from '@/analytics/analyticsClient';
import { AnalyticsEvents } from '@/analytics/events';
import { DASHBOARD_PATH, LANDING_PATH } from '@/constants/routes';

export interface HardErrorPageProps {
  title?: string;
  description?: string;
  /** Technical detail shown in a collapsible for support (optional). */
  detail?: string | null;
  onRetry?: () => void;
  /** Prefer dashboard when signed-in app routes; landing otherwise. */
  homePath?: string;
  homeLabel?: string;
  compact?: boolean;
}

export const HardErrorPage = ({
  title = 'Something went wrong',
  description = 'An unexpected error stopped this page. You can try again or return to your library.',
  detail = null,
  onRetry,
  homePath = DASHBOARD_PATH,
  homeLabel = 'Go to dashboard',
  compact = false,
}: HardErrorPageProps) => {
  useEffect(() => {
    trackEvent(AnalyticsEvents.hardErrorViewed, {
      title,
      home_path: homePath,
      compact: Boolean(compact),
      has_detail: Boolean(detail),
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    });
  }, [title, homePath, compact, detail]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden px-6 text-center ${
        compact ? 'py-10' : 'min-h-screen py-16'
      }`}
    >
      {!compact ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-100"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-rose-200/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-peacock-200/25 blur-3xl"
          />
        </>
      ) : null}

      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>

        {detail ? (
          <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left">
            <summary className="cursor-pointer text-xs font-semibold text-slate-500">
              Technical details
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-[11px] text-slate-600">
              {detail}
            </pre>
          </details>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-peacock-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-peacock-600/20 transition hover:bg-peacock-700"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Try again
            </button>
          ) : (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl bg-peacock-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-peacock-600/20 transition hover:bg-peacock-700"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Refresh page
            </button>
          )}
          <Link
            to={homePath}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Home className="h-4 w-4" aria-hidden />
            {homeLabel}
          </Link>
        </div>

        <p className="mt-5 text-xs text-slate-400">
          Prefer to start over?{' '}
          <Link to={LANDING_PATH} className="font-medium text-peacock-700 hover:text-peacock-800">
            Go to home
          </Link>
        </p>
      </div>
    </div>
  );
};
