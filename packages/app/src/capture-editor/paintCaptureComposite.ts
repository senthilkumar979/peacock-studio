import { getCaptureBackgroundPreset, type CaptureEditorSettings } from '@peacock/shared';
import { applyPrivacyRegions } from './applyPrivacyRegions';
import { roundRectPath } from './canvasRoundRect';
import { computeCaptureLayout } from './computeCaptureLayout';
import { drawCaptureBackground } from './drawCaptureBackground';
import { drawCaptureHeader } from './drawCaptureHeader';

export interface PaintCaptureInput {
  image: HTMLImageElement;
  naturalWidth: number;
  naturalHeight: number;
  settings: CaptureEditorSettings;
  cropPreview?: boolean;
}

type PaintContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

async function paintScreenshot(
  context: PaintContext,
  input: PaintCaptureInput,
  layout: ReturnType<typeof computeCaptureLayout>,
  useShadow: boolean,
): Promise<void> {
  const { settings, image } = input;
  const { crop, imageLeft, imageTop, imageWidth, imageHeight, isCropPreview } = layout;
  const cornerRadius = Math.max(0, Math.round(settings.cornerRadius));

  if (useShadow) {
    context.save();
    context.shadowColor = 'rgba(15, 23, 42, 0.28)';
    context.shadowBlur = 32;
    context.shadowOffsetY = 14;
    roundRectPath(context, imageLeft, imageTop, imageWidth, imageHeight, cornerRadius);
    context.fillStyle = '#ffffff';
    context.fill();
    context.restore();
  }

  context.save();
  roundRectPath(context, imageLeft, imageTop, imageWidth, imageHeight, cornerRadius);
  context.clip();

  if (isCropPreview) {
    context.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      imageLeft,
      imageTop,
      imageWidth,
      imageHeight,
    );
  } else {
    const sx = Math.round(image.naturalWidth * crop.x);
    const sy = Math.round(image.naturalHeight * crop.y);
    const sw = Math.max(1, Math.round(image.naturalWidth * crop.width));
    const sh = Math.max(1, Math.round(image.naturalHeight * crop.height));
    context.drawImage(image, sx, sy, sw, sh, imageLeft, imageTop, imageWidth, imageHeight);
  }

  context.restore();

  if (!isCropPreview) {
    applyPrivacyRegions(context, layout, settings.privacyRegions, image);
  }
}

export async function paintCaptureComposite(
  context: PaintContext,
  input: PaintCaptureInput,
): Promise<ReturnType<typeof computeCaptureLayout>> {
  const layout = computeCaptureLayout(input.naturalWidth, input.naturalHeight, input.settings, {
    cropPreview: input.cropPreview,
  });
  const preset = getCaptureBackgroundPreset(input.settings.backgroundPresetId);
  const skipBackground = !preset || preset.id === 'none' || preset.solidColor === 'transparent';
  const framePreset = preset ?? getCaptureBackgroundPreset('rose-gold')!;
  const frameCornerRadius = Math.max(0, Math.round(input.settings.frameCornerRadius));

  context.clearRect(0, 0, layout.canvasWidth, layout.canvasHeight);
  if (!skipBackground) {
    drawCaptureBackground(
      context,
      layout.canvasWidth,
      layout.canvasHeight,
      framePreset,
      frameCornerRadius,
    );
  }

  drawCaptureHeader(context, layout, input.settings);

  await paintScreenshot(context, input, layout, Boolean(preset?.imageShadow));
  return layout;
}
