import { pdf } from '@react-pdf/renderer';
import type { FlowPayload, FlowStep } from '@peacock/shared';
import { FlowDocument } from './FlowDocument';
import { getPdfLogoUrl } from './pdfConstants';
import { registerPdfFonts } from './registerPdfFonts';

interface ExportFlowPdfParams {
  flow: FlowPayload;
  steps: FlowStep[];
  screenshotUrls: Record<string, string>;
}

function sanitizeFilename(title: string): string {
  return title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'flow';
}

export async function exportFlowPdf({
  flow,
  steps,
  screenshotUrls,
}: ExportFlowPdfParams): Promise<void> {
  registerPdfFonts();

  const payload: FlowPayload = { ...flow, steps };
  const logoSrc = getPdfLogoUrl();

  const blob = await pdf(
    <FlowDocument flow={payload} steps={steps} screenshotUrls={screenshotUrls} logoSrc={logoSrc} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(flow.flow.title)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
