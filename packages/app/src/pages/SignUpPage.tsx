import { SignUp } from '@clerk/react';
import { Link, useLocation } from 'react-router-dom';
import { ClerkAuthWidget } from '@/components/auth/ClerkAuthWidget';
import { CloudAuthConfigError } from '@/components/auth/CloudAuthConfigError';
import {
  getClerkPublishableKey,
  getCloudSyncMissingConfigMessage,
} from '@/cloud/config';
import { DASHBOARD_PATH, LANDING_PATH } from '@/constants/routes';

export const SignUpPage = () => {
  const location = useLocation();
  const redirectUrl =
    (location.state as { from?: string } | null)?.from ?? DASHBOARD_PATH;
  const configError = getCloudSyncMissingConfigMessage();
  const clerkKey = getClerkPublishableKey();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <div className="mb-8 text-center">
        <Link to={LANDING_PATH} className="text-sm font-semibold text-peacock-700 hover:text-peacock-800">
          ← Back to Peacock Studio
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Create your Peacock account</h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Free tier includes cloud sync for your workflow library.
        </p>
      </div>

      {configError || !clerkKey ? (
        <CloudAuthConfigError
          title="Cloud sign-up is not configured"
          message={
            configError ??
            'VITE_CLERK_PUBLISHABLE_KEY is missing from this build. Add the publishable key in Vercel and redeploy.'
          }
        />
      ) : (
        <ClerkAuthWidget loadingLabel="Loading sign-up…">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl={redirectUrl}
          />
        </ClerkAuthWidget>
      )}
    </div>
  );
};
