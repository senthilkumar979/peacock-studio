import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button, FieldInput, FieldTextarea, FormField } from "@/components/ui";
import { useFlowStore } from "@/store/flowStore";
import type { FlowSection } from "@peacock/shared";
import { Info } from "lucide-react";
import { useState } from "react";

const SECTION_INFO_TOOLTIP =
  "Sections divide your flow into chapters. They appear in the editor, document view, and player as intro cards before the steps in each chapter.";

interface SectionPanelProps {
  section: FlowSection | null;
}

export const SectionPanel = ({ section }: SectionPanelProps) => {
  const updateSectionTitle = useFlowStore((state) => state.updateSectionTitle);
  const updateSectionDescription = useFlowStore(
    (state) => state.updateSectionDescription,
  );
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
        <div className="flex items-center gap-2 text-brand-violet">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Chapter / section
          </h2>
          <span className="relative inline-flex">
            <button
              type="button"
              className="peer inline-flex rounded-full p-0.5 text-slate-400 transition hover:text-peacock-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peacock-500 focus-visible:ring-offset-1"
              aria-label="What is a section?"
            >
              <Info className="h-3.5 w-3.5" aria-hidden />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-56 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-left text-[13px] font-normal normal-case leading-relaxed text-white shadow-xl peer-hover:block peer-focus:block"
            >
              {SECTION_INFO_TOOLTIP}
            </span>
          </span>
        </div>

        <FormField label="Title" className="px-1">
          <FieldInput
            value={section.title}
            onChange={(event) =>
              updateSectionTitle(section.id, event.target.value)
            }
          />
        </FormField>

        <FormField label="Description" className="px-1">
          <FieldTextarea
            value={section.description}
            onChange={(event) =>
              updateSectionDescription(section.id, event.target.value)
            }
            rows={8}
            placeholder="Optional context shown in document view"
          />
        </FormField>

        <Button
          variant="danger"
          className="mt-auto"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          Delete section
        </Button>
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
      >
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          The section{" "}
          <span className="font-semibold text-peacock-800">
            {section.title.trim() || "Untitled section"}
          </span>{" "}
          will be removed from this flow. Steps below it are kept.
        </p>
      </ConfirmDialog>
    </>
  );
};
