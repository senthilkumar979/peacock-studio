import {
  getPlayableStepRange,
  getPlayableSteps,
  isFlowBranch,
  isFlowStep,
  sortBranchPaths,
} from '@peacock/shared';
import type { ProductTour, TourDemoRef, TourLearnerSegment } from '@/types/productTour';
import { sortTourFeatures } from '@/utils/createProductTour';
import { getFlowDocument } from '@/services/flowLibraryService';

const SECONDS_PER_STEP = 30;

export interface DemoBranchMeta {
  id: string;
  title: string;
  pathCount: number;
  paths: Array<{
    id: string;
    label: string;
    targetDocumentId: string;
    fromStepId: string;
    toStepId: string;
  }>;
}

export interface DemoPlaybackMeta {
  documentTitle: string;
  stepCount: number;
  branchCount: number;
  branches: DemoBranchMeta[];
  timeline: Array<
    | { type: 'step'; stepIndex: number }
    | { type: 'branch'; branchIndex: number }
  >;
}

export function getTourDemoDisplayTitle(
  demo: Pick<TourDemoRef, 'label'>,
  meta: Pick<DemoPlaybackMeta, 'documentTitle'> | undefined,
  demoIndex: number,
): string {
  const documentTitle = meta?.documentTitle.trim();
  if (documentTitle) return documentTitle;

  const label = demo.label?.trim();
  if (label) return label;

  return `Demo ${demoIndex + 1}`;
}

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

export async function buildTourDemoMeta(tour: ProductTour): Promise<DemoPlaybackMeta[][]> {
  const meta: DemoPlaybackMeta[][] = [];

  for (const feature of sortTourFeatures(tour.features)) {
    const featureMeta: DemoPlaybackMeta[] = [];
    for (const demo of feature.demos) {
      const doc = await getFlowDocument(demo.documentId);
      if (!doc) {
        featureMeta.push({
          documentTitle: 'Missing demo',
          stepCount: 0,
          branchCount: 0,
          branches: [],
          timeline: [],
        });
        continue;
      }

      const branches: DemoBranchMeta[] = [];
      const timeline: DemoPlaybackMeta['timeline'] = [];
      let stepIndex = 0;

      for (const item of doc.steps) {
        if (isFlowBranch(item)) {
          const branchIndex = branches.length;
          branches.push({
            id: item.id,
            title: item.title,
            pathCount: item.paths.length,
            paths: sortBranchPaths(item.paths).map((path) => ({
              id: path.id,
              label: path.label,
              targetDocumentId: path.targetDocumentId,
              fromStepId: path.fromStepId,
              toStepId: path.toStepId,
            })),
          });
          timeline.push({ type: 'branch', branchIndex });
          continue;
        }
        if (isFlowStep(item)) {
          timeline.push({ type: 'step', stepIndex });
          stepIndex += 1;
        }
      }

      featureMeta.push({
        documentTitle: doc.flow.flow.title.trim() || 'Untitled flow',
        stepCount: getPlayableSteps(doc.steps).length,
        branchCount: branches.length,
        branches,
        timeline,
      });
    }
    meta.push(featureMeta);
  }

  return meta;
}

export async function buildTourStepCounts(tour: ProductTour): Promise<number[][]> {
  const meta = await buildTourDemoMeta(tour);
  const counts: number[][] = meta.map((featureMeta) =>
    featureMeta.map((demoMeta) => demoMeta.stepCount),
  );
  return counts;
}

export function buildTourLearnerSegments(demoMeta: DemoPlaybackMeta[][]): TourLearnerSegment[] {
  const segments: TourLearnerSegment[] = [{ type: 'persona-intro' }, { type: 'tour-details' }];

  if (!demoMeta.length) {
    segments.push({ type: 'complete' });
    return segments;
  }

  demoMeta.forEach((featureDemos, featureIndex) => {
    segments.push({ type: 'feature-intro', featureIndex });

    featureDemos.forEach((meta, demoIndex) => {
      segments.push({ type: 'demo-intro', featureIndex, demoIndex });
      meta.timeline.forEach((item) => {
        if (item.type === 'branch') {
          segments.push({
            type: 'demo-branch',
            featureIndex,
            demoIndex,
            branchIndex: item.branchIndex,
          });
          return;
        }
        segments.push({
          type: 'demo-step',
          featureIndex,
          demoIndex,
          stepIndex: item.stepIndex,
        });
      });
    });
  });

  segments.push({ type: 'complete' });
  return segments;
}

export function findFeatureIntroSegmentIndex(
  segments: TourLearnerSegment[],
  featureIndex: number,
): number {
  return segments.findIndex(
    (segment) => segment.type === 'feature-intro' && segment.featureIndex === featureIndex,
  );
}

export function findDemoIntroSegmentIndex(
  segments: TourLearnerSegment[],
  featureIndex: number,
  demoIndex: number,
): number {
  return segments.findIndex(
    (segment) =>
      segment.type === 'demo-intro' &&
      segment.featureIndex === featureIndex &&
      segment.demoIndex === demoIndex,
  );
}

export function countTourStepsFromCounts(stepCounts: number[][]): number {
  return stepCounts.reduce(
    (total, feature) => total + feature.reduce((sum, count) => sum + count, 0),
    0,
  );
}
