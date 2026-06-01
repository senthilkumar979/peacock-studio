import type { CaptureEditorSettings, NormalizedRect } from '@peacock/shared';
import { normalizedToCanvasRect, sourceNormalizedToCanvasRect, type CaptureLayout } from './computeCaptureLayout';
import { getPrivacyRegionHandlePositions } from './privacyRegionHandles';

function strokeRect(
  context: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
  color: string,
  dash: number[] = [],
): void {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.setLineDash(dash);
  context.strokeRect(rect.x, rect.y, rect.width, rect.height);
  context.restore();
}

function drawCropDimming(
  context: CanvasRenderingContext2D,
  layout: CaptureLayout,
  crop: NormalizedRect,
): void {
  const full = {
    x: layout.imageLeft,
    y: layout.imageTop,
    width: layout.imageWidth,
    height: layout.imageHeight,
  };
  const inner = sourceNormalizedToCanvasRect(crop, layout);

  context.save();
  context.fillStyle = 'rgba(15, 23, 42, 0.45)';
  context.fillRect(full.x, full.y, full.width, full.height);
  context.globalCompositeOperation = 'destination-out';
  context.fillRect(inner.x, inner.y, inner.width, inner.height);
  context.restore();

  strokeRect(context, inner, '#38bdf8', [6, 4]);
}

function drawSelectionHandles(
  context: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
): void {
  const handleSize = 8;
  const half = handleSize / 2;
  const handles = getPrivacyRegionHandlePositions(rect);

  context.save();
  strokeRect(context, rect, '#f59e0b', [4, 3]);
  context.fillStyle = '#ffffff';
  context.strokeStyle = '#f59e0b';
  context.lineWidth = 1.5;
  context.setLineDash([]);

  for (const point of Object.values(handles)) {
    context.fillRect(point.x - half, point.y - half, handleSize, handleSize);
    context.strokeRect(point.x - half, point.y - half, handleSize, handleSize);
  }

  context.restore();
}

export function drawCaptureOverlay(
  context: CanvasRenderingContext2D,
  layout: CaptureLayout,
  settings: CaptureEditorSettings,
  selectedId: string | null,
  draftRect: NormalizedRect | null,
  activeTool: string,
): void {
  if (activeTool === 'crop' && layout.isCropPreview) {
    drawCropDimming(context, layout, settings.crop);
    return;
  }

  if (activeTool === 'select' && selectedId) {
    const region = settings.privacyRegions.find((item) => item.id === selectedId);
    if (region) {
      drawSelectionHandles(context, normalizedToCanvasRect(region.rect, layout));
    }
  }

  if (draftRect) {
    strokeRect(context, normalizedToCanvasRect(draftRect, layout), '#f59e0b', [5, 3]);
  }
}
