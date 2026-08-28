import { useCallback, useState } from 'react';
import { copyCaptureBlobToClipboard, downloadCaptureBlob } from '@/capture-editor/exportCaptureImage';
import { renderCaptureComposite } from '@/capture-editor/renderCaptureComposite';
import { useCaptureEditorStore } from '@/store/captureEditorStore';

interface CaptureEditorSource {
  imageDataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
}

export function useCaptureEditorExport(source: CaptureEditorSource | null) {
  const settings = useCaptureEditorStore((state) => state.settings);
  const setStatusMessage = useCaptureEditorStore((state) => state.setStatusMessage);
  const undo = useCaptureEditorStore((state) => state.undo);
  const redo = useCaptureEditorStore((state) => state.redo);
  const canUndo = useCaptureEditorStore((state) => state.canUndo);
  const canRedo = useCaptureEditorStore((state) => state.canRedo);
  const [isExporting, setIsExporting] = useState(false);

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
      await downloadCaptureBlob(await exportComposite());
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
      await copyCaptureBlobToClipboard(await exportComposite());
      setStatusMessage('Copied edited screenshot to clipboard.');
    } catch (exportError) {
      setStatusMessage(exportError instanceof Error ? exportError.message : 'Copy failed.');
    } finally {
      setIsExporting(false);
    }
  }, [exportComposite, isExporting, setStatusMessage, source]);

  return {
    isExporting,
    undo,
    redo,
    canUndo,
    canRedo,
    handleCopy,
    handleDownload,
  };
}
