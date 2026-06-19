import { Document } from '@react-pdf/renderer';
import type { FlowPayload } from '@peacock/shared';
import type { PdfExportPage } from './buildPdfExportPages';
import { PdfBranchPage } from './PdfBranchPage';
import { PdfCoverPage } from './PdfCoverPage';
import { PdfFlowDetailsPage } from './PdfFlowDetailsPage';
import { PdfStepPage } from './PdfStepPage';

interface FlowDocumentProps {
  flow: FlowPayload;
  pages: PdfExportPage[];
  stepCount: number;
  logoSrc: string;
}

export const FlowDocument = ({ flow, pages, stepCount, logoSrc }: FlowDocumentProps) => {
  const flowTitle = flow.flow.title || 'Untitled Flow';
  let stepNumber = 0;

  return (
    <Document title={flowTitle} author="Peacock Studio">
      <PdfCoverPage flow={flow} stepCount={stepCount} logoSrc={logoSrc} />
      {flow.metadata.captureEnvironment ? (
        <PdfFlowDetailsPage
          flowTitle={flowTitle}
          environment={flow.metadata.captureEnvironment}
          logoSrc={logoSrc}
        />
      ) : null}
      {pages.map((page, index) => {
        if (page.kind === 'branch') {
          return (
            <PdfBranchPage
              key={`branch-${page.branch.id}`}
              branch={page.branch}
              selectedPath={page.selectedPath}
              flowTitle={flowTitle}
              logoSrc={logoSrc}
            />
          );
        }

        stepNumber += 1;
        return (
          <PdfStepPage
            key={`${page.step.id}-${index}`}
            step={page.step}
            stepNumber={stepNumber}
            flowTitle={flowTitle}
            screenshotUrls={page.screenshotUrls}
            logoSrc={logoSrc}
          />
        );
      })}
    </Document>
  );
};
