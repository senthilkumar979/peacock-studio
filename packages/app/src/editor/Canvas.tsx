import { useRef } from 'react';
import type { FlowStep } from '@peacock/shared';
import { getStepUrl, resolveStepDescription } from '@peacock/shared';
import { getDisplayedStepMarkerPosition } from '@/capture-editor/displayedStepMarker';
import { Button } from '@/components/ui';
import { useStepScreenshotEditor } from '@/editor/StepScreenshotEditorProvider';
import { getStepScreenshotUrl, useFlowStore } from '@/store/flowStore';
import { ClickMarker } from './ClickMarker';

interface CanvasProps {
  step: FlowStep | null;
}

export const Canvas = ({ step }: CanvasProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const { openEditor } = useStepScreenshotEditor();

  if (!step) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">
        Select a step to preview
      </div>
    );
  }

  const screenshotUrl = getStepScreenshotUrl(step, screenshotUrls);
  const markerPosition = getDisplayedStepMarkerPosition(step);
  const stepUrl = getStepUrl(step);
  const description = resolveStepDescription(step);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-base font-semibold text-slate-900">{step.title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        ) : null}
        <p className="mt-2 truncate text-xs text-slate-500" title={stepUrl}>
          {stepUrl}
        </p>
      </div>

      <div className="relative flex flex-1 items-start justify-center overflow-auto rounded-xl bg-slate-100 p-4">
        {screenshotUrl ? (
          <div className="relative inline-block max-w-full">
            <img
              ref={imageRef}
              src={screenshotUrl}
              alt={step.title}
              className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-md"
            />
            {markerPosition && (
              <ClickMarker
                xPercent={markerPosition.xPercent}
                yPercent={markerPosition.yPercent}
                imageRef={imageRef}
              />
            )}
            <div className="absolute right-2 top-2">
              <Button variant="secondary" onClick={() => openEditor(step.id)}>
                Edit screenshot
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-lg bg-white text-sm text-slate-500">
            {step.event.type === 'navigation' ? 'Navigation step (no screenshot)' : 'Screenshot unavailable'}
          </div>
        )}
      </div>
    </div>
  );
};
