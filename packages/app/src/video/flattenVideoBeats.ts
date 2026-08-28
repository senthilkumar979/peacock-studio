import {
  getPlayableStepRange,
  getStepScreenshotUrl,
  getStepUrl,
  isFlowBranch,
  isFlowStep,
  resolveStepDescription,
  sortBranchPaths,
  type FlowBranch,
  type FlowOutlineItem,
  type FlowStep,
  type LinkedPeacockPath,
} from '@peacock/shared';
import { getDisplayedStepMarkerPosition } from '@/capture-editor/displayedStepMarker';
import { getFlowDocument } from '@/services/flowLibraryService';
import type { PdfPathSelections } from '@/utils/pdfPathSelection';
import { clampZoomOrigin } from './clampZoomOrigin';
import type { VideoBeat } from './videoBeats';

interface FlattenVideoBeatsInput {
  steps: FlowOutlineItem[];
  screenshotUrls: Record<string, string>;
  pathSelections: PdfPathSelections;
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

function toBeat(
  step: FlowStep,
  stepNumber: number,
  screenshotUrls: Record<string, string>,
): VideoBeat {
  const screenshotUrl = getStepScreenshotUrl(step, screenshotUrls);
  const marker = getDisplayedStepMarkerPosition(step);
  const url = getStepUrl(step);
  const title = step.title.trim() || `Step ${stepNumber}`;
  const description = resolveStepDescription(step);

  if (screenshotUrl && marker) {
    return {
      kind: 'step',
      stepNumber,
      title,
      description,
      screenshotUrl,
      marker: clampZoomOrigin(marker.xPercent, marker.yPercent),
      url,
    };
  }

  return {
    kind: screenshotUrl ? 'step' : 'nav',
    stepNumber,
    title,
    description,
    screenshotUrl,
    marker: null,
    url,
  };
}

export async function flattenVideoBeats({
  steps,
  screenshotUrls,
  pathSelections,
}: FlattenVideoBeatsInput): Promise<VideoBeat[]> {
  const beats: VideoBeat[] = [];
  let stepNumber = 0;

  for (const item of steps) {
    if (isFlowStep(item)) {
      stepNumber += 1;
      beats.push(toBeat(item, stepNumber, screenshotUrls));
      continue;
    }

    if (!isFlowBranch(item)) continue;

    const selectedPath = resolveSelectedPath(item, pathSelections);
    if (!selectedPath) continue;

    const doc = await getFlowDocument(selectedPath.targetDocumentId);
    if (!doc) continue;

    const slice = getPlayableStepRange(doc.steps, selectedPath.fromStepId, selectedPath.toStepId);
    if (!slice?.length) continue;

    for (const step of slice) {
      stepNumber += 1;
      beats.push(toBeat(step, stepNumber, doc.screenshotUrls));
    }
  }

  return beats;
}
