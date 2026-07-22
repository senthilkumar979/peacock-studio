import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';
import { collectAllBranches, type FlowOutlineItem, type FlowPayload } from '@peacock/shared';
import { ShareLinkPanel } from '@/components/share/ShareLinkPanel';
import { ShareMethodPicker, type ShareMethod } from '@/components/share/ShareMethodPicker';
import { SharePdfPathOptions } from '@/components/share/SharePdfPathOptions';
import { PdfExportBlockingOverlay } from '@/components/share/PdfExportBlockingOverlay';
import { exportFlowPdf } from '@/pdf/exportFlowPdf';
import { getFlowDocument } from '@/services/flowLibraryService';
import { createDocumentShareUrl } from '@/services/shareLinkService';
import { isCloudSyncEnabled } from '@/cloud/config';
import type { FlowShareSettings } from '@/types/savedFlow';
import { resolveShareSettings } from '@/utils/flowShareSettings';
import {
  buildDefaultPdfPathSelections,
  hasCompletePdfPathSelections,
} from '@/utils/pdfPathSelection';
import {
  copyTextToClipboard,
  getEmbedCodePlaceholder,
  type ShareLinkAccessMode,
} from '@/utils/shareLink';
import { useCanEmbed, useCanExport, useCanShare } from '@/hooks/useOrganization';
import { notifyError, notifyInfo, notifyPromise } from '@/utils/notify';

interface ShareDocumentModalProps {
  isOpen: boolean;
  documentId: string;
  onClose: () => void;
  flow?: FlowPayload | null;
  steps?: FlowOutlineItem[];
  screenshotUrls?: Record<string, string>;
  shareSettings?: FlowShareSettings;
  onShareSettingsSave?: (settings: FlowShareSettings) => void;
}

export const ShareDocumentModal = ({
  isOpen,
  documentId,
  onClose,
  flow: flowProp,
  steps: stepsProp,
  screenshotUrls: screenshotUrlsProp,
  shareSettings: shareSettingsProp,
  onShareSettingsSave,
}: ShareDocumentModalProps) => {
  const canShare = useCanShare();
  const canExport = useCanExport();
  const canEmbed = useCanEmbed();
  const [method, setMethod] = useState<ShareMethod>('link');
  const [accessMode, setAccessMode] = useState<ShareLinkAccessMode>('readonly');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loaded, setLoaded] = useState<{
    flow: FlowPayload;
    steps: FlowOutlineItem[];
    screenshotUrls: Record<string, string>;
    shareSettings?: FlowShareSettings;
  } | null>(null);

  const flow = flowProp ?? loaded?.flow ?? null;
  const steps = stepsProp ?? loaded?.steps ?? [];
  const screenshotUrls = screenshotUrlsProp ?? loaded?.screenshotUrls ?? {};
  const branches = useMemo(() => collectAllBranches(steps), [steps]);
  const hasBranches = branches.length > 0;

  const defaultBranchSettings = useMemo(
    () => resolveShareSettings(steps, shareSettingsProp ?? loaded?.shareSettings),
    [steps, shareSettingsProp, loaded?.shareSettings],
  );
  const [branchSettings, setBranchSettings] = useState(defaultBranchSettings);
  const [shareUrl, setShareUrl] = useState('');
  const [isShareUrlLoading, setIsShareUrlLoading] = useState(false);

  const defaultPdfPathSelections = useMemo(
    () => buildDefaultPdfPathSelections(branches),
    [branches],
  );
  const [pdfPathSelections, setPdfPathSelections] = useState(defaultPdfPathSelections);

  useEffect(() => {
    if (!isOpen) return;
    const preferred: ShareMethod = canShare ? 'link' : canExport ? 'pdf' : 'embed';
    setMethod(preferred);
    setAccessMode('readonly');
    setBranchSettings(defaultBranchSettings);
    setPdfPathSelections(defaultPdfPathSelections);
  }, [isOpen, defaultBranchSettings, defaultPdfPathSelections, canShare, canExport]);

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
    if (!isOpen || flowProp || stepsProp) return;
    let cancelled = false;
    setIsLoading(true);
    void getFlowDocument(documentId)
      .then((doc) => {
        if (cancelled || !doc) return;
        setLoaded({
          flow: doc.flow,
          steps: doc.steps,
          screenshotUrls: doc.screenshotUrls,
          shareSettings: doc.shareSettings,
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, documentId, flowProp, stepsProp]);

  useEffect(() => {
    if (!isOpen || method !== 'link' || !canShare) return;

    let cancelled = false;
    setIsShareUrlLoading(true);

    const branchShareSettings =
      hasBranches && accessMode === 'readonly'
        ? { ...branchSettings, includeMainFlow: true }
        : undefined;

    void createDocumentShareUrl(documentId, {
      accessMode,
      viewMode: 'doc',
      shareSettings: branchShareSettings,
    })
      .then((url) => {
        if (!cancelled) setShareUrl(url);
      })
      .catch((error) => {
        if (!cancelled) {
          notifyError(error, 'Create document share link');
          setShareUrl('');
        }
      })
      .finally(() => {
        if (!cancelled) setIsShareUrlLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, method, documentId, accessMode, branchSettings, hasBranches, canShare]);

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
      if (!flow) return;
      setIsExporting(true);
      try {
        await notifyPromise(
          exportFlowPdf({
            flow,
            steps,
            screenshotUrls,
            pathSelections: hasBranches ? pdfPathSelections : undefined,
          }),
          {
            loading: 'Exporting PDF…',
            success: 'PDF exported',
            successDescription: 'Your download should start shortly.',
            context: 'Export flow PDF',
          },
        );
        onClose();
      } catch {
        // Toast already shown
      } finally {
        setIsExporting(false);
      }
      return;
    }
    try {
      if (hasBranches && accessMode === 'readonly') {
        onShareSettingsSave?.({ ...branchSettings, includeMainFlow: true });
      }
      const branchShareSettings =
        hasBranches && accessMode === 'readonly'
          ? { ...branchSettings, includeMainFlow: true }
          : undefined;
      const url = await notifyPromise(
        (async () => {
          const created = await createDocumentShareUrl(documentId, {
            accessMode,
            viewMode: 'doc',
            shareSettings: branchShareSettings,
          });
          await copyTextToClipboard(created);
          return created;
        })(),
        {
          loading: 'Creating share link…',
          success: 'Link copied',
          successDescription: 'Share URL is on your clipboard.',
          context: 'Create document share link',
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
    (method === 'link' && isShareUrlLoading) ||
    (method === 'pdf' && !flow) ||
    (method === 'pdf' && hasBranches && !hasCompletePdfPathSelections(branches, pdfPathSelections));

  return createPortal(
    <>
      <PdfExportBlockingOverlay isActive={isExporting} />
      <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-document-title"
        className="flex max-h-[min(90vh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="share-document-title" className="text-lg font-bold text-slate-900">
            Share documentation
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
              Loading document…
            </div>
          ) : (
            <>
              <ShareMethodPicker
                value={method}
                onChange={setMethod}
                disabled={isExporting}
                disabledMethods={{
                  link: !canShare,
                  pdf: !canExport,
                  embed: !canEmbed,
                }}
              />
              {method === 'embed' ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Embed code
                  </p>
                  <pre className="overflow-x-auto rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
                    {getEmbedCodePlaceholder(documentId)}
                  </pre>
                  <p className="text-xs text-slate-500">Embed support is coming soon.</p>
                </div>
              ) : null}
              {method === 'link' ? (
                <ShareLinkPanel
                  accessMode={accessMode}
                  shareUrl={shareUrl}
                  usesTokenLinks={isCloudSyncEnabled()}
                  isShareUrlLoading={isShareUrlLoading}
                  hasBranches={hasBranches}
                  branches={branches}
                  branchSettings={branchSettings}
                  onAccessModeChange={setAccessMode}
                  onBranchSettingsChange={setBranchSettings}
                />
              ) : null}
              {method === 'pdf' ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    {hasBranches
                      ? 'Export a PDF with main flow steps, branch highlights, and steps from your selected paths.'
                      : 'Export this documentation as a PDF with all playable steps and screenshots.'}
                  </p>
                  {hasBranches ? (
                    <SharePdfPathOptions
                      branches={branches}
                      selections={pdfPathSelections}
                      onChange={setPdfPathSelections}
                    />
                  ) : null}
                </div>
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
    </div>
    </>,
    document.body,
  );
};
