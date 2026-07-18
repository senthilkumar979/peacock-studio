import { useEffect, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { buildWorkflowGraph } from '@peacock/shared';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { getFlowDocument } from '@/services/flowLibraryService';
import { FlowMapCanvasNode } from '@/workflow-artifacts/FlowMapCanvasNode';
import { workflowGraphToFlowCanvas } from '@/workflow-artifacts/workflowGraphLayout';
import { logAppError } from '@/utils/appError';

interface FlowMapCanvasProps {
  documentId: string;
  flowTitle: string;
}

const nodeTypes: NodeTypes = {
  flowMap: FlowMapCanvasNode,
};

export const FlowMapCanvas = ({ documentId, flowTitle }: FlowMapCanvasProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [graphKey, setGraphKey] = useState(0);
  const [flowCanvas, setFlowCanvas] = useState<ReturnType<typeof workflowGraphToFlowCanvas> | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadFailed(false);
      try {
        const doc = await getFlowDocument(documentId);
        if (cancelled) return;
        if (!doc) {
          setLoadFailed(true);
          setFlowCanvas(null);
          return;
        }
        const graph = buildWorkflowGraph(flowTitle || doc.flow.flow.title, doc.steps);
        setFlowCanvas(workflowGraphToFlowCanvas(graph));
      } catch (error) {
        logAppError('Failed to load flow map canvas', error);
        if (!cancelled) {
          setLoadFailed(true);
          setFlowCanvas(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [documentId, flowTitle, graphKey]);

  if (isLoading) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <PeacockStudioLoader size={96} />
      </div>
    );
  }

  if (loadFailed || !flowCanvas) {
    return (
      <div className="flex h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
        <p className="text-sm text-slate-600">Could not render the interactive flow map.</p>
        <button
          type="button"
          onClick={() => setGraphKey((value) => value + 1)}
          className="mt-3 text-sm font-medium text-peacock-700 hover:text-peacock-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="h-[min(70vh,640px)] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
      <ReactFlow
        nodes={flowCanvas.nodes}
        edges={flowCanvas.edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="#cbd5e1" />
        <MiniMap pannable zoomable className="!rounded-lg !border !border-slate-200 !bg-white/90" />
        <Controls showInteractive={false} className="!rounded-lg !border !border-slate-200 !shadow-sm" />
      </ReactFlow>
    </div>
  );
};
