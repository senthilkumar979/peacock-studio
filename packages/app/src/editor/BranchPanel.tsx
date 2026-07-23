import { GitBranch, Info, Plus, Trash2 } from "lucide-react";
import {
  formatPathStepRange,
  getBranchPresentation,
  sortBranchPaths,
  type FlowBranch,
} from "@peacock/shared";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button, FieldInput, FieldTextarea, FormField } from "@/components/ui";
import { getFlowDocument } from "@/services/flowLibraryService";
import { useFlowStore } from "@/store/flowStore";
import { useEffect, useState } from "react";

const BRANCH_INFO_TOOLTIP =
  "A branch point lets viewers choose between different paths in your flow. Each path links to steps from another saved document and appears in the editor, document view, and player.";

interface BranchPanelProps {
  branch: FlowBranch;
  onAddPath: () => void;
}

export const BranchPanel = ({ branch, onAddPath }: BranchPanelProps) => {
  const updateBranchTitle = useFlowStore((state) => state.updateBranchTitle);
  const updateBranchDescription = useFlowStore(
    (state) => state.updateBranchDescription,
  );
  const updateBranchPresentation = useFlowStore(
    (state) => state.updateBranchPresentation,
  );
  const updatePathLabel = useFlowStore((state) => state.updatePathLabel);
  const removePathFromBranch = useFlowStore(
    (state) => state.removePathFromBranch,
  );
  const deleteOutlineItem = useFlowStore((state) => state.deleteOutlineItem);
  const [rangeLabels, setRangeLabels] = useState<Record<string, string>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pathToRemoveId, setPathToRemoveId] = useState<string | null>(null);

  const paths = sortBranchPaths(branch.paths);
  const presentation = getBranchPresentation(branch);
  const pathToRemove = paths.find((path) => path.id === pathToRemoveId);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const labels: Record<string, string> = {};
      for (const path of paths) {
        const doc = await getFlowDocument(path.targetDocumentId);
        labels[path.id] = doc
          ? formatPathStepRange(doc.steps, path.fromStepId, path.toStepId)
          : "Unavailable";
      }
      if (!cancelled) setRangeLabels(labels);
    })();
    return () => {
      cancelled = true;
    };
  }, [paths]);

  return (
    <>
      <div className="flex h-full flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2 text-peacock-700">
          <GitBranch className="h-4 w-4" aria-hidden />
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Branch
          </h2>
          <span className="relative inline-flex">
            <button
              type="button"
              className="peer inline-flex rounded-full p-0.5 text-slate-400 transition hover:text-peacock-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peacock-500 focus-visible:ring-offset-1"
              aria-label="What is a branch?"
            >
              <Info className="h-3.5 w-3.5" aria-hidden />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-5 top-full z-30 mt-2 hidden w-56 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-left text-[13px] font-normal normal-case leading-relaxed text-white shadow-xl peer-hover:block peer-focus:block"
            >
              {BRANCH_INFO_TOOLTIP}
            </span>
          </span>
        </div>

        <FormField label="Title" className="px-1">
          <FieldInput
            value={branch.title}
            onChange={(event) =>
              updateBranchTitle(branch.id, event.target.value)
            }
          />
        </FormField>

        <FormField label="Description" className="px-1">
          <FieldTextarea
            value={branch.description}
            onChange={(event) =>
              updateBranchDescription(branch.id, event.target.value)
            }
            rows={6}
          />
        </FormField>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Paths ({paths.length})
            </p>
            <Button variant="soft" onClick={onAddPath}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add path
            </Button>
          </div>

          {paths.map((path) => (
            <div
              key={path.id}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <input
                value={path.label}
                onChange={(event) =>
                  updatePathLabel(branch.id, path.id, event.target.value)
                }
                className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm font-medium"
              />
              <p className="mt-2 text-xs text-slate-500">{path.targetTitle}</p>
              <p className="text-xs text-slate-400">
                {rangeLabels[path.id] ?? "…"}
              </p>
              <button
                type="button"
                onClick={() => setPathToRemoveId(path.id)}
                className="mt-2 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" aria-hidden />
                Remove path
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="mt-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Delete branch
        </button>
      </div>

      <ConfirmDialog
        isOpen={pathToRemoveId !== null}
        title="Remove this path?"
        confirmLabel="Remove path"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={() => {
          if (pathToRemoveId) removePathFromBranch(branch.id, pathToRemoveId);
          setPathToRemoveId(null);
        }}
        onCancel={() => setPathToRemoveId(null)}
      >
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          <span className="font-semibold text-peacock-800">
            {pathToRemove?.label.trim() || "Untitled path"}
          </span>{" "}
          will be removed from the branch. The linked document is not deleted.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete this branch?"
        confirmLabel="Delete branch"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={() => {
          deleteOutlineItem(branch.id);
          setIsDeleteDialogOpen(false);
        }}
        onCancel={() => setIsDeleteDialogOpen(false)}
      >
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          The branch point{" "}
          <span className="font-semibold text-peacock-800">
            {branch.title.trim() || "Untitled branch"}
          </span>{" "}
          and its linked paths will be removed from this flow. Linked documents
          are not deleted.
        </p>
      </ConfirmDialog>
    </>
  );
};
