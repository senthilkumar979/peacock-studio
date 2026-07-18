import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { buildWorkflowGraph, type WorkflowGraph } from '@peacock/shared';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { getFlowDocument } from '@/services/flowLibraryService';
import { FlowMapCanvasLegend, FlowMapCanvasToolbar } from '@/workflow-artifacts/FlowMapCanvasToolbar';
import { FlowMapCanvasNode } from '@/workflow-artifacts/FlowMapCanvasNode';
import { FlowMapNodeInspector } from '@/workflow-artifacts/FlowMapNodeInspector';
import {
  getWorkflowGraphStats,
} from '@/workflow-artifacts/flowMapCanvasTheme';
import {
  getFlowMapFitViewOptions,
  getFlowMapFocusNodes,
  getFlowMapInitialViewOptions,
  getReadableMinZoom,
} from '@/workflow-artifacts/flowMapViewportUtils';
import {
  buildFlowMapPngFilename,
  exportFlowMapCanvasPng,
  FLOW_MAP_EXPORT_SIZE,
  waitForFlowMapLayout,
} from '@/workflow-artifacts/exportFlowMapCanvasPng';
import type { FlowMapCanvasHandle } from '@/workflow-artifacts/flowMapCanvasHandle';
import {
  workflowGraphToFlowCanvas,
  type FlowMapNodeData,
} from '@/workflow-artifacts/workflowGraphLayout';
import { logAppError } from '@/utils/appError';

interface FlowMapCanvasProps {
  documentId: string;
  flowTitle: string;
}

const nodeTypes: NodeTypes = {
  flowMap: FlowMapCanvasNode,
};

interface FlowMapCanvasViewportProps {
  graph: WorkflowGraph;
  flowTitle: string;
}

const FlowMapCanvasViewport = forwardRef<FlowMapCanvasHandle, FlowMapCanvasViewportProps>(
  ({ graph, flowTitle }, ref) => {
  const { fitView, getNodes } = useReactFlow();
  const flowContainerRef = useRef<HTMLDivElement>(null);
  const canvas = useMemo(() => workflowGraphToFlowCanvas(graph), [graph]);
  const stats = useMemo(() => getWorkflowGraphStats(graph), [graph]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(
    () => graph.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [graph.nodes, selectedNodeId],
  );

  const readableMinZoom = useMemo(() => getReadableMinZoom(stats.steps), [stats.steps]);

  const downloadPng = useCallback(
    async (filename: string) => {
      const container = flowContainerRef.current;
      const viewport = container?.querySelector('.react-flow__viewport');
      if (!container || !(viewport instanceof HTMLElement)) {
        throw new Error('Flow map viewport is not ready for export.');
      }

      setSelectedNodeId(null);

      const previousStyle = {
        position: container.style.position,
        left: container.style.left,
        top: container.style.top,
        width: container.style.width,
        height: container.style.height,
        maxHeight: container.style.maxHeight,
        zIndex: container.style.zIndex,
        opacity: container.style.opacity,
        pointerEvents: container.style.pointerEvents,
      };

      container.style.position = 'fixed';
      container.style.left = '0';
      container.style.top = '0';
      container.style.width = `${FLOW_MAP_EXPORT_SIZE.width}px`;
      container.style.height = `${FLOW_MAP_EXPORT_SIZE.height}px`;
      container.style.maxHeight = 'none';
      container.style.zIndex = '9999';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      window.dispatchEvent(new Event('resize'));

      try {
        await waitForFlowMapLayout();

        await fitView({
          nodes: getNodes(),
          padding: 0.025,
          duration: 0,
          minZoom: 0.05,
          maxZoom: 12,
        });

        await waitForFlowMapLayout();

        await exportFlowMapCanvasPng({
          viewportElement: viewport,
          filename: filename || buildFlowMapPngFilename(flowTitle || graph.title),
          title: flowTitle || graph.title,
        });
      } finally {
        container.style.position = previousStyle.position;
        container.style.left = previousStyle.left;
        container.style.top = previousStyle.top;
        container.style.width = previousStyle.width;
        container.style.height = previousStyle.height;
        container.style.maxHeight = previousStyle.maxHeight;
        container.style.zIndex = previousStyle.zIndex;
        container.style.opacity = previousStyle.opacity;
        container.style.pointerEvents = previousStyle.pointerEvents;
        window.dispatchEvent(new Event('resize'));
        await waitForFlowMapLayout();
        void fitView({
          ...getFlowMapInitialViewOptions(stats.steps),
          nodes: getFlowMapFocusNodes(canvas.nodes),
          duration: 0,
        });
      }
    },
    [canvas.nodes, fitView, flowTitle, getNodes, graph.title, stats.steps],
  );

  useImperativeHandle(ref, () => ({ downloadPng }), [downloadPng]);

  const handleFitView = useCallback(() => {
    void fitView(getFlowMapFitViewOptions(stats.steps));
  }, [fitView, stats.steps]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const focusNodes = getFlowMapFocusNodes(canvas.nodes);
      void fitView({
        ...getFlowMapInitialViewOptions(stats.steps),
        nodes: focusNodes,
      });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [fitView, graph, canvas.nodes, stats.steps]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<FlowMapNodeData>) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <>
      <FlowMapCanvasToolbar
        flowTitle={flowTitle || graph.title}
        stats={stats}
        onFitView={handleFitView}
        onClearSelection={() => setSelectedNodeId(null)}
        hasSelection={Boolean(selectedNode)}
      />
      <FlowMapCanvasLegend stepCount={stats.steps} />
      <div
        ref={flowContainerRef}
        className="relative h-[min(78vh,760px)] bg-gradient-to-br from-slate-100 via-slate-50 to-peacock-50/40"
      >
        <ReactFlow
          className="flow-map-canvas-export"
          nodes={canvas.nodes}
          edges={canvas.edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          panOnScroll
          zoomOnScroll
          minZoom={readableMinZoom}
          maxZoom={1.75}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.2}
            color="#94a3b8"
            className="opacity-50"
          />
          <Controls
            showInteractive={false}
            className="!rounded-xl !border !border-slate-200 !bg-white/95 !shadow-lg"
          />
        </ReactFlow>
        {selectedNode ? <FlowMapNodeInspector node={selectedNode} /> : null}
      </div>
    </>
  );
});

FlowMapCanvasViewport.displayName = 'FlowMapCanvasViewport';

export const FlowMapCanvas = forwardRef<FlowMapCanvasHandle, FlowMapCanvasProps>(
  ({ documentId, flowTitle }, ref) => {
  const viewportRef = useRef<FlowMapCanvasHandle>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [graphKey, setGraphKey] = useState(0);
  const [graph, setGraph] = useState<WorkflowGraph | null>(null);

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
          setGraph(null);
          return;
        }
        setGraph(buildWorkflowGraph(flowTitle || doc.flow.flow.title, doc.steps));
      } catch (error) {
        logAppError('Failed to load flow map canvas', error);
        if (!cancelled) {
          setLoadFailed(true);
          setGraph(null);
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

  useImperativeHandle(
    ref,
    () => ({
      downloadPng: async (filename: string) => {
        if (!viewportRef.current) {
          throw new Error('Flow map canvas is not ready for export.');
        }
        await viewportRef.current.downloadPng(filename);
      },
    }),
    [],
  );

  if (isLoading) {
    return (
      <div className="flex h-[min(78vh,760px)] items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-inner">
        <PeacockStudioLoader size={112} />
      </div>
    );
  }

  if (loadFailed || !graph) {
    return (
      <div className="flex h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center">
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
    <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/60">
      <ReactFlowProvider>
        <FlowMapCanvasViewport ref={viewportRef} graph={graph} flowTitle={flowTitle} />
      </ReactFlowProvider>
    </div>
  );
});

FlowMapCanvas.displayName = 'FlowMapCanvas';
