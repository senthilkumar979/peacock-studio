import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { ResourceNotFoundPage } from '@/components/errors/ResourceNotFoundPage';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { CaptureEditorCanvas } from '@/capture-editor/CaptureEditorCanvas';
import { CaptureEditorSidebar } from '@/capture-editor/CaptureEditorSidebar';
import { CaptureEditorToolbar } from '@/capture-editor/CaptureEditorToolbar';
import { copyCaptureBlobToClipboard, downloadCaptureBlob } from '@/capture-editor/exportCaptureImage';
import { renderCaptureComposite } from '@/capture-editor/renderCaptureComposite';
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
  const settings = useCaptureEditorStore((state) => state.settings);
  const statusMessage = useCaptureEditorStore((state) => state.statusMessage);
  const setStatusMessage = useCaptureEditorStore((state) => state.setStatusMessage);
  const undo = useCaptureEditorStore((state) => state.undo);
  const redo = useCaptureEditorStore((state) => state.redo);
  const canUndo = useCaptureEditorStore((state) => state.canUndo);
  const canRedo = useCaptureEditorStore((state) => state.canRedo);
  const [isExporting, setIsExporting] = useState(false);
  const resetSettings = useCaptureEditorStore((state) => state.resetSettings);

  useEffect(() => {
    resetSettings();
  }, [captureId, resetSettings]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(''), 5000);
    return () => window.clearTimeout(timer);
  }, [statusMessage, setStatusMessage]);

  const exportComposite = useCallback(async () => {
    if (!source) throw new Error('Screenshot not loaded');
    return renderCaptureComposite({
      imageDataUrl: source.imageDataUrl,
      naturalWidth: source.naturalWidth,
      naturalHeight: source.naturalHeight,
      settings,
    });
  }, [settings, source]);

  const handleDownload = useCallback(async () => {
    if (!source || isExporting) return;
    setIsExporting(true);
    try {
      const blob = await exportComposite();
      await downloadCaptureBlob(blob);
      setStatusMessage('Downloaded edited screenshot.');
    } catch (exportError) {
      setStatusMessage(
        exportError instanceof Error ? exportError.message : 'Download failed.',
      );
    } finally {
      setIsExporting(false);
    }
  }, [exportComposite, isExporting, setStatusMessage, source]);

  const handleCopy = useCallback(async () => {
    if (!source || isExporting) return;
    setIsExporting(true);
    try {
      const blob = await exportComposite();
      await copyCaptureBlobToClipboard(blob);
      setStatusMessage('Copied edited screenshot to clipboard.');
    } catch (exportError) {
      setStatusMessage(exportError instanceof Error ? exportError.message : 'Copy failed.');
    } finally {
      setIsExporting(false);
    }
  }, [exportComposite, isExporting, setStatusMessage, source]);

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
        <button
          type="button"
          onClick={() => undo()}
          disabled={!canUndo()}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => redo()}
          disabled={!canRedo()}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Redo
        </button>
        <button
          type="button"
          onClick={() => void handleCopy()}
          disabled={isExporting}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Copy edited
        </button>
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={isExporting}
          className="btn-peacock"
        >
          Download edited
        </button>
      </AppHeader>

      {statusMessage ? (
        <p className="border-b border-peacock-100 bg-peacock-50 px-6 py-2 text-center text-sm text-peacock-800">
          {statusMessage}
        </p>
      ) : null}

      <main className="mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 flex-col gap-0 p-4 sm:p-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CaptureEditorToolbar />
          <div className="flex min-h-0 flex-1 gap-0">
            <CaptureEditorSidebar />
            <CaptureEditorCanvas
              imageDataUrl={source.imageDataUrl}
              naturalWidth={source.naturalWidth}
              naturalHeight={source.naturalHeight}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
