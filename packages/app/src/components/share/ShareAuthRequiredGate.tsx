import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { LANDING_PATH } from '@/constants/routes';

interface ShareAuthRequiredGateProps {
  returnPath: string;
}

export const ShareAuthRequiredGate = ({ returnPath }: ShareAuthRequiredGateProps) => (
  <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-100"
    />
    <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-peacock-50 text-peacock-700 ring-1 ring-peacock-100">
        <Lock className="h-7 w-7" aria-hidden />
      </div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Sign in required</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        This share link requires a signed-in Peacock account before content can load.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/sign-in"
          state={{ from: returnPath }}
          className="inline-flex items-center gap-2 rounded-xl bg-peacock-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-peacock-600/20 transition hover:bg-peacock-700"
        >
          Sign in to view
        </Link>
        <Link
          to="/sign-up"
          state={{ from: returnPath }}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Sign up
        </Link>
        <Link
          to={LANDING_PATH}
          className="inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          Go home
        </Link>
      </div>
    </div>
  </div>
);
