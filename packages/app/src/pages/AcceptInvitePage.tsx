import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { SignInButton, SignUpButton } from '@clerk/react';
import { refreshCloudMemberships } from '@/components/auth/CloudSyncProvider';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { acceptOrganizationInvitation } from '@/cloud/repositories/organizationRepository';
import {
  ACCEPT_INVITE_PATH,
  DASHBOARD_PATH,
  LANDING_PATH,
  WORKSPACE_ONBOARDING_PATH,
} from '@/constants/routes';
import { useSessionMode } from '@/hooks/useSessionMode';
import { GENERIC_USER_ERROR_MESSAGE, logAppError } from '@/utils/appError';

export const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const navigate = useNavigate();
  const sessionMode = useSessionMode();
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  const returnUrl = token
    ? `${ACCEPT_INVITE_PATH}?token=${encodeURIComponent(token)}`
    : ACCEPT_INVITE_PATH;

  useEffect(() => {
    if (!token) return;
    if (sessionMode !== 'cloud' && sessionMode !== 'onboarding') return;

    let cancelled = false;
    const accept = async () => {
      setAccepting(true);
      setError(null);
      try {
        const orgId = await acceptOrganizationInvitation(token);
        if (cancelled) return;
        await refreshCloudMemberships(orgId);
        navigate(DASHBOARD_PATH, { replace: true });
      } catch (err) {
        logAppError('Failed to accept invite', err);
        if (!cancelled) {
          setError(
            err instanceof Error && err.message
              ? err.message
              : GENERIC_USER_ERROR_MESSAGE,
          );
          setAccepting(false);
        }
      }
    };
    void accept();
    return () => {
      cancelled = true;
    };
  }, [token, sessionMode, navigate]);

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
        <p className="text-slate-700">This invite link is missing a token.</p>
        <Link to={LANDING_PATH} className="mt-4 text-sm font-semibold text-peacock-700">
          Go home
        </Link>
      </div>
    );
  }

  if (sessionMode === 'loading' || sessionMode === 'connecting' || accepting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <PeacockStudioLoader size={96} />
        <p className="text-sm text-slate-600">Joining workspace…</p>
        {error ? (
          <div className="mt-4 max-w-md space-y-3 text-center">
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            <Link to={WORKSPACE_ONBOARDING_PATH} className="text-sm font-semibold text-peacock-700">
              Continue to workspace setup
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  if (sessionMode === 'guest') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">
        <h1 className="text-2xl font-bold text-slate-900">You&apos;re invited</h1>
        <p className="mt-2 max-w-md text-center text-sm text-slate-600">
          Sign in or create an account with the invited email to join this organization.
        </p>
        <div className="mt-6 flex gap-3">
          <SignInButton mode="redirect" forceRedirectUrl={returnUrl}>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="redirect" forceRedirectUrl={returnUrl}>
            <button
              type="button"
              className="rounded-xl bg-peacock-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              Sign up
            </button>
          </SignUpButton>
        </div>
      </div>
    );
  }

  if (sessionMode === 'cloud' && error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-6">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        <Link to={DASHBOARD_PATH} className="text-sm font-semibold text-peacock-700">
          Go to dashboard
        </Link>
      </div>
    );
  }

  return <Navigate to={DASHBOARD_PATH} replace />;
};
