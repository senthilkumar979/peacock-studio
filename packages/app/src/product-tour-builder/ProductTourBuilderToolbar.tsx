import { Link } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { HintAnchor, type PageHintControl } from '@/components/onboarding/HintAnchor';
import { PRODUCT_TOUR_HINT_IDS } from '@/constants/firstTimeHints';
import { useProductTourBuilderStore } from '@/store/productTourBuilderStore';
import type { ProductTourStatus } from '@/types/productTour';

interface ProductTourBuilderToolbarProps {
  tourId: string;
  pageHints?: PageHintControl;
}

export const ProductTourBuilderToolbar = ({
  tourId,
  pageHints,
}: ProductTourBuilderToolbarProps) => {
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
      <HintAnchor
        hints={pageHints}
        hintId={PRODUCT_TOUR_HINT_IDS.status}
        title="Draft or Live"
        description="Keep tours in Draft while building. Set to Live when ready to share — you'll need a tour goal first."
        placement="bottom"
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
      </HintAnchor>
      <HintAnchor
        hints={pageHints}
        hintId={PRODUCT_TOUR_HINT_IDS.preview}
        title="Preview tour"
        description="Walk through the tour as a learner before publishing. Check pacing, persona intro, and demo flow."
        placement="bottom"
      >
        <Link
          to={`/tours/${tourId}`}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Preview tour
        </Link>
      </HintAnchor>
    </AppHeader>
  );
};
