import type { FlowStep } from '@peacock/shared';
import { getLinkedDocumentPathAnchor, getLinkedDocumentStepAnchor } from '@/utils/shareLink';
import { DocumentStepCard } from './DocumentStepCard';

interface DocumentLinkedPathStepsProps {
  pathId: string;
  pathLabel: string;
  steps: FlowStep[];
  screenshotUrls: Record<string, string>;
  targetDocumentId: string;
  startStepNumber: number;
  activeItemId: string | null;
}

export const DocumentLinkedPathSteps = ({
  pathId,
  pathLabel,
  steps,
  screenshotUrls,
  targetDocumentId,
  startStepNumber,
  activeItemId,
}: DocumentLinkedPathStepsProps) => (
  <div className="mt-4 space-y-5 border-l-2 border-brand-violet/25 pl-4 sm:pl-5">
    <p
      id={getLinkedDocumentPathAnchor(pathId)}
      data-outline-id={`path:${pathId}`}
      className="scroll-mt-24 text-xs font-semibold uppercase tracking-[0.16em] text-brand-violet"
    >
      Path: {pathLabel}
    </p>
    {steps.map((step, index) => {
      const stepNumber = startStepNumber + index;
      const anchorId = getLinkedDocumentStepAnchor(pathId, step.id);
      const outlineId = `${pathId}:${step.id}`;

      return (
        <div key={outlineId} data-outline-id={outlineId}>
          <DocumentStepCard
            documentId={targetDocumentId}
            step={step}
            stepNumber={stepNumber}
            anchorId={anchorId}
            isActive={activeItemId === outlineId}
            screenshotUrls={screenshotUrls}
          />
        </div>
      );
    })}
  </div>
);
