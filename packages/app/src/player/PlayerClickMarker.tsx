import type { FlowStep } from '@peacock/shared';
import { PulseMarker } from '@/editor/PulseMarker';
import { getPopoverPlacement } from './getPopoverPlacement';
import { StepDetailPopover } from './StepDetailPopover';

interface PlayerClickMarkerProps {
  step: FlowStep;
  stepNumber: number;
  xPercent: number;
  yPercent: number;
}

export const PlayerClickMarker = ({ step, stepNumber, xPercent, yPercent }: PlayerClickMarkerProps) => {
  const description = step.notes || step.generatedDescription;
  const placement = getPopoverPlacement(xPercent, yPercent);

  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        left: `${xPercent * 100}%`,
        top: `${yPercent * 100}%`,
      }}
    >
      <div className="absolute -translate-x-1/2 -translate-y-1/2">
        <PulseMarker />
      </div>
      <div className={placement.wrapperClassName}>
        <StepDetailPopover
          key={step.id}
          stepNumber={stepNumber}
          title={step.title}
          description={description}
          showArrow
          arrowSide={placement.arrowSide}
        />
      </div>
    </div>
  );
};
