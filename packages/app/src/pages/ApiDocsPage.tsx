import { Navigate } from 'react-router-dom';
import { getSuperAdminPath } from '@/constants/routes';

/** Legacy route — redirects into Super Admin → API. */
export const ApiDocsPage = () => (
  <Navigate to={getSuperAdminPath('api')} replace />
);
