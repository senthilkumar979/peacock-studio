import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FlowStep } from '@peacock/shared';
import { useFlowStore } from '@/store/flowStore';

interface SortableStepProps {
  step: FlowStep;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const SortableStep = ({ step, index, isSelected, onSelect }: SortableStepProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(step.id)}
      className={`w-full rounded-lg border px-3 py-2 text-left transition ${
        isSelected
          ? 'border-peacock-500 bg-peacock-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Step {index + 1}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{step.title}</p>
    </button>
  );
};

export const StepList = () => {
  const steps = useFlowStore((state) => state.steps);
  const selectedStepId = useFlowStore((state) => state.selectedStepId);
  const selectStep = useFlowStore((state) => state.selectStep);
  const reorderSteps = useFlowStore((state) => state.reorderSteps);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = steps.findIndex((step) => step.id === active.id);
    const to = steps.findIndex((step) => step.id === over.id);
    if (from >= 0 && to >= 0) reorderSteps(from, to);
  };

  if (!steps.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
        No steps yet. Record a flow with the Peacock extension.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <h2 className="shrink-0 text-sm font-semibold uppercase tracking-wide text-slate-500">Steps</h2>
      <div className="flex min-h-0 flex-1 flex-col">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={steps.map((step) => step.id)} strategy={verticalListSortingStrategy}>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pr-1">
            {steps.map((step, index) => (
              <SortableStep
                key={step.id}
                step={step}
                index={index}
                isSelected={step.id === selectedStepId}
                onSelect={selectStep}
              />
            ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
