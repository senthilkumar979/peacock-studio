import { useCallback, useEffect, useState } from 'react';
import {
  FLOW_STEP_CAPTURE_EDITOR_SETTINGS,
  getStepScreenshotEditSourceId,
  getStepScreenshotEditSourceUrl,
  isFlowStep,
  type FlowStepScreenshotEdit,
} from '@peacock/shared';
import { Button } from '@/components/ui';
import { CaptureEditorWorkspace } from '@/capture-editor/CaptureEditorWorkspace';
import { cloneCaptureSettings } from '@/capture-editor/cloneCaptureSettings';
import { renderStepScreenshotDataUrl } from '@/editor/renderStepScreenshotDataUrl';
import { useCaptureEditorStore } from '@/store/captureEditorStore';
import { useFlowStore } from '@/store/flowStore';
import { materializeImageDataUrl } from '@/utils/materializeImageDataUrl';

interface StepScreenshotEditorOverlayProps {
  stepId: string;
  onClose: () => void;
}

export const StepScreenshotEditorOverlay = ({
  stepId,
  onClose,
}: StepScreenshotEditorOverlayProps) => {
  const step = useFlowStore((state) => state.steps.find((item) => item.id === stepId));
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls);
  const applyStepScreenshotEdit = useFlowStore((state) => state.applyStepScreenshotEdit);
  const hydrateSettings = useCaptureEditorStore((state) => state.hydrateSettings);
  const resetSettings = useCaptureEditorStore((state) => state.resetSettings);
  const settings = useCaptureEditorStore((state) => state.settings);
  const undo = useCaptureEditorStore((state) => state.undo);
  const redo = useCaptureEditorStore((state) => state.redo);
  const canUndo = useCaptureEditorStore((state) => state.canUndo);
  const canRedo = useCaptureEditorStore((state) => state.canRedo);
  const setStatusMessage = useCaptureEditorStore((state) => state.setStatusMessage);

  const [source, setSource] = useState<{
    dataUrl: string;
    width: number;
    height: number;
    sourceScreenshotId: string;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!step || !isFlowStep(step)) {
      setLoadError('Step not found.');
      return;
    }

    const sourceUrl = getStepScreenshotEditSourceUrl(step, screenshotUrls);
    const sourceScreenshotId = getStepScreenshotEditSourceId(step);
    if (!sourceUrl || !sourceScreenshotId) {
      setLoadError('This step has no screenshot to edit.');
      return;
    }

    const seed = step.screenshotEdit?.settings ?? FLOW_STEP_CAPTURE_EDITOR_SETTINGS;
    hydrateSettings(cloneCaptureSettings(seed));

    let cancelled = false;
    void materializeImageDataUrl(sourceUrl)
      .then((loaded) => {
        if (cancelled) return;
        setSource({ ...loaded, sourceScreenshotId });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : 'Could not load screenshot.');
      });

    return () => {
      cancelled = true;
      resetSettings();
    };
  }, [hydrateSettings, resetSettings, screenshotUrls, step]);

  const handleApply = useCallback(async () => {
    if (!source || !step || !isFlowStep(step) || isApplying) return;
    setIsApplying(true);
    try {
      const dataUrl = await renderStepScreenshotDataUrl({
        imageDataUrl: source.dataUrl,
        naturalWidth: source.width,
        naturalHeight: source.height,
        settings,
      });
      const edit: FlowStepScreenshotEdit = {
        sourceScreenshotId: source.sourceScreenshotId,
        sourceWidth: source.width,
        sourceHeight: source.height,
        settings: cloneCaptureSettings(settings),
      };
      applyStepScreenshotEdit(step.id, dataUrl, edit);
      onClose();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Could not apply screenshot edits.');
    } finally {
      setIsApplying(false);
    }
  }, [applyStepScreenshotEdit, isApplying, onClose, setStatusMessage, settings, source, step]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Edit screenshot
          </p>
          <h2 className="text-base font-semibold text-slate-900">
            {step && isFlowStep(step) ? step.title || 'Untitled step' : 'Screenshot'}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => undo()} disabled={!canUndo()}>
            Undo
          </Button>
          <Button variant="secondary" onClick={() => redo()} disabled={!canRedo()}>
            Redo
          </Button>
          <Button onClick={() => void handleApply()} disabled={!source || isApplying}>
            {isApplying ? 'Applying…' : 'Apply to step'}
          </Button>
        </div>
      </div>

      {loadError ? (
        <div className="flex flex-1 items-center justify-center p-8 text-sm text-slate-600">
          {loadError}
        </div>
      ) : source ? (
        <div className="mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 flex-col p-4 sm:p-6">
          <CaptureEditorWorkspace
            imageDataUrl={source.dataUrl}
            naturalWidth={source.width}
            naturalHeight={source.height}
            showBackgroundPresets={false}
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
          Loading screenshot…
        </div>
      )}
    </div>
  );
};
