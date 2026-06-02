import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';
import { collectAllBranches, type FlowOutlineItem, type FlowPayload } from '@peacock/shared';
import { ShareLinkPanel } from '@/components/share/ShareLinkPanel';
import { ShareMethodPicker, type ShareMethod } from '@/components/share/ShareMethodPicker';
import { exportFlowPdf } from '@/pdf/exportFlowPdf';
import { getFlowDocument } from '@/services/flowLibraryService';
import type { FlowShareSettings } from '@/types/savedFlow';
import { buildShareQueryString, resolveShareSettings } from '@/utils/flowShareSettings';
import {
  buildSharedDocumentUrl,
  copyTextToClipboard,
  getEmbedCodePlaceholder,
  type ShareLinkAccessMode,
} from '@/utils/shareLink';

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

  useEffect(() => {
    if (!isOpen) return;
    setMethod('link');
    setAccessMode('readonly');
    setBranchSettings(defaultBranchSettings);
  }, [isOpen, defaultBranchSettings]);

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

  const branchingQuery =
    hasBranches && accessMode === 'readonly' ? buildShareQueryString(branchSettings) : '';
  const shareUrl = buildSharedDocumentUrl(documentId, { accessMode, query: branchingQuery });

  const handlePrimaryAction = async () => {
    if (method === 'embed') return;
    if (method === 'pdf') {
      if (!flow) return;
      setIsExporting(true);
      try {
        await exportFlowPdf({ flow, steps, screenshotUrls });
        onClose();
      } finally {
        setIsExporting(false);
      }
      return;
    }
    if (hasBranches && accessMode === 'readonly') onShareSettingsSave?.(branchSettings);
    await copyTextToClipboard(shareUrl);
    onClose();
  };

  if (!isOpen) return null;

  const primaryDisabled =
    method === 'embed' || isLoading || isExporting || (method === 'pdf' && !flow);

  return createPortal(
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
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
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
              <ShareMethodPicker value={method} onChange={setMethod} />
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
                  hasBranches={hasBranches}
                  branches={branches}
                  branchSettings={branchSettings}
                  onAccessModeChange={setAccessMode}
                  onBranchSettingsChange={setBranchSettings}
                />
              ) : null}
              {method === 'pdf' ? (
                <p className="text-sm text-slate-600">
                  Export this documentation as a PDF with all playable steps and screenshots.
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
