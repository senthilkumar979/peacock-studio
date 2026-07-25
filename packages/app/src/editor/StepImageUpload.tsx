import { useRef, useState } from 'react';
import type { FlowStep } from '@peacock/shared';
import { getCapturedScreenshotId, hasCustomStepScreenshot } from '@peacock/shared';
import { Button } from '@/components/ui';
import { STEP_IMAGE_ACCEPT } from '@/constants/stepImageUpload';
import { readStepImageDataUrl } from '@/utils/stepImageFile';
import { useFlowStore } from '@/store/flowStore';

interface StepImageUploadProps {
  step: FlowStep;
}

export const StepImageUpload = ({ step }: StepImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const setStepCustomScreenshot = useFlowStore((state) => state.setStepCustomScreenshot);
  const resetStepScreenshot = useFlowStore((state) => state.resetStepScreenshot);

  const capturedScreenshotId = getCapturedScreenshotId(step);
  const hasCapturedImage = Boolean(capturedScreenshotId);
  const hasCustomImage = hasCustomStepScreenshot(step);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    void readStepImageDataUrl(file)
      .then((dataUrl) => {
        setStepCustomScreenshot(step.id, dataUrl);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Could not upload image.';
        setUploadError(message);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-slate-700">Step image</span>
      <p className="text-xs text-slate-500">
        JPEG, JPG, PNG, or SVG. Max 1 MB — larger raster images are compressed automatically.
        Replaces the captured screenshot for this step.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept={STEP_IMAGE_ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="disabled:opacity-60"
        >
          {isUploading ? 'Uploading…' : hasCustomImage ? 'Replace image' : 'Upload image'}
        </Button>

        {hasCustomImage && hasCapturedImage && (
          <Button
            variant="secondary"
            disabled={isUploading}
            onClick={() => {
              setUploadError(null);
              resetStepScreenshot(step.id);
            }}
            className="disabled:opacity-60"
          >
            Reset to captured
          </Button>
        )}
      </div>

      {hasCustomImage && (
        <p className="text-xs text-emerald-700">Using a custom image for this step.</p>
      )}

      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
    </div>
  );
};
