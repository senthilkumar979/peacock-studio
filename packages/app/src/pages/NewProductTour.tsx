import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { createAndSaveProductTourOnce } from '@/services/productTourLibraryService';

export const NewProductTour = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    void createAndSaveProductTourOnce()
      .then((tour) => {
        if (cancelled) return;
        navigate(`/tours/${tour.id}/edit`, { replace: true });
      })
      .catch(() => {
        if (cancelled) return;
        navigate('/', { replace: true });
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
