import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_PATH } from '@/constants/routes';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { createAndSaveProductTourOnce } from '@/services/productTourLibraryService';
import { notifyError } from '@/utils/notify';

export const NewProductTour = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    void createAndSaveProductTourOnce()
      .then((tour) => {
        if (cancelled) return;
        navigate(`/tours/${tour.id}/edit`, { replace: true });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        notifyError(error, 'Create product tour');
        navigate(DASHBOARD_PATH, { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <PeacockStudioLoader size={160} />
      <p className="text-sm text-slate-500">Creating product tour…</p>
    </div>
  );
};
