import { getPlayableSteps } from '@peacock/shared';
import type { ProductTour, TourLearnerSegment } from '@/types/productTour';
import { sortTourFeatures } from '@/utils/createProductTour';
import { getFlowDocument } from '@/services/flowLibraryService';

const SECONDS_PER_STEP = 30;

export async function estimateTourDurationMinutes(tour: ProductTour): Promise<number | null> {
  let totalSteps = 0;
  let hasDemos = false;

  for (const feature of sortTourFeatures(tour.features)) {
    for (const demo of feature.demos) {
      hasDemos = true;
      const doc = await getFlowDocument(demo.documentId);
      if (doc) totalSteps += getPlayableSteps(doc.steps).length;
    }
  }

  if (!hasDemos) return null;
  return Math.max(1, Math.ceil((totalSteps * SECONDS_PER_STEP) / 60));
}

export async function buildTourStepCounts(tour: ProductTour): Promise<number[][]> {
  const counts: number[][] = [];

  for (const feature of sortTourFeatures(tour.features)) {
    const featureCounts: number[] = [];
    for (const demo of feature.demos) {
      const doc = await getFlowDocument(demo.documentId);
      featureCounts.push(doc ? getPlayableSteps(doc.steps).length : 0);
    }
    counts.push(featureCounts);
  }

  return counts;
}

export function buildTourLearnerSegments(stepCounts: number[][]): TourLearnerSegment[] {
  const segments: TourLearnerSegment[] = [{ type: 'persona-intro' }, { type: 'tour-details' }];

  if (!stepCounts.length) {
    segments.push({ type: 'complete' });
    return segments;
  }

  stepCounts.forEach((featureDemos, featureIndex) => {
    segments.push({ type: 'feature-intro', featureIndex });

    featureDemos.forEach((stepCount, demoIndex) => {
      segments.push({ type: 'demo-intro', featureIndex, demoIndex });
      for (let stepIndex = 0; stepIndex < stepCount; stepIndex += 1) {
        segments.push({ type: 'demo-step', featureIndex, demoIndex, stepIndex });
      }
    });
  });

  segments.push({ type: 'complete' });
  return segments;
}

export function countTourStepsFromCounts(stepCounts: number[][]): number {
  return stepCounts.reduce(
    (total, feature) => total + feature.reduce((sum, count) => sum + count, 0),
    0,
  );
}
