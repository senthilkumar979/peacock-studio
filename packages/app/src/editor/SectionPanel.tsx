import { useState } from 'react';
import type { FlowSection } from '@peacock/shared';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useFlowStore } from '@/store/flowStore';

interface SectionPanelProps {
  section: FlowSection | null;
}

export const SectionPanel = ({ section }: SectionPanelProps) => {
  const updateSectionTitle = useFlowStore((state) => state.updateSectionTitle);
  const updateSectionDescription = useFlowStore((state) => state.updateSectionDescription);
  const deleteOutlineItem = useFlowStore((state) => state.deleteOutlineItem);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!section) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
        Select a section to edit its details.
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Chapter / section
        </h2>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Title</span>
          <input
            value={section.title}
            onChange={(event) => updateSectionTitle(section.id, event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-peacock-500 focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Description</span>
          <textarea
            value={section.description}
            onChange={(event) => updateSectionDescription(section.id, event.target.value)}
            rows={6}
            placeholder="Optional context shown in document view"
            className="resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none ring-peacock-500 focus:ring-2"
          />
        </label>

        <p className="rounded-lg bg-slate-100 p-3 text-xs leading-relaxed text-slate-600">
          Sections group steps in the editor and shared document view. They are not shown in
          player mode.
        </p>

        <button
          type="button"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="mt-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Delete section
        </button>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete this section?"
        description="The section heading will be removed. Steps below it are kept."
        confirmLabel="Delete section"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={() => {
          deleteOutlineItem(section.id);
          setIsDeleteDialogOpen(false);
        }}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
};
