import type { FlowStep, FlowStepScreenshotEdit, NormalizedPosition } from '@peacock/shared';
import { getStepMarkerPosition } from '@peacock/shared';
import { computeCaptureLayout } from './computeCaptureLayout';

export function mapSourceMarkerThroughScreenshotEdit(
  position: NormalizedPosition,
  edit: FlowStepScreenshotEdit,
): NormalizedPosition | null {
  const layout = computeCaptureLayout(edit.sourceWidth, edit.sourceHeight, edit.settings);
  const crop = layout.crop;
  const nx = position.xPercent;
  const ny = position.yPercent;

  if (nx < crop.x || ny < crop.y || nx > crop.x + crop.width || ny > crop.y + crop.height) {
    return null;
  }

  const relX = (nx - crop.x) / crop.width;
  const relY = (ny - crop.y) / crop.height;
  const xPercent = (layout.imageLeft + relX * layout.imageWidth) / layout.canvasWidth;
  const yPercent = (layout.imageTop + relY * layout.imageHeight) / layout.canvasHeight;

  return { x: xPercent, y: yPercent, xPercent, yPercent };
}

export function getDisplayedStepMarkerPosition(step: FlowStep): NormalizedPosition | null {
  const source = getStepMarkerPosition(step);
  if (!source) return null;
  if (!step.screenshotEdit) return source;
  return mapSourceMarkerThroughScreenshotEdit(source, step.screenshotEdit);
}
