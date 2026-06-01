import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { createAndSaveRoute } from '@/services/routeLibraryService';

export const NewRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
    void createAndSaveRoute()
      .then((route) => {
        navigate(`/routes/${route.id}/edit`, { replace: true });
      })
      .catch((error) => {
        console.error('[Peacock] Failed to create route', error);
        navigate('/', { replace: true });
      });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <PeacockStudioLoader size={160} />
      <p className="text-sm text-slate-500">Creating route…</p>
    </div>
  );
};
