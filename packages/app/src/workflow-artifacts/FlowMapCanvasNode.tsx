import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { FlowMapNodeData } from '@/workflow-artifacts/workflowGraphLayout';

export type FlowMapCanvasNodeType = Node<FlowMapNodeData, 'flowMap'>;

const KIND_LABELS: Record<FlowMapNodeData['kind'], string> = {
  root: 'Flow',
  section: 'Section',
  step: 'Step',
  branch: 'Branch',
  path: 'Path',
};

export const FlowMapCanvasNode = ({ data }: NodeProps<FlowMapCanvasNodeType>) => {
  const style = data.style;

  return (
    <div
      className={`w-[220px] rounded-xl border px-3 py-2.5 shadow-sm ${style.border} ${style.bg}`}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-slate-400" />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {KIND_LABELS[data.kind]}
        </span>
        {typeof data.stepNumber === 'number' ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {data.stepNumber}
          </span>
        ) : null}
      </div>
      <p className={`mt-1 line-clamp-2 text-sm font-semibold leading-snug ${style.text}`}>
        {data.label}
      </p>
      {data.description ? (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{data.description}</p>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-slate-400" />
    </div>
  );
};
