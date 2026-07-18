import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { DASHBOARD_PATH } from '@/constants/routes';

interface GenericErrorPageProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const GenericErrorPage = ({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again or refresh the page.',
  onRetry,
  compact = false,
}: GenericErrorPageProps) => (
  <div
    className={`flex flex-col items-center justify-center px-6 text-center ${
      compact ? 'py-10' : 'min-h-[50vh] py-16'
    }`}
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
      <AlertTriangle className="h-7 w-7" aria-hidden />
    </div>
    <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">{description}</p>
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-peacock-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-peacock-700"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Try again
        </button>
      ) : (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-peacock-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-peacock-700"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh page
        </button>
      )}
      <Link
        to={DASHBOARD_PATH}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <Home className="h-4 w-4" aria-hidden />
        Go to dashboard
      </Link>
    </div>
  </div>
);
