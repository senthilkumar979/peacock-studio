import { useEffect, useRef, type ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BookMarked, GitBranch, GripVertical, Link2, Plus } from "lucide-react";
import {
  isFlowBranch,
  isFlowSection,
  isFlowStep,
  type FlowOutlineItem,
  type FlowStep,
} from "@peacock/shared";
import { useFlowStore } from "@/store/flowStore";

function getStepDisplayNumber(items: FlowOutlineItem[], index: number): number {
  let count = 0;
  for (let i = 0; i <= index; i += 1) {
    const item = items[i];
    if (item && isFlowStep(item)) count += 1;
  }
  return count;
}

interface SortableOutlineItemProps {
  id: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  children: ReactNode;
  className?: string;
}

const SortableOutlineItem = ({
  id,
  isSelected,
  onSelect,
  children,
  className = "",
}: SortableOutlineItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      data-outline-id={id}
      style={style}
      className={`flex items-stretch gap-2 rounded-lg border bg-white p-2 transition ${className} ${
        isSelected
          ? "border-peacock-500 bg-peacock-50"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        title="Drag to reorder"
        className="flex shrink-0 cursor-grab items-center rounded-md px-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onSelect(id)}
        className="min-w-0 flex-1 text-left"
      >
        {children}
      </button>
    </div>
  );
};

interface SortableStepProps {
  step: FlowStep;
  stepNumber: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const SortableStep = ({
  step,
  stepNumber,
  isSelected,
  onSelect,
}: SortableStepProps) => (
  <SortableOutlineItem id={step.id} isSelected={isSelected} onSelect={onSelect}>
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
      Step {stepNumber}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-900">{step.title}</p>
  </SortableOutlineItem>
);

interface SortableSectionProps {
  section: { id: string; title: string };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

interface SortableBranchProps {
  branch: { id: string; title: string; pathCount: number };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const SortableBranch = ({
  branch,
  isSelected,
  onSelect,
}: SortableBranchProps) => (
  <SortableOutlineItem
    id={branch.id}
    isSelected={isSelected}
    onSelect={onSelect}
    className="border-brand-violet/30 bg-brand-violet/5"
  >
    <div className="flex items-center gap-2">
      <GitBranch className="h-4 w-4 shrink-0 text-brand-violet" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-violet">
          Branch
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">
          {branch.title}
        </p>
        <p className="text-xs text-slate-500">
          {branch.pathCount} {branch.pathCount === 1 ? "path" : "paths"}
        </p>
      </div>
    </div>
  </SortableOutlineItem>
);

const SortableSection = ({
  section,
  isSelected,
  onSelect,
}: SortableSectionProps) => (
  <SortableOutlineItem
    id={section.id}
    isSelected={isSelected}
    onSelect={onSelect}
    className="border-brand-violet/30 bg-brand-violet/5"
  >
    <div className="flex items-center gap-2">
      <BookMarked className="h-4 w-4 shrink-0 text-brand-violet" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-violet">
          Section
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">
          {section.title}
        </p>
      </div>
    </div>
  </SortableOutlineItem>
);

interface StepListProps {
  onLinkPeacockDoc?: () => void;
}

export const StepList = ({ onLinkPeacockDoc }: StepListProps) => {
  const steps = useFlowStore((state) => state.steps);
  const selectedOutlineId = useFlowStore((state) => state.selectedOutlineId);
  const selectOutlineItem = useFlowStore((state) => state.selectOutlineItem);
  const reorderSteps = useFlowStore((state) => state.reorderSteps);
  const addManualStep = useFlowStore((state) => state.addManualStep);
  const addSection = useFlowStore((state) => state.addSection);
  const listRef = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = steps.findIndex((item) => item.id === active.id);
    const to = steps.findIndex((item) => item.id === over.id);
    if (from >= 0 && to >= 0) reorderSteps(from, to);
  };

  useEffect(() => {
    if (!selectedOutlineId || !listRef.current) return;

    const selected = listRef.current.querySelector<HTMLElement>(
      `[data-outline-id="${selectedOutlineId}"]`,
    );
    selected?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedOutlineId]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Outline
        </h2>
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addManualStep()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-peacock-200 bg-peacock-50 px-2 py-2 text-xs font-medium text-peacock-800 hover:bg-peacock-100"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add step
          </button>
          <button
            type="button"
            onClick={() => addSection()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-violet/30 bg-brand-violet/10 px-2 py-2 text-xs font-medium text-brand-violet hover:bg-brand-violet/15"
          >
            <BookMarked className="h-3.5 w-3.5" aria-hidden />
            Add section
          </button>
        </div>
        {onLinkPeacockDoc ? (
          <button
            type="button"
            onClick={onLinkPeacockDoc}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-violet/40 bg-white px-2 py-2 text-xs font-medium text-brand-violet hover:bg-brand-violet/5"
          >
            <Link2 className="h-3.5 w-3.5" aria-hidden />
            Create a branching point
          </button>
        ) : null}
      </div>

      {!steps.length ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
          No steps yet. Record with the extension or add a step manually.
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={steps.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                ref={listRef}
                className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pr-1"
              >
                {steps.map((item, index) => {
                  if (isFlowSection(item)) {
                    return (
                      <SortableSection
                        key={item.id}
                        section={item}
                        isSelected={item.id === selectedOutlineId}
                        onSelect={selectOutlineItem}
                      />
                    );
                  }

                  if (isFlowBranch(item)) {
                    return (
                      <SortableBranch
                        key={item.id}
                        branch={{
                          id: item.id,
                          title: item.title,
                          pathCount: item.paths.length,
                        }}
                        isSelected={item.id === selectedOutlineId}
                        onSelect={selectOutlineItem}
                      />
                    );
                  }

                  if (!isFlowStep(item)) return null;

                  return (
                    <SortableStep
                      key={item.id}
                      step={item}
                      stepNumber={getStepDisplayNumber(steps, index)}
                      isSelected={item.id === selectedOutlineId}
                      onSelect={selectOutlineItem}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};
