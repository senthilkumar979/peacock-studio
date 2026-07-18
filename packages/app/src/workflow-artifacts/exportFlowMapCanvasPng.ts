import { toPng } from 'html-to-image';

const EXPORT_PIXEL_RATIO = 2;
const EXPORT_BACKGROUND = '#f1f5f9';
const TITLE_COLOR = '#0f172a';
const TITLE_ACCENT = '#0d9488';

function shouldIncludeExportNode(node: HTMLElement): boolean {
  return !(
    node.classList.contains('react-flow__minimap') ||
    node.classList.contains('react-flow__controls') ||
    node.classList.contains('react-flow__panel')
  );
}

export function buildFlowMapPngFilename(flowTitle: string): string {
  const slug = flowTitle.trim().replace(/\s+/g, '-').toLowerCase() || 'flow-map';
  return `${slug}.png`;
}

export function waitForFlowMapLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(resolve, 120);
      });
    });
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load flow map image for export.'));
    image.src = dataUrl;
  });
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let currentLine = words[0] ?? '';

  for (const word of words.slice(1)) {
    const candidate = `${currentLine} ${word}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

async function composeFlowMapWithTitle(mapDataUrl: string, title: string): Promise<string> {
  const mapImage = await loadImage(mapDataUrl);
  const mapWidth = mapImage.width;
  const mapHeight = mapImage.height;
  const trimmedTitle = title.trim() || 'Untitled flow';

  await document.fonts.ready;

  const titleFontSize = Math.max(48, Math.round(mapWidth * 0.028));
  const lineHeight = Math.round(titleFontSize * 1.25);
  const horizontalPadding = Math.round(mapWidth * 0.06);
  const maxTextWidth = mapWidth - horizontalPadding * 2;

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) throw new Error('Canvas is not supported for flow map export.');

  measureCtx.font = `700 ${titleFontSize}px Lexend, ui-sans-serif, system-ui, sans-serif`;
  const titleLines = wrapCanvasText(measureCtx, trimmedTitle, maxTextWidth);

  const titleTopPadding = Math.round(mapWidth * 0.035);
  const accentGap = Math.round(titleFontSize * 0.35);
  const accentHeight = Math.max(4, Math.round(mapWidth * 0.0025));
  const titleBottomPadding = Math.round(mapWidth * 0.03);
  const titleBlockHeight =
    titleTopPadding +
    titleLines.length * lineHeight +
    accentGap +
    accentHeight +
    titleBottomPadding;

  const canvas = document.createElement('canvas');
  canvas.width = mapWidth;
  canvas.height = mapHeight + titleBlockHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported for flow map export.');

  ctx.fillStyle = EXPORT_BACKGROUND;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = TITLE_COLOR;
  ctx.font = `700 ${titleFontSize}px Lexend, ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  titleLines.forEach((line, index) => {
    const y = titleTopPadding + (index + 1) * lineHeight;
    ctx.fillText(line, canvas.width / 2, y);
  });

  const accentY = titleTopPadding + titleLines.length * lineHeight + accentGap;
  const accentWidth = Math.min(Math.round(mapWidth * 0.08), 180);
  ctx.fillStyle = TITLE_ACCENT;
  ctx.fillRect(canvas.width / 2 - accentWidth / 2, accentY, accentWidth, accentHeight);

  ctx.drawImage(mapImage, 0, titleBlockHeight, mapWidth, mapHeight);

  return canvas.toDataURL('image/png');
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function exportFlowMapCanvasPng(options: {
  viewportElement: HTMLElement;
  filename: string;
  title: string;
}): Promise<void> {
  const mapDataUrl = await toPng(options.viewportElement, {
    backgroundColor: EXPORT_BACKGROUND,
    pixelRatio: EXPORT_PIXEL_RATIO,
    cacheBust: true,
    filter: (node) => !(node instanceof HTMLElement) || shouldIncludeExportNode(node),
  });

  const composedDataUrl = await composeFlowMapWithTitle(mapDataUrl, options.title);
  downloadDataUrl(composedDataUrl, options.filename);
}

/** Large export viewport so the graph fills a high-resolution frame. */
export const FLOW_MAP_EXPORT_SIZE = {
  width: 4000,
  height: 2600,
} as const;
