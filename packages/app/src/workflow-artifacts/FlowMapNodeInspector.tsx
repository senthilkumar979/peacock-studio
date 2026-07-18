import type { WorkflowGraphNode } from '@peacock/shared';
import { FLOW_MAP_KIND_THEMES } from '@/workflow-artifacts/flowMapCanvasTheme';

interface FlowMapNodeInspectorProps {
  node: WorkflowGraphNode;
}

export const FlowMapNodeInspector = ({ node }: FlowMapNodeInspectorProps) => {
  const theme = FLOW_MAP_KIND_THEMES[node.kind];
  const Icon = theme.icon;

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-10 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-slate-900/10 ring-1 ring-white backdrop-blur-md">
        <div className={`bg-gradient-to-r ${theme.gradient} px-4 py-2.5`}>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-white" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
              {theme.label}
              {typeof node.stepNumber === 'number' ? ` · Step ${node.stepNumber}` : ''}
            </p>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm font-bold text-slate-900">{node.label}</p>
          {node.description ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{node.description}</p>
          ) : (
            <p className="mt-1 text-xs italic text-slate-400">No additional description.</p>
          )}
        </div>
      </div>
    </div>
  );
};
