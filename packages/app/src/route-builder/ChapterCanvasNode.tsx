import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { BookOpen } from 'lucide-react';
import { RouteCanvasBadges } from '@/route-builder/RouteCanvasBadges';
import type { ChapterCanvasNodeData } from '@/route-builder/routeCanvasMapper';

type ChapterFlowNode = Node<ChapterCanvasNodeData, 'chapter'>;

export const ChapterCanvasNode = ({ data }: NodeProps<ChapterFlowNode>) => (
  <div className="relative">
    <RouteCanvasBadges isEntry={data.isEntry} warningCount={data.warningCount} />
    <div
      className={`min-w-[220px] max-w-[260px] rounded-2xl border bg-white shadow-lg transition ${
        data.selected
          ? 'border-peacock-400 ring-2 ring-peacock-200'
          : 'border-slate-200 hover:border-peacock-200'
      }`}
    >
      <div className="rounded-t-2xl bg-gradient-to-r from-peacock-500 to-brand-cyan px-4 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">Chapter</p>
      </div>
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-start gap-2">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-peacock-600" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{data.title}</p>
            {data.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{data.description}</p>
            ) : null}
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500">
          {data.peacockCount} {data.peacockCount === 1 ? 'demo' : 'demos'}
        </p>
      </div>
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-peacock-500" />
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-peacock-500" />
    </div>
  </div>
);
