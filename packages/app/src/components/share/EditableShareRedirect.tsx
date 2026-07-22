import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/react';
import { Navigate, useLocation } from 'react-router-dom';
import { resolvePublicShareLink, verifyEditableShareLink } from '@/cloud/publicShareClient';
import { isCloudSyncEnabled } from '@/cloud/config';
import { HardErrorPage } from '@/components/errors/HardErrorPage';
import { useCloudLibraryReady } from '@/hooks/useCloudLibraryReady';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { DASHBOARD_PATH } from '@/constants/routes';
import type { EditableShareVerification } from '@/types/shareLink';
import { reportAppError } from '@/utils/appError';

interface EditableShareRedirectProps {
  token: string;
}

const EditableShareRedirectInner = ({ token }: EditableShareRedirectProps) => {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const { isReady: isCloudReady } = useCloudLibraryReady();
  const [verification, setVerification] = useState<EditableShareVerification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState('Share link error');
  const [isEditableLink, setIsEditableLink] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setIsEditableLink(null);
    setVerification(null);

    void resolvePublicShareLink(token)
      .then((link) => {
        if (cancelled) return;
        if (!link || link.accessMode !== 'editable') {
          setErrorTitle('Edit access unavailable');
          setError('This link does not grant edit access.');
          setIsEditableLink(false);
          return;
        }
        setIsEditableLink(true);
      })
      .catch((resolveError) => {
        if (!cancelled) {
          const classified = reportAppError('Resolve editable share link', resolveError);
          setErrorTitle(classified.title);
          setError(classified.userMessage);
          setIsEditableLink(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!isEditableLink || !isLoaded || !isSignedIn || !isCloudReady) return;

    let cancelled = false;

    void verifyEditableShareLink(token)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setErrorTitle('Permission denied');
          setError('You do not have permission to edit this shared item.');
          return;
        }
        setVerification(result);
      })
      .catch((verifyError) => {
        if (!cancelled) {
          const classified = reportAppError('Verify editable share link', verifyError);
          setErrorTitle(classified.title);
          setError(classified.userMessage);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isCloudReady, isEditableLink, isLoaded, isSignedIn, token]);

  if (isEditableLink === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={120} />
        <p className="text-sm text-slate-500">Loading share link…</p>
      </div>
    );
  }

  if (isEditableLink === false || error) {
    return (
      <HardErrorPage
        title={errorTitle}
        description={error ?? 'This link does not grant edit access.'}
        homePath={DASHBOARD_PATH}
        homeLabel="Go to dashboard"
      />
    );
  }

  if (!isLoaded || !isSignedIn) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  if (!isCloudReady || !verification) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={120} />
        <p className="text-sm text-slate-500">Verifying edit access…</p>
      </div>
    );
  }

  if (verification.resourceType === 'document') {
    return <Navigate to={`/docs/${verification.resourceId}/edit`} replace />;
  }

  return <Navigate to={`/tours/${verification.resourceId}/edit`} replace />;
};

export const EditableShareRedirect = ({ token }: EditableShareRedirectProps) => {
  if (!isCloudSyncEnabled()) {
    return (
      <HardErrorPage
        title="Cloud sync required"
        description="Editable share links require cloud sync to be enabled."
        homePath={DASHBOARD_PATH}
        homeLabel="Go to dashboard"
      />
    );
  }

  return <EditableShareRedirectInner token={token} />;
};
