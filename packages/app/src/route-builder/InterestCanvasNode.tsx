import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Sparkles } from "lucide-react";
import { RouteCanvasBadges } from "@/route-builder/RouteCanvasBadges";
import type { InterestCanvasNodeData } from "@/route-builder/routeCanvasMapper";

type InterestFlowNode = Node<InterestCanvasNodeData, "interest">;

export const InterestCanvasNode = ({ data }: NodeProps<InterestFlowNode>) => (
  <div className="relative">
    <RouteCanvasBadges
      isEntry={data.isEntry}
      warningCount={data.warningCount}
    />
    <div
      className={`min-w-[220px] max-w-[280px] rounded-2xl border bg-white shadow-lg transition ${
        data.selected
          ? "border-fuchsia-400 ring-2 ring-fuchsia-200"
          : "border-slate-200 hover:border-fuchsia-200"
      }`}
    >
      <div className="rounded-t-2xl bg-gradient-to-r from-fuchsia-500 to-brand-violet px-4 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
          Misc
        </p>
      </div>
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-start gap-2">
          <Sparkles
            className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-600"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {data.title}
            </p>
            {data.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                {data.description}
              </p>
            ) : null}
          </div>
        </div>
        <ul className="space-y-1">
          {data.topics.map((topic) => (
            <li
              key={topic.id}
              className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
            >
              {topic.label}
            </li>
          ))}
        </ul>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-white !bg-fuchsia-500"
      />
      {data.topics.map((topic, index) => (
        <Handle
          key={topic.id}
          id={topic.id}
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !border-white !bg-fuchsia-500"
          style={{ top: `${((index + 1) / (data.topics.length + 1)) * 100}%` }}
        />
      ))}
    </div>
  </div>
);
