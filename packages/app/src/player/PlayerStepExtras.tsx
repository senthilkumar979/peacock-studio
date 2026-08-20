import { getStepResourcesForStep, type FlowStep, type StepResource } from '@peacock/shared';
import { RichTextContent } from '@/components/editor/RichTextContent';
import { StepResourceList } from '@/components/flow/StepResourceList';
import { isEmptyRichText } from '@/utils/richText';

interface PlayerStepExtrasProps {
  step: FlowStep;
  stepResources: StepResource[];
}

export function hasPlayerStepExtras(step: FlowStep, stepResources: StepResource[]): boolean {
  const resources = getStepResourcesForStep(stepResources, step.id);
  return !isEmptyRichText(step.detailedDescription ?? '') || resources.length > 0;
}

export const PlayerStepExtras = ({ step, stepResources }: PlayerStepExtrasProps) => {
  const resources = getStepResourcesForStep(stepResources, step.id);
  const hasDetailedDescription = !isEmptyRichText(step.detailedDescription ?? '');

  if (!hasDetailedDescription && resources.length === 0) return null;

  return (
    <div className="space-y-5">
      {hasDetailedDescription ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Detailed description
          </p>
          <RichTextContent
            html={step.detailedDescription ?? ''}
            className="prose prose-sm mt-2 max-w-none text-slate-700"
          />
        </div>
      ) : null}
      <StepResourceList resources={resources} />
    </div>
  );
};
