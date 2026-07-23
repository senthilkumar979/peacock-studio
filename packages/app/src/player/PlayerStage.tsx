import { AnimatePresence, motion } from 'framer-motion';
import type { FlowStep } from '@peacock/shared';
import { getStepMarkerPosition, getStepUrl } from '@peacock/shared';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { useImageLoaded } from '@/hooks/useImageLoaded';
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
  /** Compact layout when framed by embed header/footer chrome. */
  isEmbed?: boolean;
}

const screenshotClassName =
  'block max-h-[min(65vh,800px)] w-auto max-w-[calc(100vw-2.5rem)] object-contain';

/** Leaves room for embed header + player controls + watermark footer. */
const embedScreenshotClassName =
  'block max-h-[min(calc(100dvh-14rem),640px)] w-auto max-w-[calc(100%-1.5rem)] object-contain';

const StageLoader = ({ isEmbed = false }: { isEmbed?: boolean }) => (
  <div
    className={`flex w-full min-w-[min(100%,20rem)] items-center justify-center rounded-xl bg-slate-100 ${
      isEmbed
        ? 'min-h-[min(40dvh,360px)] max-w-[calc(100%-1rem)]'
        : 'min-h-[min(50vh,520px)] max-w-[calc(100vw-2rem)]'
    }`}
    aria-busy="true"
    aria-label="Loading step screenshot"
  >
    <PeacockStudioLoader size={isEmbed ? 72 : 96} />
  </div>
);

export const PlayerStage = ({
  step,
  stepNumber,
  screenshotUrls,
  isEmbed = false,
}: PlayerStageProps) => {
  const screenshotUrl = getStepScreenshotUrl(step, screenshotUrls);
  const markerPosition = getStepMarkerPosition(step);
  const stepUrl = getStepUrl(step);
  const description = step.notes || step.generatedDescription;
  const { isDetailsVisible, toggleDetails } = usePlayerStepDetailsVisibility(step.id);
  const { isLoaded: isImageLoaded, imgRef, onLoad, onError } = useImageLoaded(screenshotUrl);

  const showOverlays = Boolean(screenshotUrl && isImageLoaded);
  const isScreenshotLoading = Boolean(screenshotUrl && !isImageLoaded);
  const imageClassName = isEmbed ? embedScreenshotClassName : screenshotClassName;

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center ${
        isEmbed ? 'gap-3' : 'gap-5'
      }`}
    >
      {screenshotUrl ? (
        <>
          <img
            ref={imgRef}
            key={step.id}
            src={screenshotUrl}
            alt=""
            onLoad={onLoad}
            onError={onError}
            className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
            aria-hidden
          />

          <AnimatePresence mode="wait">
            {isScreenshotLoading ? (
              <motion.div
                key={`${step.id}-loader`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full"
              >
                <StageLoader isEmbed={isEmbed} />
              </motion.div>
            ) : (
              <motion.div
                key={`${step.id}-stage`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <BrowserMockup url={stepUrl}>
                  <div
                    className={`relative inline-block min-w-[min(100%,20rem)] ${
                      isEmbed ? 'p-2 sm:p-3' : 'p-3 sm:p-4'
                    }`}
                  >
                    <img
                      src={screenshotUrl}
                      alt={step.title}
                      className={imageClassName}
                    />

                    {showOverlays && markerPosition ? (
                      <PlayerClickMarker
                        step={step}
                        stepNumber={stepNumber}
                        xPercent={markerPosition.xPercent}
                        yPercent={markerPosition.yPercent}
                        isDetailsVisible={isDetailsVisible}
                        onToggle={toggleDetails}
                      />
                    ) : null}

                    {showOverlays && !markerPosition ? (
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
                    ) : null}
                  </div>
                </BrowserMockup>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <BrowserMockup url={stepUrl}>
          <div className="flex min-h-[200px] min-w-[min(100%,20rem)] items-center justify-center px-6 py-10 text-sm text-slate-500">
            {step.event.type === 'navigation'
              ? 'Navigation step — no screenshot'
              : 'Screenshot unavailable'}
          </div>
        </BrowserMockup>
      )}

      {!markerPosition && !screenshotUrl ? (
        <div className="flex flex-col items-end gap-2">
          <PlayerStepDetailsToggle isVisible={isDetailsVisible} onToggle={toggleDetails} />
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
