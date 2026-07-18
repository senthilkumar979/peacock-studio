import { Link } from 'react-router-dom';
import { SignInButton, SignUpButton, UserButton } from '@clerk/react';
import { isCloudSyncEnabled } from '@/cloud/config';
import { CloudSignInCallout } from '@/components/auth/CloudSignInCallout';
import { useSessionMode } from '@/hooks/useSessionMode';

interface CloudAuthActionsProps {
  variant?: 'hero' | 'callout' | 'compact';
  title?: string;
  message?: string;
}

const heroSignInClass =
  'rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20';

const heroSignUpClass =
  'rounded-lg bg-white px-4 py-2 text-sm font-semibold text-peacock-800 shadow-sm transition hover:bg-slate-100';

export const CloudAuthActions = ({
  variant = 'hero',
  title,
  message,
}: CloudAuthActionsProps) => {
  const sessionMode = useSessionMode();

  if (!isCloudSyncEnabled()) {
    if (variant !== 'callout') return null;
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
        Cloud sync is not enabled for this environment. Set{' '}
        <code className="rounded bg-slate-200 px-1 py-0.5 text-xs">VITE_CLOUD_SYNC=true</code>{' '}
        and configure Clerk + Supabase to generate workflow outputs.
      </div>
    );
  }

  if (sessionMode === 'cloud') {
    if (variant !== 'hero') return null;
    return (
      <div className="absolute right-6 top-6 z-10">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-9 w-9 ring-2 ring-white/30',
            },
          }}
        />
      </div>
    );
  }

  if (sessionMode === 'loading' || sessionMode === 'connecting') {
    if (variant !== 'callout') return null;
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
        {sessionMode === 'connecting'
          ? 'Finishing cloud library setup…'
          : 'Checking sign-in status…'}
      </div>
    );
  }

  if (sessionMode === 'local') {
    if (variant !== 'callout') return null;
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
        Cloud sync is not enabled for this environment.
      </div>
    );
  }

  const defaultMessage =
    'Sign in to sync your library and generate workflow outputs on demand.';

  if (variant === 'hero') {
    return (
      <div className="absolute right-6 top-6 z-10 flex flex-wrap items-center justify-end gap-2">
        <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
          <button type="button" className={heroSignInClass}>
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
          <button type="button" className={heroSignUpClass}>
            Sign up
          </button>
        </SignUpButton>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <p className="text-sm text-slate-600">
        {message ?? defaultMessage}{' '}
        <Link to="/sign-up" className="font-semibold text-peacock-700 hover:text-peacock-800">
          Sign up
        </Link>{' '}
        or{' '}
        <Link to="/sign-in" className="font-semibold text-peacock-700 hover:text-peacock-800">
          sign in
        </Link>
        .
      </p>
    );
  }

  return (
    <CloudSignInCallout title={title} message={message ?? defaultMessage} />
  );
};
