import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { collectAllBranches, sortBranchPaths, type FlowOutlineItem } from '@peacock/shared';
import type { FlowShareSettings } from '@/types/savedFlow';
import { buildShareQueryString, resolveShareSettings } from '@/utils/flowShareSettings';
import { getDocumentShareUrl } from '@/utils/shareLink';

interface ShareBranchingDocModalProps {
  isOpen: boolean;
  documentId: string;
  steps: FlowOutlineItem[];
  initialSettings?: FlowShareSettings;
  onClose: () => void;
  onSave: (settings: FlowShareSettings) => void;
}

export const ShareBranchingDocModal = ({
  isOpen,
  documentId,
  steps,
  initialSettings,
  onClose,
  onSave,
}: ShareBranchingDocModalProps) => {
  const defaults = useMemo(
    () => resolveShareSettings(steps, initialSettings),
    [steps, initialSettings],
  );
  const [settings, setSettings] = useState(defaults);

  useEffect(() => {
    if (!isOpen) return;
    setSettings(defaults);
  }, [isOpen, defaults]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const branches = collectAllBranches(steps);
  const shareUrl = `${getDocumentShareUrl(documentId)}${buildShareQueryString(settings)}`;

  const togglePath = (pathId: string) => {
    setSettings((current) => {
      const enabled = new Set(current.enabledPathIds);
      if (enabled.has(pathId)) enabled.delete(pathId);
      else enabled.add(pathId);
      return { ...current, enabledPathIds: [...enabled] };
    });
  };

  const toggleBranch = (branchId: string) => {
    setSettings((current) => {
      const enabled = new Set(current.enabledBranchIds);
      if (enabled.has(branchId)) enabled.delete(branchId);
      else enabled.add(branchId);
      return { ...current, enabledBranchIds: [...enabled] };
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-branching-title"
        className="flex max-h-[min(85vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="share-branching-title" className="text-lg font-bold text-slate-900">
            Share branching doc
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={settings.includeMainFlow}
              onChange={(event) =>
                setSettings((current) => ({ ...current, includeMainFlow: event.target.checked }))
              }
            />
            Include main flow steps
          </label>

          {branches.map((branch) => (
            <div key={branch.id} className="rounded-xl border border-slate-200 p-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={settings.enabledBranchIds.includes(branch.id)}
                  onChange={() => toggleBranch(branch.id)}
                />
                {branch.title}
              </label>
              <ul className="mt-2 space-y-1 pl-6">
                {sortBranchPaths(branch.paths).map((path) => (
                  <li key={path.id}>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={settings.enabledPathIds.includes(path.id)}
                        onChange={() => togglePath(path.id)}
                      />
                      {path.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-slate-100 p-5">
          <p className="text-xs text-slate-500">Preview link</p>
          <p className="mt-1 break-all text-xs text-slate-700">{shareUrl}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(settings);
                void navigator.clipboard.writeText(shareUrl);
                onClose();
              }}
              className="rounded-lg bg-peacock-600 px-4 py-2 text-sm font-medium text-white"
            >
              Save & copy link
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
