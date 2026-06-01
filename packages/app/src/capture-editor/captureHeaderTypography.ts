/** Scales caption type with screenshot width so exports stay readable at any resolution. */

export interface CaptureHeaderTypography {
  titleSize: number;
  descSize: number;
  titleLineHeight: number;
  descLineHeight: number;
  blockGap: number;
  topPadding: number;
  bottomPadding: number;
  titleFont: string;
  descFont: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getCaptureHeaderTypography(contentWidth: number): CaptureHeaderTypography {
  const titleSize = Math.round(clamp(contentWidth * 0.05, 28, 72));
  const descSize = Math.round(clamp(contentWidth * 0.04, 20, 56));
  const blockGap = Math.round(clamp(contentWidth * 0.008, 8, 14));
  const topPadding = Math.round(clamp(contentWidth * 0.01, 10, 16));
  const bottomPadding = Math.round(clamp(contentWidth * 0.012, 12, 20));

  return {
    titleSize,
    descSize,
    titleLineHeight: Math.round(titleSize * 1.3),
    descLineHeight: Math.round(descSize * 1.45),
    blockGap,
    topPadding,
    bottomPadding,
    titleFont: `600 ${titleSize}px Inter, system-ui, sans-serif`,
    descFont: `400 ${descSize}px Inter, system-ui, sans-serif`,
  };
}

function estimateWrappedLineCount(text: string, maxWidth: number, fontSize: number): number {
  const avgCharWidth = fontSize * 0.52;
  const charsPerLine = Math.max(12, Math.floor(maxWidth / avgCharWidth));

  return text.split('\n').reduce((total, paragraph) => {
    if (paragraph.length === 0) return total + 1;
    return total + Math.ceil(paragraph.length / charsPerLine);
  }, 0);
}

export function computeCaptureHeaderHeight(
  title: string,
  description: string,
  contentWidth: number,
): number {
  const trimmedTitle = title.trim();
  const trimmedDesc = description.trim();
  if (!trimmedTitle && !trimmedDesc) return 0;

  const typo = getCaptureHeaderTypography(contentWidth);
  let height = typo.topPadding + typo.bottomPadding;

  if (trimmedTitle) {
    const lines = estimateWrappedLineCount(trimmedTitle, contentWidth, typo.titleSize);
    height += lines * typo.titleLineHeight;
  }

  if (trimmedDesc) {
    if (trimmedTitle) height += typo.blockGap;
    const lines = estimateWrappedLineCount(trimmedDesc, contentWidth, typo.descSize);
    height += lines * typo.descLineHeight;
  }

  return height;
}
