import { useState } from "react";
import type { FlowStep } from "@peacock/shared";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  ActionTooltip,
  Button,
  FieldInput,
  FieldTextarea,
  FormField,
} from "@/components/ui";
import { StepImageUpload } from "@/editor/StepImageUpload";
import { useFlowStore } from "@/store/flowStore";
import { notifySuccess } from "@/utils/notify";

interface StepPanelProps {
  step: FlowStep | null;
}

export const StepPanel = ({ step }: StepPanelProps) => {
  const updateStepTitle = useFlowStore((state) => state.updateStepTitle);
  const updateStepNotes = useFlowStore((state) => state.updateStepNotes);
  const setStepDescriptionHidden = useFlowStore(
    (state) => state.setStepDescriptionHidden,
  );
  const deleteOutlineItem = useFlowStore((state) => state.deleteOutlineItem);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!step) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
        Select a step to edit details.
      </div>
    );
  }

  const showDescription = !step.hideDescription;

  const handleConfirmDelete = () => {
    const label = step.title.trim() || "Step";
    deleteOutlineItem(step.id);
    setIsDeleteDialogOpen(false);
    notifySuccess(`${label} deleted`);
  };

  return (
    <>
      <div className="flex h-full flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Step details
        </h2>

        <FormField label="Title" className="px-1">
          <FieldInput
            value={step.title}
            onChange={(event) => updateStepTitle(step.id, event.target.value)}
          />
        </FormField>

        <label className="flex cursor-pointer items-center gap-2 px-1 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={showDescription}
            onChange={(event) =>
              setStepDescriptionHidden(step.id, !event.target.checked)
            }
            className="h-4 w-4 rounded border-slate-300 text-peacock-600 focus:ring-peacock-500"
          />
          Show step description
        </label>

        {showDescription && (
          <FormField
            label="Notes"
            hint="Leave blank to use the auto-generated description below."
            className="px-1"
          >
            <FieldTextarea
              value={step.notes}
              onChange={(event) => updateStepNotes(step.id, event.target.value)}
              rows={8}
              placeholder="Add context, tips, or warnings for this step…"
            />
          </FormField>
        )}

        <StepImageUpload step={step} />

        {showDescription && step.generatedDescription && (
          <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
            <p className="mb-1 font-medium text-slate-700">
              Auto-generated description
            </p>
            <p>{step.generatedDescription}</p>
          </div>
        )}

        <Button
          variant="danger"
          className="mt-auto"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          Delete step
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete this step?"
        description="This step will be removed from the flow. This action cannot be undone."
        confirmLabel="Delete step"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
};
