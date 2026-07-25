import { Navigate } from 'react-router-dom';
import { getSuperAdminPath } from '@/constants/routes';

/** Legacy route — redirects into Super Admin → Health. */
export const HealthCheckerPage = () => (
  <Navigate to={getSuperAdminPath('health')} replace />
);
