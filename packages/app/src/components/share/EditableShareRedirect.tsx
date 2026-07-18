import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/react';
import { Navigate, useLocation } from 'react-router-dom';
import { resolvePublicShareLink, verifyEditableShareLink } from '@/cloud/publicShareClient';
import { isCloudSyncEnabled } from '@/cloud/config';
import { useCloudLibraryReady } from '@/hooks/useCloudLibraryReady';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import type { EditableShareVerification } from '@/types/shareLink';

interface EditableShareRedirectProps {
  token: string;
}

const EditableShareRedirectInner = ({ token }: EditableShareRedirectProps) => {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const { isReady: isCloudReady } = useCloudLibraryReady();
  const [verification, setVerification] = useState<EditableShareVerification | null>(null);
  const [error, setError] = useState<string | null>(null);
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
          setError('This link does not grant edit access.');
          setIsEditableLink(false);
          return;
        }
        setIsEditableLink(true);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load this share link.');
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
          setError('You do not have permission to edit this shared item.');
          return;
        }
        setVerification(result);
      })
      .catch((verifyError) => {
        console.error('[Peacock] Failed to verify editable share link', verifyError);
        if (!cancelled) setError('Could not verify edit access.');
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-600">
        {error ?? 'This link does not grant edit access.'}
      </div>
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-600">
        Editable share links require cloud sync to be enabled.
      </div>
    );
  }

  return <EditableShareRedirectInner token={token} />;
};
