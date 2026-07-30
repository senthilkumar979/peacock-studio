import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import {
  FLOW_MAP_KIND_THEMES,
  FLOW_MAP_NODE_WIDTH,
  FLOW_MAP_STATUS_THEMES,
} from '@/workflow-artifacts/flowMapCanvasTheme';
import type { FlowMapNodeData } from '@/workflow-artifacts/workflowGraphLayout';

export type FlowMapCanvasNodeType = Node<FlowMapNodeData, 'flowMap'>;

const HANDLE_CLASS = '!h-3 !w-3 !border-2 !border-white !bg-peacock-500';

const CARDINAL_TARGETS: Position[] = [
  Position.Top,
  Position.Right,
  Position.Bottom,
  Position.Left,
];

const CARDINAL_SOURCES: Position[] = [
  Position.Top,
  Position.Right,
  Position.Bottom,
  Position.Left,
];

export const FlowMapCanvasNode = ({ data, selected }: NodeProps<FlowMapCanvasNodeType>) => {
  const theme = FLOW_MAP_KIND_THEMES[data.kind];
  const Icon = theme.icon;
  const statusTheme = data.status ? FLOW_MAP_STATUS_THEMES[data.status] : null;

  return (
    <div className="relative" style={{ width: FLOW_MAP_NODE_WIDTH }}>
      {statusTheme ? (
        <span
          className={`absolute -right-2 -top-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-md ring-1 ${statusTheme.badgeClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusTheme.dotClass}`} aria-hidden />
          {statusTheme.label}
        </span>
      ) : null}
      <div
        className={`overflow-hidden rounded-2xl border bg-white shadow-lg transition-all duration-200 ${
          selected
            ? `border-peacock-400 shadow-peacock-200/50 ring-2 ${theme.ring}`
            : 'border-slate-200/90 hover:border-peacock-200 hover:shadow-xl'
        }`}
      >
        <div className={`bg-gradient-to-r ${theme.gradient} px-4 py-2`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85">
              {theme.label}
            </p>
            {typeof data.stepNumber === 'number' ? (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                #{data.stepNumber}
              </span>
            ) : null}
          </div>
        </div>
        <div className="space-y-2.5 px-4 py-3.5">
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 ${theme.accent} ring-1 ring-slate-100`}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{data.label}</p>
              {data.description ? (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {data.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {CARDINAL_TARGETS.map((position) => (
        <Handle
          key={`target-${position}`}
          id={`target-${position}`}
          type="target"
          position={position}
          className={HANDLE_CLASS}
        />
      ))}

      {CARDINAL_SOURCES.map((position) => (
        <Handle
          key={`source-${position}`}
          id={`source-${position}`}
          type="source"
          position={position}
          className={HANDLE_CLASS}
        />
      ))}

      {data.kind === 'branch' && typeof data.pathHandleCount === 'number'
        ? (() => {
            const pathHandleCount = data.pathHandleCount;
            return Array.from({ length: pathHandleCount }, (_, index) => (
              <Handle
                key={`source-path-${index}`}
                id={`source-path-${index}-${pathHandleCount}`}
                type="source"
                position={Position.Bottom}
                className={HANDLE_CLASS}
                style={{
                  left: `${((index + 1) / (pathHandleCount + 1)) * 100}%`,
                }}
              />
            ));
          })()
        : null}
    </div>
  );
};
