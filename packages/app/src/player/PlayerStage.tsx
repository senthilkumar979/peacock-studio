import { AnimatePresence, motion } from 'framer-motion';
import type { FlowStep } from '@peacock/shared';
import { getStepUrl } from '@peacock/shared';
import { getStepScreenshotUrl } from '@/store/flowStore';
import { BrowserMockup } from './BrowserMockup';
import { PlayerClickMarker } from './PlayerClickMarker';
import { StepDetailPopover } from './StepDetailPopover';

interface PlayerStageProps {
  step: FlowStep;
  stepNumber: number;
  screenshotUrls: Record<string, string>;
}

export const PlayerStage = ({ step, stepNumber, screenshotUrls }: PlayerStageProps) => {
  const screenshotUrl = getStepScreenshotUrl(step, screenshotUrls);
  const clickEvent = step.event.type === 'click' ? step.event : null;
  const stepUrl = getStepUrl(step);
  const description = step.notes || step.generatedDescription;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5">
      <BrowserMockup url={stepUrl}>
        {screenshotUrl ? (
          <div className="relative inline-block p-3 sm:p-4">
            <motion.img
              key={step.id}
              src={screenshotUrl}
              alt={step.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="block max-h-[min(65vh,800px)] w-auto max-w-[calc(100vw-2.5rem)] object-contain"
            />
            {clickEvent && (
              <PlayerClickMarker
                step={step}
                stepNumber={stepNumber}
                xPercent={clickEvent.position.xPercent}
                yPercent={clickEvent.position.yPercent}
              />
            )}
          </div>
        ) : (
          <div className="flex min-h-[200px] min-w-[min(100%,20rem)] items-center justify-center px-6 py-10 text-sm text-slate-500">
            {step.event.type === 'navigation'
              ? 'Navigation step — no screenshot'
              : 'Screenshot unavailable'}
          </div>
        )}
      </BrowserMockup>

      {!clickEvent && (
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <StepDetailPopover
              stepNumber={stepNumber}
              title={step.title}
              description={description}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
