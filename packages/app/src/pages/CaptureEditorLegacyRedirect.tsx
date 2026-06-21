import { Navigate, useParams } from 'react-router-dom';
import { DASHBOARD_PATH } from '@/constants/routes';

/** Old extension builds opened /editor/capture/... because VITE_APP_URL includes /editor. */
export const CaptureEditorLegacyRedirect = () => {
  const { captureId } = useParams<{ captureId: string }>();
  if (!captureId) return <Navigate to={DASHBOARD_PATH} replace />;
  return <Navigate to={`/capture/${captureId}/edit`} replace />;
};
