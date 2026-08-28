import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui';
import { CaptureEditorWorkspace } from '@/capture-editor/CaptureEditorWorkspace';
import { useCaptureEditorExport } from '@/capture-editor/useCaptureEditorExport';
import { NewImageDropzone } from '@/pages/NewImageDropzone';
import { useCaptureEditorStore } from '@/store/captureEditorStore';
import { readImageNaturalSize } from '@/utils/readImageNaturalSize';

interface UploadedImage {
  imageDataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
}

export const NewImageEditor = () => {
  const resetSettings = useCaptureEditorStore((state) => state.resetSettings);
  const setStatusMessage = useCaptureEditorStore((state) => state.setStatusMessage);
  const [source, setSource] = useState<UploadedImage | null>(null);
  const {
    isExporting,
    undo,
    redo,
    canUndo,
    canRedo,
    handleCopy,
    handleDownload,
  } = useCaptureEditorExport(source);

  useEffect(() => {
    resetSettings();
  }, [resetSettings, source]);

  const handleLoaded = (dataUrl: string) => {
    void readImageNaturalSize(dataUrl)
      .then((size) => {
        setSource({
          imageDataUrl: dataUrl,
          naturalWidth: size.width,
          naturalHeight: size.height,
        });
      })
      .catch((error: unknown) => {
        setStatusMessage(
          error instanceof Error ? error.message : 'Could not open that image.',
        );
      });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader
        eyebrow="Peacock Capture Studio"
        title="Edit image"
        description="Upload a screenshot, then blur, crop, frame, and export. Nothing is saved."
        homeLink
      >
        {source ? (
          <>
            <Button variant="secondary" onClick={() => setSource(null)}>
              Replace image
            </Button>
            <Button variant="secondary" onClick={() => undo()} disabled={!canUndo()}>
              Undo
            </Button>
            <Button variant="secondary" onClick={() => redo()} disabled={!canRedo()}>
              Redo
            </Button>
            <Button
              variant="secondary"
              onClick={() => void handleCopy()}
              disabled={isExporting}
            >
              Copy edited
            </Button>
            <Button onClick={() => void handleDownload()} disabled={isExporting}>
              Download edited
            </Button>
          </>
        ) : null}
      </AppHeader>

      <main className="mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 flex-col gap-0 p-4 sm:p-6">
        {source ? (
          <CaptureEditorWorkspace
            imageDataUrl={source.imageDataUrl}
            naturalWidth={source.naturalWidth}
            naturalHeight={source.naturalHeight}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <NewImageDropzone onLoaded={handleLoaded} />
          </div>
        )}
      </main>
    </div>
  );
};
