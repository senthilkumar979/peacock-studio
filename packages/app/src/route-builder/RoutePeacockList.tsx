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
import { GripVertical, Trash2 } from 'lucide-react';
import type { RoutePeacockRef } from '@/types/route';
import type { SavedFlowSummary } from '@/types/savedFlow';

interface RoutePeacockListProps {
  peacocks: RoutePeacockRef[];
  summariesById: Map<string, SavedFlowSummary>;
  onRemove: (peacockRefId: string) => void;
  onReorder: (from: number, to: number) => void;
}

interface SortablePeacockProps {
  peacock: RoutePeacockRef;
  index: number;
  summary: SavedFlowSummary | undefined;
  onRemove: () => void;
}

const SortablePeacock = ({ peacock, index, summary, onRemove }: SortablePeacockProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: peacock.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2"
    >
      <button
        type="button"
        aria-label={`Drag demo ${index + 1} to reorder`}
        className="flex shrink-0 cursor-grab items-center rounded-md px-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {summary?.title ?? 'Missing demo'}
        </p>
        <p className="text-xs text-slate-500">
          {summary
            ? `${summary.stepCount} ${summary.stepCount === 1 ? 'step' : 'steps'}`
            : 'This documentation was deleted'}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
        aria-label="Remove demo"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export const RoutePeacockList = ({
  peacocks,
  summariesById,
  onRemove,
  onReorder,
}: RoutePeacockListProps) => {
  const sorted = [...peacocks].sort((a, b) => a.order - b.order);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = sorted.findIndex((peacock) => peacock.id === active.id);
    const to = sorted.findIndex((peacock) => peacock.id === over.id);
    if (from < 0 || to < 0) return;

    onReorder(from, to);
  };

  if (sorted.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
        No demos in this chapter yet. Add a saved Peacock demo below.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sorted.map((peacock) => peacock.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sorted.map((peacock, index) => (
            <SortablePeacock
              key={peacock.id}
              peacock={peacock}
              index={index}
              summary={summariesById.get(peacock.documentId)}
              onRemove={() => onRemove(peacock.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
