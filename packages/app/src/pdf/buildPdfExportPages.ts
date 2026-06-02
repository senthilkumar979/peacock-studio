import {
  getPlayableStepRange,
  isFlowBranch,
  isFlowStep,
  sortBranchPaths,
  type FlowBranch,
  type FlowOutlineItem,
  type FlowStep,
  type LinkedPeacockPath,
} from '@peacock/shared';
import { getFlowDocument } from '@/services/flowLibraryService';
import type { PdfPathSelections } from '@/utils/pdfPathSelection';

export type PdfExportPage =
  | { kind: 'step'; step: FlowStep; screenshotUrls: Record<string, string> }
  | { kind: 'branch'; branch: FlowBranch; selectedPath: LinkedPeacockPath };

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
): Promise<PdfExportPage[]> {
  const pages: PdfExportPage[] = [];

  for (const item of steps) {
    if (isFlowStep(item)) {
      pages.push({ kind: 'step', step: item, screenshotUrls: hostScreenshotUrls });
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
      pages.push({ kind: 'step', step, screenshotUrls: doc.screenshotUrls });
    }
  }

  return pages;
}

export function countPdfStepPages(pages: PdfExportPage[]): number {
  return pages.filter((page) => page.kind === 'step').length;
}
