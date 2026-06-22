import type { ProductTour } from '@/types/productTour';

interface LegacyProductTourRecord {
  tourGoal?: string;
}

export function normalizeProductTour(tour: ProductTour & LegacyProductTourRecord): ProductTour {
  return {
    ...tour,
    tourGoal: tour.tourGoal ?? '',
  };
}
