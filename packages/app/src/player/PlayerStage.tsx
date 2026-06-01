import { AnimatePresence, motion } from 'framer-motion';
import type { FlowStep } from '@peacock/shared';
import { getStepMarkerPosition, getStepUrl } from '@peacock/shared';
import { usePlayerStepDetailsVisibility } from '@/hooks/usePlayerStepDetailsVisibility';
import { getStepScreenshotUrl } from '@/store/flowStore';
import { BrowserMockup } from './BrowserMockup';
import { PlayerClickMarker } from './PlayerClickMarker';
import { PlayerStepDetailsToggle } from './PlayerStepDetailsToggle';
import { StepDetailPopover } from './StepDetailPopover';

interface PlayerStageProps {
  step: FlowStep;
  stepNumber: number;
  screenshotUrls: Record<string, string>;
}

export const PlayerStage = ({ step, stepNumber, screenshotUrls }: PlayerStageProps) => {
  const screenshotUrl = getStepScreenshotUrl(step, screenshotUrls);
  const markerPosition = getStepMarkerPosition(step);
  const stepUrl = getStepUrl(step);
  const description = step.notes || step.generatedDescription;
  const { isDetailsVisible, toggleDetails } = usePlayerStepDetailsVisibility(step.id);

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
            {markerPosition ? (
              <PlayerClickMarker
                step={step}
                stepNumber={stepNumber}
                xPercent={markerPosition.xPercent}
                yPercent={markerPosition.yPercent}
                isDetailsVisible={isDetailsVisible}
                onToggle={toggleDetails}
              />
            ) : (
              <>
                <PlayerStepDetailsToggle
                  isVisible={isDetailsVisible}
                  onToggle={toggleDetails}
                  className="pointer-events-auto absolute bottom-2 right-2 z-30 sm:bottom-3 sm:right-3"
                />
                <AnimatePresence mode="wait">
                  {isDetailsVisible ? (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.22 }}
                      className="pointer-events-none absolute inset-x-2 bottom-2 z-20 sm:inset-x-3 sm:bottom-3"
                    >
                      <div
                        className="pointer-events-auto pr-11"
                        aria-label={`Step ${stepNumber}: ${step.title}`}
                      >
                        <div
                          className="pointer-events-none absolute inset-x-0 bottom-full mb-1.5 h-12 bg-gradient-to-t from-slate-900/20 to-transparent"
                          aria-hidden
                        />
                        <StepDetailPopover
                          stepNumber={stepNumber}
                          title={step.title}
                          description={description}
                          appearance="glass"
                        />
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </>
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

      {!markerPosition && !screenshotUrl ? (
        <div className="flex flex-col items-end gap-2">
          <PlayerStepDetailsToggle
            isVisible={isDetailsVisible}
            onToggle={toggleDetails}
          />
          <AnimatePresence mode="wait">
            {isDetailsVisible ? (
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
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
};
