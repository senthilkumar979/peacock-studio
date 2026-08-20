import {
  getPlayableStepRange,
  getStepResourcesForStep,
  isFlowBranch,
  isFlowStep,
  resolveStepDescription,
  sortBranchPaths,
  type FlowBranch,
  type FlowOutlineItem,
  type FlowStep,
  type LinkedPeacockPath,
  type StepResource,
} from '@peacock/shared';
import { getFlowDocument } from '@/services/flowLibraryService';
import type { PdfPathSelections } from '@/utils/pdfPathSelection';
import { buildPdfStepContentSlices, type PdfStepContentSlice } from './pdfStepLayout';

export type PdfExportPage =
  | {
      kind: 'step';
      step: FlowStep;
      screenshotUrls: Record<string, string>;
      slice: PdfStepContentSlice;
      resources: StepResource[];
    }
  | { kind: 'branch'; branch: FlowBranch; selectedPath: LinkedPeacockPath };

function pushStepPages(
  pages: PdfExportPage[],
  step: FlowStep,
  screenshotUrls: Record<string, string>,
  stepResources: StepResource[],
): void {
  const resources = getStepResourcesForStep(stepResources, step.id);
  const slices = buildPdfStepContentSlices({
    step,
    resources,
    resolveInstructions: resolveStepDescription,
  });

  for (const slice of slices) {
    pages.push({ kind: 'step', step, screenshotUrls, slice, resources });
  }
}

function resolveSelectedPath(
  branch: FlowBranch,
  pathSelections: PdfPathSelections,
): LinkedPeacockPath | null {
  const paths = sortBranchPaths(branch.paths);
  if (!paths.length) return null;

  const selectedId = pathSelections[branch.id];
  return paths.find((path) => path.id === selectedId) ?? paths[0] ?? null;
}

export async function buildPdfExportPages(
  steps: FlowOutlineItem[],
  hostScreenshotUrls: Record<string, string>,
  pathSelections: PdfPathSelections,
  hostStepResources: StepResource[] = [],
): Promise<PdfExportPage[]> {
  const pages: PdfExportPage[] = [];

  for (const item of steps) {
    if (isFlowStep(item)) {
      pushStepPages(pages, item, hostScreenshotUrls, hostStepResources);
      continue;
    }

    if (!isFlowBranch(item)) continue;

    const selectedPath = resolveSelectedPath(item, pathSelections);
    if (!selectedPath) continue;

    pages.push({ kind: 'branch', branch: item, selectedPath });

    const doc = await getFlowDocument(selectedPath.targetDocumentId);
    if (!doc) continue;

    const slice = getPlayableStepRange(doc.steps, selectedPath.fromStepId, selectedPath.toStepId);
    if (!slice?.length) continue;

    for (const step of slice) {
      pushStepPages(pages, step, doc.screenshotUrls, doc.stepResources ?? []);
    }
  }

  return pages;
}

export function countPdfStepPages(pages: PdfExportPage[]): number {
  const stepIds = new Set<string>();
  for (const page of pages) {
    if (page.kind === 'step' && page.slice.pageIndex === 0) {
      stepIds.add(page.step.id);
    }
  }
  return stepIds.size;
}
