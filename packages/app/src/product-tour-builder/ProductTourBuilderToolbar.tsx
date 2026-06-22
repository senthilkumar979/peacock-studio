import { Link } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { useProductTourBuilderStore } from '@/store/productTourBuilderStore';
import type { ProductTourStatus } from '@/types/productTour';

interface ProductTourBuilderToolbarProps {
  tourId: string;
}

export const ProductTourBuilderToolbar = ({ tourId }: ProductTourBuilderToolbarProps) => {
  const tour = useProductTourBuilderStore((state) => state.tour);
  const setTourStatus = useProductTourBuilderStore((state) => state.setTourStatus);

  if (!tour) return null;

  const handleStatusChange = (nextStatus: ProductTourStatus) => {
    if (nextStatus === 'live' && !tour.tourGoal.trim()) {
      window.alert('Add a tour goal before setting this tour to Live.');
      return;
    }
    setTourStatus(nextStatus);
  };

  return (
    <AppHeader
      eyebrow="Product Tours"
      title={tour.title}
      description={tour.description || undefined}
      homeLink
      tourId={tourId}
      tour={tour}
    >
      <select
        value={tour.status}
        onChange={(event) => handleStatusChange(event.target.value as ProductTourStatus)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
        aria-label="Tour status"
      >
        <option value="draft">Draft</option>
        <option value="live">Live</option>
      </select>
      <Link
        to={`/tours/${tourId}`}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Preview tour
      </Link>
    </AppHeader>
  );
};
