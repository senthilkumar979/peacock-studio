import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface EmbedErrorPanelProps {
  title?: string;
  description?: string;
  detail?: string | null;
  onRetry?: () => void;
}

/** Minimal error UI for iframe embeds — refresh only, no app navigation. */
export const EmbedErrorPanel = ({
  title = 'This guide is unavailable',
  description = 'The embedded guide could not be loaded. Try refreshing the page.',
  detail = null,
  onRetry,
}: EmbedErrorPanelProps) => (
  <div className="flex h-dvh flex-col items-center justify-center bg-slate-50 px-6 py-10 text-center">
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="mt-4 text-lg font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>

      {detail ? (
        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left">
          <summary className="cursor-pointer text-xs font-semibold text-slate-500">
            Technical details
          </summary>
          <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words text-[11px] text-slate-600">
            {detail}
          </pre>
        </details>
      ) : null}

      <div className="mt-5">
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
      </div>
    </div>
  </div>
);
