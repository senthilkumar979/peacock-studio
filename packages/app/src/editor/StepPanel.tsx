import { useState } from 'react';
import type { FlowStep } from '@peacock/shared';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StepImageUpload } from '@/editor/StepImageUpload';
import { useFlowStore } from '@/store/flowStore';

interface StepPanelProps {
  step: FlowStep | null;
}

export const StepPanel = ({ step }: StepPanelProps) => {
  const updateStepTitle = useFlowStore((state) => state.updateStepTitle);
  const updateStepNotes = useFlowStore((state) => state.updateStepNotes);
  const deleteOutlineItem = useFlowStore((state) => state.deleteOutlineItem);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!step) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
        Select a step to edit details.
      </div>
    );
  }

  const handleConfirmDelete = () => {
    deleteOutlineItem(step.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex h-full flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Step details</h2>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Title</span>
          <input
            value={step.title}
            onChange={(event) => updateStepTitle(step.id, event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-peacock-500 focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Notes</span>
          <span className="text-xs text-slate-500">
            Optional. Leave blank to use the auto-generated description below.
          </span>
          <textarea
            value={step.notes}
            onChange={(event) => updateStepNotes(step.id, event.target.value)}
            rows={4}
            placeholder="Add context, tips, or warnings for this step…"
            className="resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none ring-peacock-500 focus:ring-2"
          />
        </label>

        <StepImageUpload step={step} />

        {step.generatedDescription && (
          <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
            <p className="mb-1 font-medium text-slate-700">Auto-generated description</p>
            <p>{step.generatedDescription}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="mt-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Delete step
        </button>
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
