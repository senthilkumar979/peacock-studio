import type { FlowStep, StepResource } from '@peacock/shared';
import { stripHtmlTags } from '@/utils/richText';

export const PDF_STEP_TEXT_LINES_PER_PAGE = 16;
export const PDF_STEP_CHARS_PER_LINE = 90;

export interface PdfStepContentSlice {
  instructions: string;
  detailedDescription: string;
  resources: StepResource[];
  showScreenshot: boolean;
  pageIndex: number;
  pageCount: number;
}

export interface PdfStepLayoutInput {
  step: FlowStep;
  resources: StepResource[];
  resolveInstructions: (step: FlowStep) => string;
}

function splitTextIntoChunks(text: string, maxLinesPerChunk: number): string[] {
  const normalized = text.trim();
  if (!normalized) return [];

  const words = normalized.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > PDF_STEP_CHARS_PER_LINE && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  const chunks: string[] = [];
  for (let index = 0; index < lines.length; index += maxLinesPerChunk) {
    chunks.push(lines.slice(index, index + maxLinesPerChunk).join('\n'));
  }
  return chunks;
}

export function buildPdfStepContentSlices(input: PdfStepLayoutInput): PdfStepContentSlice[] {
  const instructions = input.resolveInstructions(input.step).trim();
  const detailed = stripHtmlTags(input.step.detailedDescription ?? '').trim();
  const detailedChunks = splitTextIntoChunks(detailed, PDF_STEP_TEXT_LINES_PER_PAGE);

  const pageCount = Math.max(1, detailedChunks.length || (instructions || input.resources.length ? 1 : 1));
  const slices: PdfStepContentSlice[] = [];

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    slices.push({
      instructions: pageIndex === 0 ? instructions : '',
      detailedDescription: detailedChunks[pageIndex] ?? (pageIndex === 0 ? detailed : ''),
      resources: pageIndex === 0 ? input.resources : [],
      showScreenshot: pageIndex === pageCount - 1,
      pageIndex,
      pageCount,
    });
  }

  if (detailedChunks.length <= 1 && !instructions && input.resources.length === 0) {
    return [
      {
        instructions: '',
        detailedDescription: '',
        resources: [],
        showScreenshot: true,
        pageIndex: 0,
        pageCount: 1,
      },
    ];
  }

  return slices;
}
