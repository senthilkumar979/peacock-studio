import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { RouteCanvasBadges } from '@/route-builder/RouteCanvasBadges';
import type { BranchCanvasNodeData } from '@/route-builder/routeCanvasMapper';

type BranchFlowNode = Node<BranchCanvasNodeData, 'branch'>;

export const BranchCanvasNode = ({ data }: NodeProps<BranchFlowNode>) => (
  <div className="relative">
    <RouteCanvasBadges isEntry={data.isEntry} warningCount={data.warningCount} />
    <div
      className={`min-w-[220px] max-w-[280px] rounded-2xl border bg-white shadow-lg transition ${
        data.selected
          ? 'border-brand-violet ring-2 ring-brand-violet/20'
          : 'border-slate-200 hover:border-brand-violet/40'
      }`}
    >
      <div className="rounded-t-2xl bg-gradient-to-r from-brand-violet to-peacock-600 px-4 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">Branch</p>
      </div>
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-start gap-2">
          <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-brand-violet" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{data.title}</p>
            {data.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{data.description}</p>
            ) : null}
          </div>
        </div>
        <ul className="space-y-1">
          {data.options.map((option) => (
            <li
              key={option.id}
              className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-brand-violet" />
      {data.options.map((option, index) => (
        <Handle
          key={option.id}
          id={option.id}
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !border-white !bg-brand-violet"
          style={{ top: `${((index + 1) / (data.options.length + 1)) * 100}%` }}
        />
      ))}
    </div>
  </div>
);
