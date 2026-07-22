import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { SignInButton, SignUpButton } from '@clerk/react';
import { refreshCloudMemberships } from '@/components/auth/CloudSyncProvider';
import { HardErrorPage } from '@/components/errors/HardErrorPage';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { acceptOrganizationInvitation } from '@/cloud/repositories/organizationRepository';
import {
  ACCEPT_INVITE_PATH,
  DASHBOARD_PATH,
  LANDING_PATH,
  WORKSPACE_ONBOARDING_PATH,
} from '@/constants/routes';
import { useSessionMode } from '@/hooks/useSessionMode';
import { reportAppError } from '@/utils/appError';
import { notifyPromise } from '@/utils/notify';

export const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const navigate = useNavigate();
  const sessionMode = useSessionMode();
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState('Could not join workspace');
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
        const orgId = await notifyPromise(
          acceptOrganizationInvitation(token).then(async (id) => {
            await refreshCloudMemberships(id);
            return id;
          }),
          {
            loading: 'Joining workspace…',
            success: 'You joined the workspace',
            context: 'Accept invite link',
          },
        );
        if (cancelled) return;
        void orgId;
        navigate(DASHBOARD_PATH, { replace: true });
      } catch (err) {
        const classified = reportAppError('Failed to accept invite', err);
        if (!cancelled) {
          setErrorTitle(classified.title);
          setError(classified.userMessage);
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
      <HardErrorPage
        title="Invalid invite link"
        description="This invite link is missing a token. Ask your admin to send a new invitation."
        homePath={LANDING_PATH}
        homeLabel="Go home"
      />
    );
  }

  if (sessionMode === 'loading' || sessionMode === 'connecting' || accepting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <PeacockStudioLoader size={96} />
        <p className="text-sm text-slate-600">Joining workspace…</p>
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

  if (error) {
    return (
      <HardErrorPage
        title={errorTitle}
        description={error}
        homePath={DASHBOARD_PATH}
        homeLabel="Go to dashboard"
        onRetry={() => navigate(WORKSPACE_ONBOARDING_PATH, { replace: true })}
      />
    );
  }

  return <Navigate to={DASHBOARD_PATH} replace />;
};
