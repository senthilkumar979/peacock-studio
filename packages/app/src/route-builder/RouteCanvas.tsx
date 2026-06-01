import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BranchCanvasNode } from '@/route-builder/BranchCanvasNode';
import { ChapterCanvasNode } from '@/route-builder/ChapterCanvasNode';
import { FormCanvasNode } from '@/route-builder/FormCanvasNode';
import { InterestCanvasNode } from '@/route-builder/InterestCanvasNode';
import { buildCanvasEdges, buildCanvasNodes } from '@/route-builder/routeCanvasMapper';
import { useRouteBuilderStore } from '@/store/routeBuilderStore';
import { validateRoute } from '@/utils/routeValidation';
import { createRouteEdge } from '@/utils/createRoute';

const nodeTypes = {
  chapter: ChapterCanvasNode,
  branch: BranchCanvasNode,
  form: FormCanvasNode,
  interest: InterestCanvasNode,
};

export const RouteCanvas = () => {
  const route = useRouteBuilderStore((state) => state.route);
  const selectedNodeId = useRouteBuilderStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useRouteBuilderStore((state) => state.setSelectedNodeId);
  const updateNodePosition = useRouteBuilderStore((state) => state.updateNodePosition);
  const addGraphEdge = useRouteBuilderStore((state) => state.addGraphEdge);
  const removeGraphEdge = useRouteBuilderStore((state) => state.removeGraphEdge);

  const issues = useMemo(() => (route ? validateRoute(route) : []), [route]);

  const mappedNodes = useMemo(
    () => (route ? buildCanvasNodes(route, selectedNodeId, issues) : []),
    [route, selectedNodeId, issues]
  );
  const mappedEdges = useMemo(() => (route ? buildCanvasEdges(route) : []), [route]);

  const [nodes, setNodes] = useState(mappedNodes);
  const [edges, setEdges] = useState(mappedEdges);

  useEffect(() => {
    setNodes(mappedNodes);
  }, [mappedNodes]);

  useEffect(() => {
    setEdges(mappedEdges);
  }, [mappedEdges]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((current) => applyNodeChanges(changes, current));
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          updateNodePosition(change.id, change.position);
        }
      });
    },
    [updateNodePosition]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((current) => applyEdgeChanges(changes, current));
      changes.forEach((change) => {
        if (change.type === 'remove') {
          removeGraphEdge(change.id);
        }
      });
    },
    [removeGraphEdge]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      addGraphEdge(
        createRouteEdge(
          connection.source,
          connection.target,
          connection.sourceHandle ?? undefined
        )
      );
    },
    [addGraphEdge]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  if (!route) return null;

  return (
    <div className="h-full min-h-[560px] w-full rounded-2xl border border-slate-200 bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="#cbd5e1" />
        <MiniMap pannable zoomable />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};
