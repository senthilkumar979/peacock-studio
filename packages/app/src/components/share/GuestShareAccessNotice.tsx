import { Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Shown in Share modals for guests: PDF stays available; link + embed need an account.
 */
export const GuestShareAccessNotice = () => {
  const location = useLocation();
  const returnPath = `${location.pathname}${location.search}`;

  return (
    <div
      role="status"
      className="rounded-xl border border-peacock-200 bg-peacock-50/80 px-4 py-3 text-sm text-peacock-950"
    >
      <div className="flex gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-peacock-600" aria-hidden />
        <div className="min-w-0 space-y-2">
          <p>
            <strong className="font-semibold">Share links and embeds need an account.</strong>{' '}
            You can still export a PDF as a guest. Sign up or sign in to sync this library to the
            cloud and unlock public sharing.
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-semibold">
            <Link
              to="/sign-up"
              state={{ from: returnPath }}
              className="text-peacock-700 underline decoration-peacock-300 underline-offset-2 hover:text-peacock-900"
            >
              Sign up free
            </Link>
            <Link
              to="/sign-in"
              state={{ from: returnPath }}
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
