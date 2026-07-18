import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { listFlowSummaries } from '@/storage/libraryRouter';
import { getGuestVisibleDocLimit } from '@/cloud/planLimits';
import { isGuestVisibleDocumentId } from '@/utils/guestDocumentVisibility';
import { useIsGuestSession } from '@/hooks/useSessionMode';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';

interface GuestDocumentGateProps {
  documentId: string;
  children: React.ReactNode;
}

export const GuestDocumentGate = ({ documentId, children }: GuestDocumentGateProps) => {
  const location = useLocation();
  const isGuest = useIsGuestSession();
  const authRedirectState = { from: location.pathname + location.search };
  const [isChecking, setIsChecking] = useState(isGuest);
  const [isAllowed, setIsAllowed] = useState(!isGuest);

  useEffect(() => {
    if (!isGuest) {
      setIsAllowed(true);
      setIsChecking(false);
      return;
    }

    let cancelled = false;
    setIsChecking(true);

    void listFlowSummaries().then((summaries) => {
      if (cancelled) return;
      const limit = getGuestVisibleDocLimit();
      setIsAllowed(isGuestVisibleDocumentId(documentId, summaries, limit));
      setIsChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [documentId, isGuest]);

  if (!isGuest) return children;

  if (isChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={120} />
        <p className="text-sm text-slate-500">Checking access…</p>
      </div>
    );
  }

  if (isAllowed) return children;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <h1 className="text-xl font-bold text-slate-900">Sign in to open this documentation</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          This recording is saved on this device but isn&apos;t in your free preview set. Create a
          free account to unlock your full local library and sync to the cloud.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link to="/sign-up" state={authRedirectState} className="btn-peacock">
            Sign up free
          </Link>
          <Link
            to="/sign-in"
            state={authRedirectState}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
