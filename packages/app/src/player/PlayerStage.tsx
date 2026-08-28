import { AnimatePresence, motion } from 'framer-motion';
import type { FlowStep } from '@peacock/shared';
import { getStepUrl, resolveStepDescription } from '@peacock/shared';
import { getDisplayedStepMarkerPosition } from '@/capture-editor/displayedStepMarker';
import { CloudNetworkBlockedNotice } from '@/components/auth/CloudNetworkBlockedNotice';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import {
  getCloudNetworkBlockedError,
  isCloudHostedScreenshotUrl,
} from '@/cloud/cloudInitErrors';
import { useImageLoaded } from '@/hooks/useImageLoaded';
import { usePlayerStepDetailsVisibility } from '@/hooks/usePlayerStepDetailsVisibility';
import { getStepScreenshotUrl } from '@/store/flowStore';
import { BrowserMockup } from './BrowserMockup';
import { PlayerClickMarker } from './PlayerClickMarker';
import { PlayerStepDetailsToggle } from './PlayerStepDetailsToggle';
import { PlayerStepMoreInfo } from './PlayerStepMoreInfo';
import { StepDetailPopover } from './StepDetailPopover';
import { useFlowStore } from '@/store/flowStore';

interface PlayerStageProps {
  step: FlowStep;
  stepNumber: number;
  screenshotUrls: Record<string, string>;
  /** Compact layout when framed by embed header/footer chrome. */
  isEmbed?: boolean;
}

const screenshotClassName =
  'block max-h-[min(65vh,800px)] w-auto max-w-[calc(100vw-2.5rem)] object-contain';

const embedScreenshotClassName =
  'block max-h-[min(calc(100dvh-20rem),560px)] w-auto max-w-[calc(100vw-2.5rem)] object-contain';

const StageLoader = ({ isEmbed = false }: { isEmbed?: boolean }) => (
  <div
    className={`flex w-full min-w-[min(100%,20rem)] max-w-[calc(100vw-2rem)] items-center justify-center rounded-xl bg-slate-100 ${
      isEmbed ? 'min-h-[min(calc(100dvh-20rem),360px)]' : 'min-h-[min(50vh,520px)]'
    }`}
    aria-busy="true"
    aria-label="Loading step screenshot"
  >
    <PeacockStudioLoader size={isEmbed ? 80 : 96} />
  </div>
);

export const PlayerStage = ({
  step,
  stepNumber,
  screenshotUrls,
  isEmbed = false,
}: PlayerStageProps) => {
  const screenshotUrl = getStepScreenshotUrl(step, screenshotUrls);
  const markerPosition = getDisplayedStepMarkerPosition(step);
  const stepUrl = getStepUrl(step);
  const description = resolveStepDescription(step);
  const { isDetailsVisible, toggleDetails } = usePlayerStepDetailsVisibility(step.id);
  const stepResources = useFlowStore((state) => state.stepResources);
  const { isLoaded: isImageLoaded, hasError, imgRef, onLoad, onError } =
    useImageLoaded(screenshotUrl);

  const showOverlays = Boolean(screenshotUrl && isImageLoaded);
  const isScreenshotLoading = Boolean(screenshotUrl && !isImageLoaded && !hasError);
  const showNetworkBlocked =
    Boolean(screenshotUrl && hasError && isCloudHostedScreenshotUrl(screenshotUrl));
  const showGenericUnavailable = Boolean(screenshotUrl && hasError && !showNetworkBlocked);
  const imageClassName = isEmbed ? embedScreenshotClassName : screenshotClassName;

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center ${
        isEmbed ? 'gap-3' : 'gap-5'
      }`}
    >
      <PlayerStepMoreInfo step={step} stepResources={stepResources} isEmbed={isEmbed} />
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
            ) : showNetworkBlocked ? (
              <motion.div
                key={`${step.id}-network-blocked`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-lg px-2"
              >
                <CloudNetworkBlockedNotice
                  error={getCloudNetworkBlockedError()}
                  showLocalLibraryNote={false}
                />
              </motion.div>
            ) : showGenericUnavailable ? (
              <motion.div
                key={`${step.id}-unavailable`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full"
              >
                <BrowserMockup url={stepUrl} isEmbed={isEmbed}>
                  <div className="flex min-h-[200px] min-w-[min(100%,20rem)] items-center justify-center px-6 py-10 text-sm text-slate-500">
                    Screenshot unavailable
                  </div>
                </BrowserMockup>
              </motion.div>
            ) : (
              <motion.div
                key={`${step.id}-stage`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <BrowserMockup url={stepUrl} isEmbed={isEmbed}>
                  <div className="relative inline-block min-w-[min(100%,20rem)] p-3 sm:p-4">
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
                        isEmbed={isEmbed}
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
                                  isEmbed={isEmbed}
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
        <BrowserMockup url={stepUrl} isEmbed={isEmbed}>
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
                  isEmbed={isEmbed}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
};
