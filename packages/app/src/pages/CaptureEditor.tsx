import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { ResourceNotFoundPage } from '@/components/errors/ResourceNotFoundPage';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { Button } from '@/components/ui';
import { CaptureEditorWorkspace } from '@/capture-editor/CaptureEditorWorkspace';
import { useCaptureEditorExport } from '@/capture-editor/useCaptureEditorExport';
import { useCaptureSource } from '@/hooks/useCaptureSource';
import { useCaptureEditorStore } from '@/store/captureEditorStore';

function getModeLabel(mode: string): string {
  if (mode === 'full-page') return 'Full page capture';
  if (mode === 'selection') return 'Selection capture';
  return 'Visible area capture';
}

export const CaptureEditor = () => {
  const { captureId } = useParams<{ captureId: string }>();
  const { source, isLoading, error } = useCaptureSource(captureId);
  const resetSettings = useCaptureEditorStore((state) => state.resetSettings);
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
  }, [captureId, resetSettings]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <PeacockStudioLoader size={160} />
        <p className="text-sm text-slate-500">Loading screenshot from extension…</p>
      </div>
    );
  }

  if (error || !source) {
    return (
      <ResourceNotFoundPage
        title="Could not open capture editor"
        description={error ?? 'This capture was not found or is no longer available.'}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader
        eyebrow="Peacock Capture Studio"
        title={getModeLabel(source.mode)}
        description="Frame your screenshot, then export the edited version."
        homeLink
      >
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
      </AppHeader>

      <main className="mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 flex-col gap-0 p-4 sm:p-6">
        <CaptureEditorWorkspace
          imageDataUrl={source.imageDataUrl}
          naturalWidth={source.naturalWidth}
          naturalHeight={source.naturalHeight}
        />
      </main>
    </div>
  );
};
