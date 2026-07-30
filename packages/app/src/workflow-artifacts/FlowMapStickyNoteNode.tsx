import { type Node, type NodeProps } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import type { FlowMapStickyNoteData } from '@/workflow-artifacts/workflowGraphLayout';

export type FlowMapStickyNoteNodeType = Node<FlowMapStickyNoteData, 'stickyNote'>;

const NOTE_COLORS: Record<string, string> = {
  yellow: 'bg-amber-100 border-amber-300',
  pink: 'bg-rose-100 border-rose-300',
  blue: 'bg-sky-100 border-sky-300',
  green: 'bg-emerald-100 border-emerald-300',
};

export const FlowMapStickyNoteNode = ({
  id,
  data,
  selected,
}: NodeProps<FlowMapStickyNoteNodeType>) => {
  const colorClass = NOTE_COLORS[data.color ?? 'yellow'] ?? NOTE_COLORS.yellow;

  return (
    <div
      className={`relative w-52 rounded-xl border-2 p-3 shadow-lg transition-shadow ${
        selected ? 'shadow-xl ring-2 ring-peacock-300' : ''
      } ${colorClass}`}
    >
      {data.isEditMode ? (
        <button
          type="button"
          aria-label="Delete sticky note"
          className="nodrag nopan absolute -right-2 -top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-rose-600 shadow-md ring-1 ring-rose-200 transition hover:bg-rose-50 hover:text-rose-700"
          onClick={(event) => {
            event.stopPropagation();
            data.onDelete?.(id);
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}
      <p className="min-h-[72px] whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
        {data.text || (data.isEditMode ? 'New note…' : 'Empty note')}
      </p>
    </div>
  );
};
