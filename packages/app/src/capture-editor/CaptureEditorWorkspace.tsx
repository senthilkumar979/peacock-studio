import { useEffect } from 'react';
import { CaptureEditorCanvas } from '@/capture-editor/CaptureEditorCanvas';
import { CaptureEditorSidebar } from '@/capture-editor/CaptureEditorSidebar';
import { CaptureEditorToolbar } from '@/capture-editor/CaptureEditorToolbar';
import { useCaptureEditorStore } from '@/store/captureEditorStore';

interface CaptureEditorWorkspaceProps {
  imageDataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  showBackgroundPresets?: boolean;
}

export const CaptureEditorWorkspace = ({
  imageDataUrl,
  naturalWidth,
  naturalHeight,
  showBackgroundPresets = true,
}: CaptureEditorWorkspaceProps) => {
  const statusMessage = useCaptureEditorStore((state) => state.statusMessage);
  const setStatusMessage = useCaptureEditorStore((state) => state.setStatusMessage);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(''), 5000);
    return () => window.clearTimeout(timer);
  }, [statusMessage, setStatusMessage]);

  return (
    <>
      {statusMessage ? (
        <p className="border-b border-peacock-100 bg-peacock-50 px-6 py-2 text-center text-sm text-peacock-800">
          {statusMessage}
        </p>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CaptureEditorToolbar />
        <div className="flex min-h-0 flex-1 gap-0">
          <CaptureEditorSidebar showBackgroundPresets={showBackgroundPresets} />
          <CaptureEditorCanvas
            imageDataUrl={imageDataUrl}
            naturalWidth={naturalWidth}
            naturalHeight={naturalHeight}
          />
        </div>
      </div>
    </>
  );
};
