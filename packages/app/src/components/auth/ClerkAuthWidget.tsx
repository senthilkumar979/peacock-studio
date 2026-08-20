import { useEffect, useState } from 'react';
import { ClerkFailed, ClerkLoaded, ClerkLoading } from '@clerk/react';

interface ClerkAuthWidgetProps {
  children: React.ReactNode;
  /** Shown while Clerk.js is downloading / initializing. */
  loadingLabel?: string;
}

const LOAD_TIMEOUT_MS = 12_000;

const shellClass =
  'w-full max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm';

const AuthLoadError = () => (
  <div className={shellClass} role="alert">
    <h2 className="text-lg font-semibold text-slate-900">Sign-in failed to load</h2>
    <p className="mt-2 text-sm text-slate-600">
      Clerk could not reach its servers from this browser (clerk.peacockstudio.app). Company
      networks often block auth providers — same issue as Firebase. Try a personal device or
      home hotspot, or ask IT to allowlist peacockstudio.app, *.clerk.com, and
      clerk.peacockstudio.app. Also disable ad blockers for this site, then retry.
    </p>
    <button
      type="button"
      className="btn-peacock btn-peacock--sm mt-6"
      onClick={() => window.location.reload()}
    >
      Retry
    </button>
  </div>
);

function clerkUiMounted(): boolean {
  return Boolean(document.querySelector('.cl-rootBox, .cl-card, [data-clerk-component]'));
}

export const ClerkAuthWidget = ({
  children,
  loadingLabel = 'Loading sign-in…',
}: ClerkAuthWidgetProps) => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (clerkUiMounted()) return;

    const started = Date.now();
    const id = window.setInterval(() => {
      if (clerkUiMounted()) {
        window.clearInterval(id);
        return;
      }
      if (Date.now() - started >= LOAD_TIMEOUT_MS) {
        setTimedOut(true);
        window.clearInterval(id);
      }
    }, 400);

    return () => window.clearInterval(id);
  }, []);

  if (timedOut) return <AuthLoadError />;

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <ClerkLoading>
        <div className={shellClass} role="status" aria-live="polite">
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-peacock-200 border-t-peacock-700"
            aria-hidden
          />
          <p className="mt-4 text-sm font-medium text-slate-700">{loadingLabel}</p>
          <p className="mt-1 text-xs text-slate-500">Connecting to Clerk…</p>
        </div>
      </ClerkLoading>

      <ClerkFailed>
        <AuthLoadError />
      </ClerkFailed>

      <ClerkLoaded>{children}</ClerkLoaded>
    </div>
  );
};
