import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { DASHBOARD_PATH } from '@/constants/routes';
import { useIsPlatformSuperAdmin } from '@/hooks/useIsPlatformSuperAdmin';
import { useSessionMode } from '@/hooks/useSessionMode';

interface RequirePlatformSuperAdminProps {
  children: ReactNode;
}

/** Renders children only for platform super admins; others go to the dashboard. */
export const RequirePlatformSuperAdmin = ({
  children,
}: RequirePlatformSuperAdminProps) => {
  const sessionMode = useSessionMode();
  const { isPlatformSuperAdmin, isLoading } = useIsPlatformSuperAdmin();

  if (
    sessionMode === 'loading' ||
    sessionMode === 'connecting' ||
    isLoading
  ) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <PeacockStudioLoader size={96} />
      </div>
    );
  }

  if (sessionMode !== 'cloud' || !isPlatformSuperAdmin) {
    return <Navigate to={DASHBOARD_PATH} replace />;
  }

  return children;
};
