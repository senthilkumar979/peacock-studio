import { useLocation } from 'react-router-dom';
import { SignIn } from '@clerk/react';
import { Link } from 'react-router-dom';
import { DASHBOARD_PATH, LANDING_PATH } from '@/constants/routes';

export const SignInPage = () => {
  const location = useLocation();
  const redirectUrl =
    (location.state as { from?: string } | null)?.from ?? DASHBOARD_PATH;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <div className="mb-8 text-center">
        <Link to={LANDING_PATH} className="text-sm font-semibold text-peacock-700 hover:text-peacock-800">
          ← Back to Peacock Studio
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Sign in to your library</h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Sync flow documents, product tours, and personas across devices.
        </p>
      </div>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl={redirectUrl} />
    </div>
  );
};
