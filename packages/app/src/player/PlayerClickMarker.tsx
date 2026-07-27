import type { FlowStep } from '@peacock/shared';
import { resolveStepDescription } from '@peacock/shared';
import { PulseMarker } from '@/editor/PulseMarker';
import { getPopoverPlacement } from './getPopoverPlacement';
import { StepDetailPopover } from './StepDetailPopover';

interface PlayerClickMarkerProps {
  step: FlowStep;
  stepNumber: number;
  xPercent: number;
  yPercent: number;
  isDetailsVisible?: boolean;
  onToggle?: () => void;
  isEmbed?: boolean;
}

export const PlayerClickMarker = ({
  step,
  stepNumber,
  xPercent,
  yPercent,
  isDetailsVisible = true,
  onToggle,
  isEmbed = false,
}: PlayerClickMarkerProps) => {
  const isInteractive = Boolean(onToggle);
  const description = resolveStepDescription(step);
  const placement = getPopoverPlacement(xPercent, yPercent);

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${xPercent * 100}%`,
        top: `${yPercent * 100}%`,
      }}
    >
      {isInteractive ? (
        <button
          type="button"
          onClick={onToggle}
          className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-peacock-500 focus-visible:ring-offset-2"
          aria-expanded={isDetailsVisible}
          aria-label={isDetailsVisible ? 'Hide step details' : 'Show step details'}
        >
          <PulseMarker />
        </button>
      ) : (
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2">
          <PulseMarker />
        </div>
      )}

      {isDetailsVisible ? (
        <div className={`pointer-events-none ${placement.wrapperClassName}`}>
          <StepDetailPopover
            key={step.id}
            stepNumber={stepNumber}
            title={step.title}
            description={description}
            showArrow
            arrowSide={placement.arrowSide}
            isEmbed={isEmbed}
          />
        </div>
      ) : null}
    </div>
  );
};
