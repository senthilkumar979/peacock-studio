import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Cloud, Sparkles } from 'lucide-react';

interface CloudSignInCalloutProps {
  title?: string;
  message: string;
}

const DEFAULT_BENEFITS = [
  'Sync flows and tours across devices',
  'Generate test cases, Playwright specs, and flow maps on demand',
] as const;

export const CloudSignInCallout = ({
  title = 'Cloud account required',
  message,
}: CloudSignInCalloutProps) => {
  const location = useLocation();
  const returnPath = location.pathname;

  return (
  <div
    role="status"
    className="relative overflow-hidden rounded-2xl border border-peacock-200/80 bg-gradient-to-br from-peacock-50/90 via-white to-brand-violet/5 shadow-md shadow-peacock-100/50 ring-1 ring-peacock-100/80"
  >
    <div
      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-peacock-200/30 blur-3xl"
      aria-hidden
    />
    <div
      className="pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-brand-violet/10 blur-3xl"
      aria-hidden
    />

    <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex min-w-0 gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-peacock-600 to-peacock-800 text-white shadow-lg shadow-peacock-500/25 ring-1 ring-peacock-700/20">
          <Cloud className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-peacock-700">
            {title}
          </p>
          <p className="mt-1.5 text-base font-bold tracking-tight text-slate-900">{message}</p>
          <ul className="mt-3 space-y-1.5">
            {DEFAULT_BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 text-sm leading-relaxed text-slate-600"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-peacock-500" aria-hidden />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2.5 sm:min-w-[11rem] sm:items-stretch">
        <Link
          to="/sign-up"
          state={{ from: returnPath }}
          className="btn-peacock inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm shadow-md shadow-peacock-500/20"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Sign up free
          <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
        </Link>
        <Link
          to="/sign-in"
          state={{ from: returnPath }}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-peacock-200 hover:bg-peacock-50/50 hover:text-peacock-800"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  </div>
  );
};
