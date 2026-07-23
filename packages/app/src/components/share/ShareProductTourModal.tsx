import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';
import { ShareLinkManagePanel } from '@/components/share/ShareLinkManagePanel';
import { ShareLinkSecurityOptions } from '@/components/share/ShareLinkSecurityOptions';
import { ShareMethodPicker, type ShareMethod } from '@/components/share/ShareMethodPicker';
import { PdfExportBlockingOverlay } from '@/components/share/PdfExportBlockingOverlay';
import { Button } from '@/components/ui';
import { exportProductTourPdf, tourHasExportableDemos } from '@/pdf/exportProductTourPdf';
import { getProductTour } from '@/storage/libraryRouter';
import type { ProductTour } from '@/types/productTour';
import {
  copyTextToClipboard,
  type ShareLinkAccessMode,
} from '@/utils/shareLink';
import { expiresAtFromPreset, type ShareExpiryPreset } from '@/utils/shareExpiry';
import { createProductTourEmbedCode, createProductTourShareUrl } from '@/services/shareLinkService';
import { isCloudSyncEnabled } from '@/cloud/config';
import { useShareMethodAccess } from '@/hooks/useOrganization';
import { notifyError, notifyPromise } from '@/utils/notify';
import { AnalyticsEvents } from '@/analytics/events';

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
  const { canShare, canExport, canEmbed, disabledReasons } = useShareMethodAccess();
  const [method, setMethod] = useState<ShareMethod>('link');
  const [accessMode, setAccessMode] = useState<ShareLinkAccessMode>('readonly');
  const [presenterLink, setPresenterLink] = useState(false);
  const [expiryPreset, setExpiryPreset] = useState<ShareExpiryPreset>('never');
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [manageRefreshKey, setManageRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loadedTour, setLoadedTour] = useState<ProductTour | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [isShareUrlLoading, setIsShareUrlLoading] = useState(false);
  const [embedCode, setEmbedCode] = useState('');

  const tour = tourProp ?? loadedTour;
  const canExportPdf = tour ? tourHasExportableDemos(tour) : false;

  useEffect(() => {
    if (!isOpen) return;
    const preferred: ShareMethod = canShare
      ? 'link'
      : canExport
        ? 'pdf'
        : canEmbed
          ? 'embed'
          : 'pdf';
    setMethod(preferred);
    setAccessMode('readonly');
    setPresenterLink(false);
    setExpiryPreset('never');
    setRequiresAuth(false);
    setEmbedCode('');
  }, [isOpen, canShare, canExport, canEmbed]);

  useEffect(() => {
    if (method === 'link' && !canShare) {
      setMethod(canExport ? 'pdf' : canEmbed ? 'embed' : 'pdf');
      return;
    }
    if (method === 'pdf' && !canExport) {
      setMethod(canShare ? 'link' : canEmbed ? 'embed' : 'link');
      return;
    }
    if (method === 'embed' && !canEmbed) {
      setMethod(canShare ? 'link' : canExport ? 'pdf' : 'link');
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
      expiresAt: expiresAtFromPreset(expiryPreset),
      requiresAuth: accessMode === 'readonly' ? requiresAuth : false,
    })
      .then((url) => {
        if (!cancelled) {
          setShareUrl(url);
          setManageRefreshKey((key) => key + 1);
        }
      })
      .finally(() => {
        if (!cancelled) setIsShareUrlLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, method, tourId, accessMode, presenterLink, canShare, expiryPreset, requiresAuth]);

  const handleClose = () => {
    if (isExporting) return;
    onClose();
  };

  const handlePrimaryAction = async () => {
    if (method === 'embed') {
      if (!canEmbed) {
        notifyError('Embed not allowed', 'Your workspace role cannot publish embeds.');
        return;
      }
      try {
        const { iframeCode } = await notifyPromise(
          createProductTourEmbedCode(tourId, { title: tour?.title }),
          {
            loading: 'Creating embed…',
            success: 'Embed code copied',
            successDescription: 'Paste the iframe into your site.',
            context: 'Create product tour embed',
            event: AnalyticsEvents.tourEmbedded,
            eventProps: { tour_id: tourId },
          },
        );
        setEmbedCode(iframeCode);
        await copyTextToClipboard(iframeCode);
        handleClose();
      } catch {
        // Toast already shown
      }
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
          event: AnalyticsEvents.tourPdfExported,
          eventProps: { tour_id: tourId },
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
            expiresAt: expiresAtFromPreset(expiryPreset),
            requiresAuth: accessMode === 'readonly' ? requiresAuth : false,
          });
          await copyTextToClipboard(created);
          return created;
        })(),
        {
          loading: 'Creating share link…',
          success: 'Link copied',
          successDescription: 'Share URL is on your clipboard.',
          context: 'Create product tour share link',
          event: AnalyticsEvents.tourShared,
          eventProps: { tour_id: tourId, access_mode: accessMode },
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
    isLoading ||
    isExporting ||
    (method === 'embed' && !canEmbed) ||
    (method === 'link' && isShareUrlLoading) ||
    (method === 'pdf' && (!tour || !canExportPdf));

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
                disabledReasons={{
                  ...disabledReasons,
                  ...(!canExportPdf
                    ? { pdf: 'Add demos to this tour before exporting PDFs.' }
                    : {}),
                }}
              />
              {method === 'embed' ? (
                canEmbed ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      Copy an iframe with a unique Peacock embed URL. Loads are tracked per embedding
                      domain, with a Peacock Studio watermark on the player.
                    </p>
                    <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                      {embedCode ||
                        `<iframe src="https://…/s/your-unique-token/embed" title="Peacock Studio tour" width="1280" height="720" …></iframe>`}
                    </pre>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {disabledReasons.embed ?? 'Embed is not available for this session.'}
                  </div>
                )
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
                    <p className="mt-2 text-xs text-slate-500">
                      {accessMode === 'readonly'
                        ? isCloudSyncEnabled()
                          ? requiresAuth
                            ? 'Viewers must sign in before this tour loads.'
                            : 'Anyone with the link can view until it expires or is revoked.'
                          : 'Viewers can read the tour but cannot edit it.'
                        : isCloudSyncEnabled()
                          ? 'Signed-in workspace members can open the editor via this link.'
                          : 'Anyone with the link can open the editor for this tour.'}
                    </p>
                  </div>
                  {isCloudSyncEnabled() ? (
                    <ShareLinkSecurityOptions
                      accessMode={accessMode}
                      expiryPreset={expiryPreset}
                      requiresAuth={requiresAuth}
                      onExpiryPresetChange={setExpiryPreset}
                      onRequiresAuthChange={setRequiresAuth}
                    />
                  ) : null}
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
                      {isShareUrlLoading
                        ? 'Generating share link…'
                        : shareUrl || 'Share link unavailable'}
                    </p>
                  </div>
                  {isCloudSyncEnabled() ? (
                    <ShareLinkManagePanel
                      resourceType="tour"
                      resourceId={tourId}
                      refreshKey={manageRefreshKey}
                    />
                  ) : null}
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
          <Button variant="secondary" onClick={handleClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button disabled={primaryDisabled} onClick={() => void handlePrimaryAction()}>
            {method === 'embed'
              ? 'Copy embed code'
              : method === 'pdf'
                ? isExporting
                  ? 'Exporting…'
                  : 'Export PDF'
                : 'Copy link'}
          </Button>
        </div>
      </div>
    </div>
    </>,
    document.body,
  );
};
