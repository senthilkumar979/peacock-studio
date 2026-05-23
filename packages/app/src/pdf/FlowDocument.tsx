import { Document } from '@react-pdf/renderer';
import type { FlowPayload, FlowStep } from '@peacock/shared';
import { PdfCoverPage } from './PdfCoverPage';
import { PdfStepPage } from './PdfStepPage';

interface FlowDocumentProps {
  flow: FlowPayload;
  steps: FlowStep[];
  screenshotUrls: Record<string, string>;
  logoSrc: string;
}

export const FlowDocument = ({ flow, steps, screenshotUrls, logoSrc }: FlowDocumentProps) => {
  const flowTitle = flow.flow.title || 'Untitled Flow';

  return (
    <Document title={flowTitle} author="Peacock Studio">
      <PdfCoverPage flow={flow} stepCount={steps.length} logoSrc={logoSrc} />
      {steps.map((step, index) => (
        <PdfStepPage
          key={step.id}
          step={step}
          stepNumber={index + 1}
          flowTitle={flowTitle}
          screenshotUrls={screenshotUrls}
          logoSrc={logoSrc}
        />
      ))}
    </Document>
  );
};
