import { useAuth } from '@clerk/react';
import { Navigate, useLocation } from 'react-router-dom';
import { isCloudSyncEnabled } from '@/cloud/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const CloudProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking sign-in…
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!isCloudSyncEnabled()) {
    return children;
  }

  return <CloudProtectedRoute>{children}</CloudProtectedRoute>;
};
