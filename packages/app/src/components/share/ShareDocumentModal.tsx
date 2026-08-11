import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';
import { collectAllBranches, type FlowOutlineItem, type FlowPayload } from '@peacock/shared';
import { ShareLinkPanel } from '@/components/share/ShareLinkPanel';
import { ShareLinkManagePanel } from '@/components/share/ShareLinkManagePanel';
import { ShareMethodPicker, type ShareMethod } from '@/components/share/ShareMethodPicker';
import { SharePdfPathOptions } from '@/components/share/SharePdfPathOptions';
import { PdfExportBlockingOverlay } from '@/components/share/PdfExportBlockingOverlay';
import { Button } from '@/components/ui';
import { exportFlowPdf } from '@/pdf/exportFlowPdf';
import { getFlowDocument } from '@/services/flowLibraryService';
import { createDocumentEmbedCode, createDocumentShareUrl } from '@/services/shareLinkService';
import { EmbedPublicAccessNote } from '@/components/share/EmbedPublicAccessNote';
import { GuestShareAccessNotice } from '@/components/share/GuestShareAccessNotice';
import { isCloudSyncEnabled } from '@/cloud/config';
import type { FlowDocumentStatus, FlowShareSettings } from '@/types/savedFlow';
import { resolveShareSettings } from '@/utils/flowShareSettings';
import {
  buildDefaultPdfPathSelections,
  hasCompletePdfPathSelections,
} from '@/utils/pdfPathSelection';
import {
  copyTextToClipboard,
  type ShareLinkAccessMode,
} from '@/utils/shareLink';
import { expiresAtFromPreset, type ShareExpiryPreset } from '@/utils/shareExpiry';
import { useShareMethodAccess } from '@/hooks/useOrganization';
import { useIsGuestSession } from '@/hooks/useSessionMode';
import { notifyError, notifyPromise } from '@/utils/notify';
import { AnalyticsEvents } from '@/analytics/events';

interface ShareDocumentModalProps {
  isOpen: boolean;
  documentId: string;
  onClose: () => void;
  flow?: FlowPayload | null;
  steps?: FlowOutlineItem[];
  screenshotUrls?: Record<string, string>;
  shareSettings?: FlowShareSettings;
  status?: FlowDocumentStatus;
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
  status: statusProp,
  onShareSettingsSave,
}: ShareDocumentModalProps) => {
  const { canShare, canExport, canEmbed, disabledReasons } = useShareMethodAccess();
  const isGuest = useIsGuestSession();
  const [method, setMethod] = useState<ShareMethod>('link');
  const [accessMode, setAccessMode] = useState<ShareLinkAccessMode>('readonly');
  const [presenterLink, setPresenterLink] = useState(false);
  const [expiryPreset, setExpiryPreset] = useState<ShareExpiryPreset>('never');
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [manageRefreshKey, setManageRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loaded, setLoaded] = useState<{
    flow: FlowPayload;
    steps: FlowOutlineItem[];
    screenshotUrls: Record<string, string>;
    shareSettings?: FlowShareSettings;
    status: FlowDocumentStatus;
  } | null>(null);

  const flow = flowProp ?? loaded?.flow ?? null;
  const steps = stepsProp ?? loaded?.steps ?? [];
  const screenshotUrls = screenshotUrlsProp ?? loaded?.screenshotUrls ?? {};
  const documentStatus = statusProp ?? loaded?.status ?? 'live';
  const isDraft = documentStatus === 'draft';
  const canSharePublicly = canShare && !isDraft;
  const canEmbedPublicly = canEmbed && !isDraft;
  const branches = useMemo(() => collectAllBranches(steps), [steps]);
  const hasBranches = branches.length > 0;

  const defaultBranchSettings = useMemo(
    () => resolveShareSettings(steps, shareSettingsProp ?? loaded?.shareSettings),
    [steps, shareSettingsProp, loaded?.shareSettings],
  );
  const [branchSettings, setBranchSettings] = useState(defaultBranchSettings);
  const [shareUrl, setShareUrl] = useState('');
  const [isShareUrlLoading, setIsShareUrlLoading] = useState(false);
  const [embedCode, setEmbedCode] = useState('');

  const defaultPdfPathSelections = useMemo(
    () => buildDefaultPdfPathSelections(branches),
    [branches],
  );
  const [pdfPathSelections, setPdfPathSelections] = useState(defaultPdfPathSelections);

  useEffect(() => {
    if (!isOpen) return;
    const preferred: ShareMethod = canSharePublicly
      ? 'link'
      : canExport
        ? 'pdf'
        : canEmbedPublicly
          ? 'embed'
          : 'pdf';
    setMethod(preferred);
    setAccessMode('readonly');
    setPresenterLink(false);
    setExpiryPreset('never');
    setRequiresAuth(false);
    setBranchSettings(defaultBranchSettings);
    setPdfPathSelections(defaultPdfPathSelections);
    setEmbedCode('');
  }, [
    isOpen,
    defaultBranchSettings,
    defaultPdfPathSelections,
    canSharePublicly,
    canExport,
    canEmbedPublicly,
  ]);

  useEffect(() => {
    if (method === 'link' && !canSharePublicly) {
      setMethod(canExport ? 'pdf' : canEmbedPublicly ? 'embed' : 'pdf');
      return;
    }
    if (method === 'pdf' && !canExport) {
      setMethod(canSharePublicly ? 'link' : canEmbedPublicly ? 'embed' : 'link');
      return;
    }
    if (method === 'embed' && !canEmbedPublicly) {
      setMethod(canSharePublicly ? 'link' : canExport ? 'pdf' : 'link');
    }
  }, [method, canSharePublicly, canExport, canEmbedPublicly]);

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
          status: doc.status,
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
    if (!isOpen || method !== 'link' || !canSharePublicly) return;

    let cancelled = false;
    setIsShareUrlLoading(true);

    const branchShareSettings =
      hasBranches && accessMode === 'readonly'
        ? { ...branchSettings, includeMainFlow: true }
        : undefined;

    void createDocumentShareUrl(documentId, {
      accessMode,
      viewMode: presenterLink ? 'player' : 'doc',
      shareSettings: branchShareSettings,
      presenter: accessMode === 'readonly' ? presenterLink : false,
      expiresAt: expiresAtFromPreset(expiryPreset),
      requiresAuth: accessMode === 'readonly' ? requiresAuth : false,
    })
      .then((url) => {
        if (!cancelled) {
          setShareUrl(url);
          setManageRefreshKey((key) => key + 1);
        }
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
  }, [
    isOpen,
    method,
    documentId,
    accessMode,
    branchSettings,
    hasBranches,
    canSharePublicly,
    expiryPreset,
    requiresAuth,
    presenterLink,
  ]);

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
        const branchShareSettings =
          hasBranches
            ? { ...branchSettings, includeMainFlow: true }
            : undefined;
        const { iframeCode } = await notifyPromise(
          createDocumentEmbedCode(documentId, {
            title: flow?.flow.title,
            shareSettings: branchShareSettings,
          }),
          {
            loading: 'Creating embed…',
            success: 'Embed code copied',
            successDescription: 'Paste the iframe into your site.',
            context: 'Create document embed',
            event: AnalyticsEvents.documentEmbedded,
            eventProps: { document_id: documentId },
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
            event: AnalyticsEvents.documentPdfExported,
            eventProps: { document_id: documentId },
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
            viewMode: presenterLink ? 'player' : 'doc',
            shareSettings: branchShareSettings,
            presenter: accessMode === 'readonly' ? presenterLink : false,
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
          context: 'Create document share link',
          event: AnalyticsEvents.documentShared,
          eventProps: { document_id: documentId, access_mode: accessMode },
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
    (method === 'embed' && !canEmbedPublicly) ||
    (method === 'link' && (!canSharePublicly || isShareUrlLoading)) ||
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
              {isDraft ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <p>
                    This documentation is still a <strong>Draft</strong>. Set status to{' '}
                    <strong>Live</strong> in the editor toolbar before creating a public link or
                    embed. PDF export remains available.
                  </p>
                  <p className="mt-2 text-xs text-amber-800/90">
                    Tip: use the Draft / Live switch next to Share — Live docs can be shared;
                    Drafts stay private.
                  </p>
                </div>
              ) : null}
              {isGuest ? <GuestShareAccessNotice /> : null}
              <ShareMethodPicker
                value={method}
                onChange={setMethod}
                disabled={isExporting}
                disabledMethods={{
                  link: !canSharePublicly,
                  pdf: !canExport,
                  embed: !canEmbedPublicly,
                }}
                disabledReasons={{
                  ...disabledReasons,
                  link: isDraft
                    ? 'Publish to Live before sharing a public link.'
                    : disabledReasons.link,
                  embed: isDraft
                    ? 'Publish to Live before creating an embed.'
                    : disabledReasons.embed,
                }}
              />
              {method === 'embed' ? (
                canEmbedPublicly ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      Copy an iframe that loads a unique Peacock embed URL. Viewers see the interactive
                      player with a Peacock Studio watermark. Loads are counted per embedding domain.
                    </p>
                    <EmbedPublicAccessNote />
                    <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                      {embedCode ||
                        `<iframe src="https://…/s/your-unique-token/embed" title="Peacock Studio guide" width="1280" height="720" …></iframe>`}
                    </pre>
                    <p className="text-xs text-slate-500">
                      Each document gets its own embed token. Loads are counted per embedding domain.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {disabledReasons.embed ?? 'Embed is not available for this session.'}
                  </div>
                )
              ) : null}
              {method === 'link' ? (
                <div className="space-y-4">
                  <ShareLinkPanel
                    accessMode={accessMode}
                    shareUrl={shareUrl}
                    usesTokenLinks={isCloudSyncEnabled()}
                    isShareUrlLoading={isShareUrlLoading}
                    hasBranches={hasBranches}
                    branches={branches}
                    branchSettings={branchSettings}
                    expiryPreset={expiryPreset}
                    requiresAuth={requiresAuth}
                    onAccessModeChange={setAccessMode}
                    onBranchSettingsChange={setBranchSettings}
                    onExpiryPresetChange={setExpiryPreset}
                    onRequiresAuthChange={setRequiresAuth}
                  />
                  {accessMode === 'readonly' ? (
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={presenterLink}
                        onChange={(event) => setPresenterLink(event.target.checked)}
                      />
                      Presenter mode link (fullscreen player)
                    </label>
                  ) : null}
                  {isCloudSyncEnabled() ? (
                    <ShareLinkManagePanel
                      resourceType="document"
                      resourceId={documentId}
                      refreshKey={manageRefreshKey}
                    />
                  ) : null}
                </div>
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
