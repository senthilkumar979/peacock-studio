import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';
import { ShareLinkPanel } from '@/components/share/ShareLinkPanel';
import { ShareMethodPicker, type ShareMethod } from '@/components/share/ShareMethodPicker';
import { exportRoutePdf, routeHasExportablePeacocks } from '@/pdf/exportRoutePdf';
import { getRoute } from '@/storage/flowLibraryDb';
import type { FlowShareSettings } from '@/types/savedFlow';
import type { SavedRoute } from '@/types/route';
import {
  buildSharedRouteUrl,
  copyTextToClipboard,
  getRouteEmbedCodePlaceholder,
  type ShareLinkAccessMode,
} from '@/utils/shareLink';

interface ShareRouteModalProps {
  isOpen: boolean;
  routeId: string;
  route?: SavedRoute | null;
  onClose: () => void;
}

const EMPTY_BRANCH_SETTINGS: FlowShareSettings = {
  includeMainFlow: true,
  enabledPathIds: [],
  enabledBranchIds: [],
};

export const ShareRouteModal = ({
  isOpen,
  routeId,
  route: routeProp,
  onClose,
}: ShareRouteModalProps) => {
  const [method, setMethod] = useState<ShareMethod>('link');
  const [accessMode, setAccessMode] = useState<ShareLinkAccessMode>('readonly');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loadedRoute, setLoadedRoute] = useState<SavedRoute | null>(null);

  const route = routeProp ?? loadedRoute;
  const shareUrl = buildSharedRouteUrl(routeId, accessMode);
  const canExportPdf = route ? routeHasExportablePeacocks(route) : false;

  useEffect(() => {
    if (!isOpen) return;
    setMethod('link');
    setAccessMode('readonly');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || routeProp) return;
    let cancelled = false;
    setIsLoading(true);
    void getRoute(routeId)
      .then((nextRoute) => {
        if (!cancelled) setLoadedRoute(nextRoute ?? null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, routeId, routeProp]);

  const handlePrimaryAction = async () => {
    if (method === 'embed') return;
    if (method === 'pdf') {
      if (!route) return;
      setIsExporting(true);
      try {
        await exportRoutePdf(route);
        onClose();
      } finally {
        setIsExporting(false);
      }
      return;
    }
    await copyTextToClipboard(shareUrl);
    onClose();
  };

  if (!isOpen) return null;

  const primaryDisabled =
    method === 'embed' ||
    isLoading ||
    isExporting ||
    (method === 'pdf' && (!route || !canExportPdf));

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-route-title"
        className="flex max-h-[min(90vh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="share-route-title" className="text-lg font-bold text-slate-900">
            Share route
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading route…
            </div>
          ) : (
            <>
              <ShareMethodPicker value={method} onChange={setMethod} />
              {method === 'embed' ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Embed code
                  </p>
                  <pre className="overflow-x-auto rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
                    {getRouteEmbedCodePlaceholder(routeId)}
                  </pre>
                  <p className="text-xs text-slate-500">Embed support is coming soon.</p>
                </div>
              ) : null}
              {method === 'link' ? (
                <ShareLinkPanel
                  accessMode={accessMode}
                  shareUrl={shareUrl}
                  hasBranches={false}
                  branches={[]}
                  branchSettings={EMPTY_BRANCH_SETTINGS}
                  onAccessModeChange={setAccessMode}
                  onBranchSettingsChange={() => undefined}
                />
              ) : null}
              {method === 'pdf' ? (
                <p className="text-sm text-slate-600">
                  {canExportPdf
                    ? 'Export a PDF for each demo linked in this route.'
                    : 'Add demos to this route before exporting PDFs.'}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 p-5">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            Cancel
          </button>
          {method === 'embed' ? (
            <button
              type="button"
              disabled
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500"
            >
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
    </div>,
    document.body,
  );
};
