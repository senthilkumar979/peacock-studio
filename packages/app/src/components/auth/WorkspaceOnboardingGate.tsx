import { Navigate, useLocation } from 'react-router-dom';
import { isCloudSyncEnabled } from '@/cloud/config';
import {
  ACCEPT_INVITE_PATH,
  DASHBOARD_PATH,
  WORKSPACE_ONBOARDING_PATH,
} from '@/constants/routes';
import { useSessionMode } from '@/hooks/useSessionMode';

interface WorkspaceOnboardingGateProps {
  children: React.ReactNode;
}

/**
 * Redirects only after memberships are resolved and the user has none.
 * Stays put while sessionMode is connecting/loading so refresh never flashes the chooser.
 */
export const WorkspaceOnboardingGate = ({ children }: WorkspaceOnboardingGateProps) => {
  const sessionMode = useSessionMode();
  const location = useLocation();

  const path = location.pathname;
  const isOnboardingRoute =
    path.startsWith(WORKSPACE_ONBOARDING_PATH) || path.startsWith(ACCEPT_INVITE_PATH);

  if (!isCloudSyncEnabled()) return children;

  if (sessionMode === 'onboarding' && !isOnboardingRoute) {
    return <Navigate to={WORKSPACE_ONBOARDING_PATH} replace />;
  }

  if (sessionMode === 'cloud' && isOnboardingRoute && path.startsWith(WORKSPACE_ONBOARDING_PATH)) {
    return <Navigate to={DASHBOARD_PATH} replace />;
  }

  return children;
};
