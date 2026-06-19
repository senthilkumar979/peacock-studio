import { collectAllBranches, type FlowOutlineItem, type FlowPayload } from '@peacock/shared';
import { buildPdfExportPages, countPdfStepPages } from './buildPdfExportPages';
import { FlowDocument } from './FlowDocument';
import { getPdfLogoUrl } from './pdfConstants';
import { registerPdfFonts } from './registerPdfFonts';
import { renderPdfBlob } from './renderPdfBlob';
import {
  buildDefaultPdfPathSelections,
  type PdfPathSelections,
} from '@/utils/pdfPathSelection';

interface ExportFlowPdfParams {
  flow: FlowPayload;
  steps: FlowOutlineItem[];
  screenshotUrls: Record<string, string>;
  pathSelections?: PdfPathSelections;
}

function sanitizeFilename(title: string): string {
  return title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'flow';
}

export async function exportFlowPdf({
  flow,
  steps,
  screenshotUrls,
  pathSelections: pathSelectionsInput,
}: ExportFlowPdfParams): Promise<void> {
  registerPdfFonts();

  const branches = collectAllBranches(steps);
  const pathSelections =
    pathSelectionsInput ?? buildDefaultPdfPathSelections(branches);
  const pages = await buildPdfExportPages(steps, screenshotUrls, pathSelections);
  const stepCount = countPdfStepPages(pages);

  if (!stepCount) return;

  const payload: FlowPayload = { ...flow, steps };
  const logoSrc = getPdfLogoUrl();

  const blob = await renderPdfBlob(
    <FlowDocument
      flow={payload}
      pages={pages}
      stepCount={stepCount}
      logoSrc={logoSrc}
    />,
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(flow.flow.title)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
