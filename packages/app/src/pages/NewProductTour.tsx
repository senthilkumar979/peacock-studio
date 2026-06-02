import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { createAndSaveProductTour } from '@/services/productTourLibraryService';

export const NewProductTour = () => {
  const navigate = useNavigate();

  useEffect(() => {
    void createAndSaveProductTour()
      .then((tour) => navigate(`/tours/${tour.id}/edit`, { replace: true }))
      .catch(() => navigate('/', { replace: true }));
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <PeacockStudioLoader size={160} />
      <p className="text-sm text-slate-500">Creating product tour…</p>
    </div>
  );
};
