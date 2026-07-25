import { Navigate } from 'react-router-dom';
import { getSuperAdminPath } from '@/constants/routes';

/** Legacy route — redirects into Super Admin → Platform. */
export const PlatformAdminPage = () => (
  <Navigate to={getSuperAdminPath('platform')} replace />
);
