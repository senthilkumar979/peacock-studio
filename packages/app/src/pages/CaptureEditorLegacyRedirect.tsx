import { Navigate, useParams } from 'react-router-dom';

/** Old extension builds opened /editor/capture/... because VITE_APP_URL includes /editor. */
export const CaptureEditorLegacyRedirect = () => {
  const { captureId } = useParams<{ captureId: string }>();
  if (!captureId) return <Navigate to="/" replace />;
  return <Navigate to={`/capture/${captureId}/edit`} replace />;
};
