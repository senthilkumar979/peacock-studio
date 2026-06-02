import { Navigate, useParams } from 'react-router-dom';

export const LegacyRouteRedirect = ({ mode }: { mode: 'edit' | 'view' | 'new' }) => {
  const { routeId } = useParams<{ routeId: string }>();

  if (mode === 'new') return <Navigate to="/tours/new" replace />;
  if (!routeId) return <Navigate to="/" replace />;

  return <Navigate to={mode === 'edit' ? `/tours/${routeId}/edit` : `/tours/${routeId}`} replace />;
};
