import { Document } from '@react-pdf/renderer';
import type { FlowPayload } from '@peacock/shared';
import type { ReactElement } from 'react';
import type { PdfExportPage } from './buildPdfExportPages';
import { PdfBranchPage } from './PdfBranchPage';
import { PdfCoverPage } from './PdfCoverPage';
import { PdfFlowDetailsPage } from './PdfFlowDetailsPage';
import { PdfStepPage } from './PdfStepPage';
import { hasPdfCaptureEnvironment } from './pdfCaptureEnvironment';

interface FlowDocumentProps {
  flow: FlowPayload;
  pages: PdfExportPage[];
  stepCount: number;
  logoSrc: string;
}

export const FlowDocument = ({ flow, pages, stepCount, logoSrc }: FlowDocumentProps) => {
  const flowTitle = flow.flow.title || 'Untitled Flow';
  let stepNumber = 0;

  const documentPages: ReactElement[] = [
    <PdfCoverPage key="cover" flow={flow} stepCount={stepCount} logoSrc={logoSrc} />,
  ];

  if (hasPdfCaptureEnvironment(flow.metadata.captureEnvironment)) {
    documentPages.push(
      <PdfFlowDetailsPage
        key="capture-environment"
        flowTitle={flowTitle}
        environment={flow.metadata.captureEnvironment}
        logoSrc={logoSrc}
      />,
    );
  }

  for (const [index, page] of pages.entries()) {
    if (page.kind === 'branch') {
      documentPages.push(
        <PdfBranchPage
          key={`branch-${page.branch.id}-${index}`}
          branch={page.branch}
          selectedPath={page.selectedPath}
          flowTitle={flowTitle}
          logoSrc={logoSrc}
        />,
      );
      continue;
    }

    stepNumber += 1;
    documentPages.push(
      <PdfStepPage
        key={`step-${page.step.id}-${index}`}
        step={page.step}
        stepNumber={stepNumber}
        flowTitle={flowTitle}
        screenshotUrls={page.screenshotUrls}
        logoSrc={logoSrc}
      />,
    );
  }

  return (
    <Document title={flowTitle} author="Peacock Studio">
      {documentPages}
    </Document>
  );
};
