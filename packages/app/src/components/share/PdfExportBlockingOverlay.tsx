import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';

interface PdfExportBlockingOverlayProps {
  isActive: boolean;
  message?: string;
}

export const PdfExportBlockingOverlay = ({
  isActive,
  message = 'Exporting PDF…',
}: PdfExportBlockingOverlayProps) => {
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive]);

  if (!isActive) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      aria-busy="true"
      aria-live="polite"
      role="alert"
    >
      <PeacockStudioLoader size={120} />
      <p className="mt-4 text-sm font-medium text-white">{message}</p>
      <p className="mt-1 text-xs text-slate-300">Please wait until the export finishes.</p>
    </div>,
    document.body,
  );
};
