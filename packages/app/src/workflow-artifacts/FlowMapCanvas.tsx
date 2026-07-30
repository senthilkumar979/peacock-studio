import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type NodeChange,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  buildWorkflowGraph,
  buildWorkflowGraphContextMap,
  EMPTY_FLOW_MAP_OVERLAY,
  type FlowMapNodeStatus,
  type FlowMapOverlay,
  type WorkflowGraph,
  type WorkflowGraphNodeContext,
} from '@peacock/shared';
import { trackEvent } from '@/analytics/analyticsClient';
import { AnalyticsEvents } from '@/analytics/events';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { getFlowDocument } from '@/services/flowLibraryService';
import { FlowMapCanvasLegend, FlowMapCanvasToolbar } from '@/workflow-artifacts/FlowMapCanvasToolbar';
import { FlowMapCanvasNode } from '@/workflow-artifacts/FlowMapCanvasNode';
import {
  FlowMapNodeInspector,
  type FlowMapInspectorSelection,
} from '@/workflow-artifacts/FlowMapNodeInspector';
import { FlowMapStickyNoteNode } from '@/workflow-artifacts/FlowMapStickyNoteNode';
import { getWorkflowGraphStats } from '@/workflow-artifacts/flowMapCanvasTheme';
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
  buildOverlayFromNodes,
  parseStickyNoteId,
  stickyNoteId,
  workflowGraphToFlowCanvas,
  type FlowMapNodeData,
  type FlowMapStickyNoteData,
} from '@/workflow-artifacts/workflowGraphLayout';
import { logAppError } from '@/utils/appError';

interface FlowMapCanvasProps {
  documentId: string;
  flowTitle: string;
  overlay?: FlowMapOverlay | null;
  onOverlaySave?: (overlay: FlowMapOverlay) => Promise<void>;
  isSavingOverlay?: boolean;
}

const nodeTypes: NodeTypes = {
  flowMap: FlowMapCanvasNode,
  stickyNote: FlowMapStickyNoteNode,
};

type CanvasNode = Node<FlowMapNodeData | FlowMapStickyNoteData>;

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface FlowMapCanvasViewportProps {
  documentId: string;
  graph: WorkflowGraph;
  flowTitle: string;
  contextMap: Map<string, WorkflowGraphNodeContext>;
  screenshotUrls: Record<string, string>;
  overlay: FlowMapOverlay;
  onOverlaySave?: (overlay: FlowMapOverlay) => Promise<void>;
  isSavingOverlay?: boolean;
}

function createNoteId(): string {
  return crypto.randomUUID();
}

const FlowMapCanvasViewport = forwardRef<FlowMapCanvasHandle, FlowMapCanvasViewportProps>(
  (
    {
      documentId,
      graph,
      flowTitle,
      contextMap,
      screenshotUrls,
      overlay: initialOverlay,
      onOverlaySave,
      isSavingOverlay,
    },
    ref,
  ) => {
    const { fitView, getNodes, screenToFlowPosition } = useReactFlow();
    const flowContainerRef = useRef<HTMLDivElement>(null);
    const saveTimerRef = useRef<number | null>(null);
    const savedTimerRef = useRef<number | null>(null);
    const overlayRef = useRef(initialOverlay);
    const persistOverlayRef = useRef<(next: FlowMapOverlay) => void>(() => undefined);
    const deleteStickyRef = useRef<(nodeId: string) => void>(() => undefined);

    const [overlay, setOverlay] = useState<FlowMapOverlay>(initialOverlay);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    overlayRef.current = overlay;

    const onDeleteStickyStable = useCallback((nodeId: string) => {
      deleteStickyRef.current(nodeId);
    }, []);

    const baseCanvas = useMemo(
      () =>
        workflowGraphToFlowCanvas(graph, {
          overlay,
          isEditMode,
          onDeleteSticky: onDeleteStickyStable,
        }),
      [graph, overlay, isEditMode, onDeleteStickyStable],
    );

    const [nodes, setNodes] = useState<CanvasNode[]>(baseCanvas.nodes);
    const [edges, setEdges] = useState(baseCanvas.edges);

    useEffect(() => {
      setOverlay(initialOverlay);
    }, [initialOverlay]);

    useEffect(() => {
      setNodes(baseCanvas.nodes);
      setEdges(baseCanvas.edges);
    }, [baseCanvas.edges, baseCanvas.nodes]);

    useEffect(() => {
      if (isSavingOverlay) {
        setSaveState('saving');
        return;
      }
      if (saveState === 'saving') setSaveState('saved');
    }, [isSavingOverlay, saveState]);

    const stats = useMemo(() => getWorkflowGraphStats(graph), [graph]);
    const readableMinZoom = useMemo(() => getReadableMinZoom(stats.steps), [stats.steps]);

    const persistOverlay = useCallback(
      (next: FlowMapOverlay) => {
        setOverlay(next);
        if (!onOverlaySave) return;

        if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = window.setTimeout(() => {
          setSaveState('saving');
          void onOverlaySave(next)
            .then(() => {
              setSaveState('saved');
              trackEvent(AnalyticsEvents.flowMapOverlaySaved, {
                position_count: Object.keys(next.nodePositions).length,
                status_count: Object.keys(next.nodeStatuses).length,
                note_count: Object.keys(next.nodeNotes).length,
                sticky_count: next.stickyNotes.length,
              });
              if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
              savedTimerRef.current = window.setTimeout(() => setSaveState('idle'), 2000);
            })
            .catch(() => setSaveState('error'));
        }, 500);
      },
      [onOverlaySave],
    );

    persistOverlayRef.current = persistOverlay;

    const deleteStickyByNodeId = useCallback((nodeId: string) => {
      const noteId = parseStickyNoteId(nodeId);
      if (!noteId) return;

      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setSelectedNodeId((current) => (current === nodeId ? null : current));

      const next: FlowMapOverlay = {
        ...overlayRef.current,
        stickyNotes: overlayRef.current.stickyNotes.filter((note) => note.id !== noteId),
      };
      persistOverlayRef.current(next);
    }, []);

    deleteStickyRef.current = deleteStickyByNodeId;

    const syncPositionsFromNodes = useCallback(
      (nextNodes: CanvasNode[], base: FlowMapOverlay) => {
        const nextOverlay = buildOverlayFromNodes(base, nextNodes);
        persistOverlay(nextOverlay);
      },
      [persistOverlay],
    );

    const selectedNode = useMemo(
      () => graph.nodes.find((node) => node.id === selectedNodeId) ?? null,
      [graph.nodes, selectedNodeId],
    );

    const selectedSticky = useMemo(() => {
      if (!selectedNodeId) return null;
      const noteId = parseStickyNoteId(selectedNodeId);
      if (!noteId) return null;
      const node = nodes.find((item) => item.id === selectedNodeId);
      if (!node || node.type !== 'stickyNote') return null;
      return { noteId, data: node.data as FlowMapStickyNoteData };
    }, [nodes, selectedNodeId]);

    const inspectorSelection = useMemo((): FlowMapInspectorSelection | null => {
      if (selectedSticky) {
        return { type: 'sticky', noteId: selectedSticky.noteId, data: selectedSticky.data };
      }
      if (selectedNode) {
        return {
          type: 'node',
          node: selectedNode,
          context: contextMap.get(selectedNode.id),
        };
      }
      return null;
    }, [contextMap, selectedNode, selectedSticky]);

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
            nodes: getFlowMapFocusNodes(nodes),
            duration: 0,
          });
        }
      },
      [fitView, flowTitle, getNodes, graph.title, nodes, stats.steps],
    );

    useImperativeHandle(ref, () => ({ downloadPng }), [downloadPng]);

    const handleFitView = useCallback(() => {
      void fitView(getFlowMapFitViewOptions(stats.steps));
    }, [fitView, stats.steps]);

    const handleToggleFullscreen = useCallback(() => {
      setIsFullscreen((current) => !current);
    }, []);

    useEffect(() => {
      if (!isFullscreen) return;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }, [isFullscreen]);

    useEffect(() => {
      const timer = window.setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        void fitView(getFlowMapFitViewOptions(stats.steps));
      }, 80);
      return () => window.clearTimeout(timer);
    }, [fitView, isFullscreen, stats.steps]);

    // Fit once when the graph structure loads — not on every node drag (nodes updates).
    useEffect(() => {
      const timer = window.setTimeout(() => {
        void fitView({
          ...getFlowMapInitialViewOptions(stats.steps),
          nodes: getFlowMapFocusNodes(getNodes()),
        });
      }, 60);
      return () => window.clearTimeout(timer);
    }, [fitView, getNodes, graph, stats.steps]);

    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
          return;
        }
        if (event.key === 'Escape') {
          if (isFullscreen) {
            setIsFullscreen(false);
            return;
          }
          setSelectedNodeId(null);
        }
        if (event.key === 'f' || event.key === 'F') {
          handleFitView();
        }
        if (
          isEditMode &&
          selectedNodeId &&
          parseStickyNoteId(selectedNodeId) &&
          (event.key === 'Delete' || event.key === 'Backspace')
        ) {
          event.preventDefault();
          deleteStickyByNodeId(selectedNodeId);
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [deleteStickyByNodeId, handleFitView, isEditMode, isFullscreen, selectedNodeId]);

    const onNodesChange = useCallback(
      (changes: NodeChange<CanvasNode>[]) => {
        setNodes((current) => {
          const next = applyNodeChanges(changes, current);
          const moved = changes.some((change) => change.type === 'position' && change.dragging === false);
          if (moved) syncPositionsFromNodes(next, overlay);
          return next;
        });
      },
      [overlay, syncPositionsFromNodes],
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: CanvasNode) => {
      setSelectedNodeId(node.id);
    }, []);

    const onPaneClick = useCallback(() => {
      setSelectedNodeId(null);
    }, []);

    const handleToggleEditMode = useCallback(() => {
      setIsEditMode((current) => {
        const next = !current;
        trackEvent(AnalyticsEvents.flowMapEditModeToggled, { enabled: next });
        return next;
      });
    }, []);

    const handleResetLayout = useCallback(() => {
      const next: FlowMapOverlay = {
        ...overlay,
        nodePositions: {},
        stickyNotes: [],
      };
      persistOverlay(next);
      setSelectedNodeId(null);
      trackEvent(AnalyticsEvents.flowMapLayoutReset);
    }, [overlay, persistOverlay]);

    const handleAddStickyNote = useCallback(() => {
      const container = flowContainerRef.current;
      const rect = container?.getBoundingClientRect();
      const center = rect
        ? screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
        : { x: 120, y: 120 };
      const noteId = createNoteId();
      const next: FlowMapOverlay = {
        ...overlay,
        stickyNotes: [
          ...overlay.stickyNotes,
          { id: noteId, x: center.x, y: center.y, text: '', color: 'yellow' },
        ],
      };
      persistOverlay(next);
      setSelectedNodeId(stickyNoteId(noteId));
    }, [overlay, persistOverlay, screenToFlowPosition]);

    const updateOverlayField = useCallback(
      (updater: (current: FlowMapOverlay) => FlowMapOverlay) => {
        const next = updater(overlay);
        persistOverlay(next);
        setNodes((current) =>
          current.map((node) => {
            if (node.type !== 'flowMap') return node;
            const data = node.data as FlowMapNodeData;
            return {
              ...node,
              data: {
                ...data,
                status: next.nodeStatuses[node.id],
                reviewerNote: next.nodeNotes[node.id],
              },
            };
          }),
        );
      },
      [overlay, persistOverlay],
    );

    const handleStatusChange = useCallback(
      (status: FlowMapNodeStatus | undefined) => {
        if (!selectedNodeId || selectedSticky) return;
        updateOverlayField((current) => {
          const nodeStatuses = { ...current.nodeStatuses };
          if (status) nodeStatuses[selectedNodeId] = status;
          else delete nodeStatuses[selectedNodeId];
          return { ...current, nodeStatuses };
        });
      },
      [selectedNodeId, selectedSticky, updateOverlayField],
    );

    const handleReviewerNoteChange = useCallback(
      (note: string) => {
        if (!selectedNodeId || selectedSticky) return;
        updateOverlayField((current) => ({
          ...current,
          nodeNotes: { ...current.nodeNotes, [selectedNodeId]: note },
        }));
      },
      [selectedNodeId, selectedSticky, updateOverlayField],
    );

    const handleStickyTextChange = useCallback(
      (text: string) => {
        if (!selectedSticky) return;
        const next: FlowMapOverlay = {
          ...overlay,
          stickyNotes: overlay.stickyNotes.map((note) =>
            note.id === selectedSticky.noteId ? { ...note, text } : note,
          ),
        };
        persistOverlay(next);
        setNodes((current) =>
          current.map((node) =>
            node.id === selectedNodeId
              ? { ...node, data: { ...(node.data as FlowMapStickyNoteData), text } }
              : node,
          ),
        );
      },
      [overlay, persistOverlay, selectedNodeId, selectedSticky],
    );

    const handleDeleteSticky = useCallback(() => {
      if (!selectedNodeId || !parseStickyNoteId(selectedNodeId)) return;
      deleteStickyByNodeId(selectedNodeId);
    }, [deleteStickyByNodeId, selectedNodeId]);

    return (
      <div
        className={
          isFullscreen
            ? 'fixed inset-0 z-[100] flex flex-col bg-white'
            : 'flex flex-col'
        }
      >
        <FlowMapCanvasToolbar
          flowTitle={flowTitle || graph.title}
          stats={stats}
          isEditMode={isEditMode}
          isFullscreen={isFullscreen}
          saveState={saveState}
          onFitView={handleFitView}
          onClearSelection={() => setSelectedNodeId(null)}
          onToggleEditMode={handleToggleEditMode}
          onToggleFullscreen={handleToggleFullscreen}
          onResetLayout={handleResetLayout}
          onAddStickyNote={handleAddStickyNote}
          hasSelection={Boolean(inspectorSelection)}
        />
        <FlowMapCanvasLegend stepCount={stats.steps} isEditMode={isEditMode} />
        <div
          ref={flowContainerRef}
          className={
            isFullscreen
              ? 'relative min-h-0 flex-1 bg-gradient-to-br from-slate-100 via-slate-50 to-peacock-50/40'
              : 'relative h-[min(78vh,760px)] bg-gradient-to-br from-slate-100 via-slate-50 to-peacock-50/40'
          }
        >
          <ReactFlow
            className="flow-map-canvas-export"
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodesDraggable={isEditMode}
            nodesConnectable={false}
            elementsSelectable
            autoPanOnNodeDrag={false}
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
            <MiniMap
              className="!hidden sm:!block !rounded-xl !border !border-slate-200 !bg-white/95 !shadow-lg"
              nodeColor={(node) => (node.type === 'stickyNote' ? '#fbbf24' : '#0d9488')}
              maskColor="rgba(15, 23, 42, 0.08)"
            />
            <Controls
              showInteractive={false}
              className="!rounded-xl !border !border-slate-200 !bg-white/95 !shadow-lg"
            />
          </ReactFlow>
          {inspectorSelection ? (
            <FlowMapNodeInspector
              selection={inspectorSelection}
              documentId={documentId}
              screenshotUrls={screenshotUrls}
              isEditMode={isEditMode}
              reviewerNote={selectedNodeId ? overlay.nodeNotes[selectedNodeId] : undefined}
              nodeStatus={selectedNodeId ? overlay.nodeStatuses[selectedNodeId] : undefined}
              onStatusChange={isEditMode ? handleStatusChange : undefined}
              onReviewerNoteChange={isEditMode ? handleReviewerNoteChange : undefined}
              onStickyTextChange={isEditMode ? handleStickyTextChange : undefined}
              onDeleteSticky={isEditMode ? handleDeleteSticky : undefined}
            />
          ) : null}
        </div>
      </div>
    );
  },
);

FlowMapCanvasViewport.displayName = 'FlowMapCanvasViewport';

export const FlowMapCanvas = forwardRef<FlowMapCanvasHandle, FlowMapCanvasProps>(
  ({ documentId, flowTitle, overlay, onOverlaySave, isSavingOverlay }, ref) => {
    const viewportRef = useRef<FlowMapCanvasHandle>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [graphKey, setGraphKey] = useState(0);
    const [graph, setGraph] = useState<WorkflowGraph | null>(null);
    const [contextMap, setContextMap] = useState<Map<string, WorkflowGraphNodeContext>>(new Map());
    const [screenshotUrls, setScreenshotUrls] = useState<Record<string, string>>({});

    const resolvedOverlay = overlay ?? EMPTY_FLOW_MAP_OVERLAY;

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
          const title = flowTitle || doc.flow.flow.title;
          setGraph(buildWorkflowGraph(title, doc.steps));
          setContextMap(buildWorkflowGraphContextMap(doc.steps));
          setScreenshotUrls(doc.screenshotUrls ?? {});
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
          <FlowMapCanvasViewport
            ref={viewportRef}
            documentId={documentId}
            graph={graph}
            flowTitle={flowTitle}
            contextMap={contextMap}
            screenshotUrls={screenshotUrls}
            overlay={resolvedOverlay}
            onOverlaySave={onOverlaySave}
            isSavingOverlay={isSavingOverlay}
          />
        </ReactFlowProvider>
      </div>
    );
  },
);

FlowMapCanvas.displayName = 'FlowMapCanvas';
