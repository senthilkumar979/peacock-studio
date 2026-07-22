import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';
import { ShareMethodPicker, type ShareMethod } from '@/components/share/ShareMethodPicker';
import { PdfExportBlockingOverlay } from '@/components/share/PdfExportBlockingOverlay';
import { exportProductTourPdf, tourHasExportableDemos } from '@/pdf/exportProductTourPdf';
import { getProductTour } from '@/storage/libraryRouter';
import type { ProductTour } from '@/types/productTour';
import {
  copyTextToClipboard,
  getProductTourEmbedCodePlaceholder,
  type ShareLinkAccessMode,
} from '@/utils/shareLink';
import { createProductTourShareUrl } from '@/services/shareLinkService';
import { isCloudSyncEnabled } from '@/cloud/config';
import { useCanEmbed, useCanExport, useCanShare } from '@/hooks/useOrganization';
import { notifyInfo, notifyPromise } from '@/utils/notify';

interface ShareProductTourModalProps {
  isOpen: boolean;
  tourId: string;
  tour?: ProductTour | null;
  onClose: () => void;
}

export const ShareProductTourModal = ({
  isOpen,
  tourId,
  tour: tourProp,
  onClose,
}: ShareProductTourModalProps) => {
  const canShare = useCanShare();
  const canExport = useCanExport();
  const canEmbed = useCanEmbed();
  const [method, setMethod] = useState<ShareMethod>('link');
  const [accessMode, setAccessMode] = useState<ShareLinkAccessMode>('readonly');
  const [presenterLink, setPresenterLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loadedTour, setLoadedTour] = useState<ProductTour | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [isShareUrlLoading, setIsShareUrlLoading] = useState(false);

  const tour = tourProp ?? loadedTour;
  const canExportPdf = tour ? tourHasExportableDemos(tour) : false;

  useEffect(() => {
    if (!isOpen) return;
    const preferred: ShareMethod = canShare ? 'link' : canExport ? 'pdf' : 'embed';
    setMethod(preferred);
    setAccessMode('readonly');
    setPresenterLink(false);
  }, [isOpen, canShare, canExport]);

  useEffect(() => {
    if (method === 'link' && !canShare) setMethod(canExport ? 'pdf' : 'embed');
    if (method === 'pdf' && !canExport) setMethod(canShare ? 'link' : 'embed');
    if (method === 'embed' && !canEmbed && (canShare || canExport)) {
      setMethod(canShare ? 'link' : 'pdf');
    }
  }, [method, canShare, canExport, canEmbed]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || tourProp) return;
    let cancelled = false;
    setIsLoading(true);
    void getProductTour(tourId)
      .then((nextTour) => {
        if (!cancelled) setLoadedTour(nextTour ?? null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, tourId, tourProp]);

  useEffect(() => {
    if (!isOpen || method !== 'link' || !canShare) return;

    let cancelled = false;
    setIsShareUrlLoading(true);

    void createProductTourShareUrl(tourId, {
      accessMode,
      presenter: presenterLink && accessMode === 'readonly',
    })
      .then((url) => {
        if (!cancelled) setShareUrl(url);
      })
      .finally(() => {
        if (!cancelled) setIsShareUrlLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, method, tourId, accessMode, presenterLink, canShare]);

  const handleClose = () => {
    if (isExporting) return;
    onClose();
  };

  const handlePrimaryAction = async () => {
    if (method === 'embed') {
      notifyInfo('Embed coming soon', 'Embed publishing is not available yet for this workspace.');
      return;
    }
    if (method === 'pdf') {
      if (!tour) return;
      setIsExporting(true);
      try {
        await notifyPromise(exportProductTourPdf(tour), {
          loading: 'Exporting PDF…',
          success: 'PDF exported',
          successDescription: 'Your download should start shortly.',
          context: 'Export product tour PDF',
        });
        onClose();
      } catch {
        // Toast already shown
      } finally {
        setIsExporting(false);
      }
      return;
    }
    try {
      const url = await notifyPromise(
        (async () => {
          const created = await createProductTourShareUrl(tourId, {
            accessMode,
            presenter: presenterLink && accessMode === 'readonly',
          });
          await copyTextToClipboard(created);
          return created;
        })(),
        {
          loading: 'Creating share link…',
          success: 'Link copied',
          successDescription: 'Share URL is on your clipboard.',
          context: 'Create product tour share link',
        },
      );
      void url;
      handleClose();
    } catch {
      // Toast already shown
    }
  };

  if (!isOpen) return null;

  const primaryDisabled =
    method === 'embed' ||
    isLoading ||
    isExporting ||
    (method === 'link' && isShareUrlLoading) || (method === 'pdf' && (!tour || !canExportPdf));

  return createPortal(
    <>
      <PdfExportBlockingOverlay isActive={isExporting} />
      <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-tour-title"
        className="flex max-h-[min(90vh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="share-tour-title" className="text-lg font-bold text-slate-900">
            Share product tour
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isExporting}
            className="rounded-lg p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading tour…
            </div>
          ) : (
            <>
              <ShareMethodPicker
                value={method}
                onChange={setMethod}
                disabled={isExporting}
                disabledMethods={{
                  link: !canShare,
                  pdf: !canExport || !canExportPdf,
                  embed: !canEmbed,
                }}
              />
              {method === 'embed' ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Embed code
                  </p>
                  <pre className="overflow-x-auto rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
                    {getProductTourEmbedCodePlaceholder(tourId)}
                  </pre>
                  <p className="text-xs text-slate-500">Embed support is coming soon.</p>
                </div>
              ) : null}
              {method === 'link' ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Link access
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {(['readonly', 'editable'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setAccessMode(mode)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                            accessMode === mode
                              ? 'border-peacock-500 bg-peacock-50 text-peacock-800'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {mode === 'readonly' ? 'Read-only' : 'Editable'}
                        </button>
                      ))}
                    </div>
                      <p className="text-xs text-slate-500">
                        {accessMode === 'readonly'
                          ? isCloudSyncEnabled()
                            ? 'Anyone with the link can view this tour without signing in.'
                            : 'Viewers can read the tour but cannot edit it.'
                          : isCloudSyncEnabled()
                            ? 'Signed-in workspace members can open the editor via this link.'
                            : 'Anyone with the link can open the editor for this tour.'}
                      </p>
                    </div>
                    {accessMode === 'readonly' ? (
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={presenterLink}
                        onChange={(event) => setPresenterLink(event.target.checked)}
                      />
                      Presenter mode link
                    </label>
                  ) : null}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Link preview
                    </p>
                    <p className="mt-2 break-all rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                      {isShareUrlLoading ? 'Generating share link…' : shareUrl || 'Share link unavailable'}
                    </p>
                  </div>
                </div>
              ) : null}
              {method === 'pdf' ? (
                <p className="text-sm text-slate-600">
                  {canExportPdf
                    ? 'Export a PDF for each demo in this tour.'
                    : 'Add demos to this tour before exporting PDFs.'}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isExporting}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          {method === 'embed' ? (
            <button type="button" disabled className="rounded-lg bg-slate-200 px-4 py-2 text-sm">
              Copy code — coming soon
            </button>
          ) : (
            <button
              type="button"
              disabled={primaryDisabled}
              onClick={() => void handlePrimaryAction()}
              className="rounded-lg bg-peacock-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {method === 'pdf' ? (isExporting ? 'Exporting…' : 'Export PDF') : 'Copy link'}
            </button>
          )}
        </div>
      </div>
    </div>
    </>,
    document.body,
  );
};
