import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { formatPathStepRange, getPlayableSteps } from "@peacock/shared";
import { AddPeacockModal } from "@/route-builder/AddPeacockModal";
import {
  getFlowDocument,
  listFlowSummaries,
} from "@/services/flowLibraryService";
import type { SavedFlowSummary } from "@/types/savedFlow";

interface LinkPeacockDocModalProps {
  isOpen: boolean;
  hostDocumentId?: string;
  onClose: () => void;
  onConfirm: (input: {
    targetDocumentId: string;
    targetTitle: string;
    targetDescription: string;
    fromStepId: string;
    toStepId: string;
    label: string;
  }) => void;
}

export const LinkPeacockDocModal = ({
  isOpen,
  hostDocumentId,
  onClose,
  onConfirm,
}: LinkPeacockDocModalProps) => {
  const [summaries, setSummaries] = useState<SavedFlowSummary[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(true);
  const [targetDocumentId, setTargetDocumentId] = useState<string | null>(null);
  const [targetTitle, setTargetTitle] = useState("");
  const [fromStepId, setFromStepId] = useState("");
  const [toStepId, setToStepId] = useState("");
  const [label, setLabel] = useState("");
  const [playableStepIds, setPlayableStepIds] = useState<string[]>([]);
  const [rangeLabel, setRangeLabel] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    void listFlowSummaries().then(setSummaries);
    setIsPickerOpen(true);
    setTargetDocumentId(null);
    setFromStepId("");
    setToStepId("");
    setLabel("");
  }, [isOpen]);

  useEffect(() => {
    if (!targetDocumentId) return;
    void getFlowDocument(targetDocumentId).then((doc) => {
      if (!doc) return;
      const playable = getPlayableSteps(doc.steps);
      const first = playable[0];
      const last = playable[playable.length - 1];
      if (!first || !last) {
        setPlayableStepIds([]);
        return;
      }
      setPlayableStepIds(playable.map((step) => step.id));
      setFromStepId(first.id);
      setToStepId(last.id);
      setRangeLabel(formatPathStepRange(doc.steps, first.id, last.id));
    });
  }, [targetDocumentId]);

  useEffect(() => {
    if (!targetDocumentId || !fromStepId || !toStepId) return;
    void getFlowDocument(targetDocumentId).then((doc) => {
      if (!doc) return;
      setRangeLabel(formatPathStepRange(doc.steps, fromStepId, toStepId));
    });
  }, [targetDocumentId, fromStepId, toStepId]);

  const excludedIds = useMemo(
    () => (hostDocumentId ? [hostDocumentId] : []),
    [hostDocumentId],
  );

  const canConfirm = Boolean(
    targetDocumentId && fromStepId && toStepId && label.trim(),
  );

  if (!isOpen) return null;

  if (isPickerOpen) {
    return (
      <AddPeacockModal
        isOpen
        summaries={summaries}
        excludedDocumentIds={excludedIds}
        title="Add a path to branch point"
        closeOnSelect={false}
        onClose={onClose}
        onSelect={(documentId) => {
          const summary = summaries.find((item) => item.id === documentId);
          setTargetDocumentId(documentId);
          setTargetTitle(summary?.title ?? "Linked demo");
          setLabel(summary?.title ?? "Path");
          setIsPickerOpen(false);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Change demo
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <h2 className="mt-2 text-lg font-bold text-slate-900">
          Create a branching point
        </h2>
        <p className="mt-1 text-sm text-slate-600">{targetTitle}</p>

        <label className="mt-5 block text-sm font-medium text-slate-700">
          Path label
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="e.g. Happy path"
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-slate-700">
            From step
            <select
              value={fromStepId}
              onChange={(event) => setFromStepId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {playableStepIds.map((stepId, index) => (
                <option key={stepId} value={stepId}>
                  Step {index + 1}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            To step
            <select
              value={toStepId}
              onChange={(event) => setToStepId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {playableStepIds.map((stepId, index) => (
                <option key={stepId} value={stepId}>
                  Step {index + 1}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-2 text-xs text-slate-500">{rangeLabel}</p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (!targetDocumentId || !canConfirm) return;
              onConfirm({
                targetDocumentId,
                targetTitle,
                targetDescription:
                  summaries.find((item) => item.id === targetDocumentId)
                    ?.description ?? "",
                fromStepId,
                toStepId,
                label: label.trim(),
              });
              onClose();
            }}
            className="rounded-lg bg-peacock-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Add path
          </button>
        </div>
      </div>
    </div>
  );
};
