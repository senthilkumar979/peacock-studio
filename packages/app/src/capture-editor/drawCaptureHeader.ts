import type { CaptureEditorSettings } from '@peacock/shared';
import type { CaptureLayout } from './computeCaptureLayout';
import { getCaptureHeaderTypography } from './captureHeaderTypography';

type PaintContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

function wrapLines(
  context: PaintContext,
  text: string,
  maxWidth: number,
): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }

    const words = paragraph.split(/\s+/);
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (context.measureText(candidate).width <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) lines.push(current);
      current = word;
    }

    if (current) lines.push(current);
  }

  return lines.length > 0 ? lines : [''];
}

export function drawCaptureHeader(
  context: PaintContext,
  layout: CaptureLayout,
  settings: CaptureEditorSettings,
): void {
  const title = settings.title.trim();
  const description = settings.description.trim();
  if (!title && !description) return;

  const x = layout.imageLeft;
  const maxWidth = layout.imageWidth;
  const typo = getCaptureHeaderTypography(maxWidth);
  let y = layout.imageTop - layout.headerHeight + typo.topPadding;

  context.save();
  context.textAlign = 'left';
  context.textBaseline = 'top';

  if (title) {
    context.font = typo.titleFont;
    context.fillStyle = '#0f172a';
    for (const line of wrapLines(context, title, maxWidth)) {
      context.fillText(line, x, y);
      y += typo.titleLineHeight;
    }
    y += typo.blockGap;
  }

  if (description) {
    context.font = typo.descFont;
    context.fillStyle = '#475569';
    for (const line of wrapLines(context, description, maxWidth)) {
      context.fillText(line, x, y);
      y += typo.descLineHeight;
    }
  }

  context.restore();
}
