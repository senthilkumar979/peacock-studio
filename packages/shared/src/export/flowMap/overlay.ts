import type { WorkflowGraph } from '../workflowGraph/types';

export type FlowMapNodeStatus = 'draft' | 'in_review' | 'approved' | 'needs_work';

export interface FlowMapStickyNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color?: string;
}

export interface FlowMapOverlay {
  version: 1;
  nodePositions: Record<string, { x: number; y: number }>;
  nodeStatuses: Record<string, FlowMapNodeStatus>;
  nodeNotes: Record<string, string>;
  stickyNotes: FlowMapStickyNote[];
}

export const EMPTY_FLOW_MAP_OVERLAY: FlowMapOverlay = {
  version: 1,
  nodePositions: {},
  nodeStatuses: {},
  nodeNotes: {},
  stickyNotes: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFlowMapNodeStatus(value: unknown): value is FlowMapNodeStatus {
  return (
    value === 'draft' ||
    value === 'in_review' ||
    value === 'approved' ||
    value === 'needs_work'
  );
}

function parsePosition(value: unknown): { x: number; y: number } | null {
  if (!isRecord(value)) return null;
  const x = value.x;
  const y = value.y;
  if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  return { x, y };
}

function parseStickyNote(value: unknown): FlowMapStickyNote | null {
  if (!isRecord(value)) return null;
  const id = value.id;
  const text = value.text;
  if (typeof id !== 'string' || !id.trim()) return null;
  const position = parsePosition(value);
  if (!position) return null;
  const note: FlowMapStickyNote = {
    id: id.trim(),
    x: position.x,
    y: position.y,
    text: typeof text === 'string' ? text : '',
  };
  if (typeof value.color === 'string' && value.color.trim()) {
    note.color = value.color.trim();
  }
  return note;
}

export function parseFlowMapOverlay(metadata: unknown): FlowMapOverlay | null {
  if (!isRecord(metadata)) return null;
  if (metadata.version !== 1) return null;

  const nodePositions: FlowMapOverlay['nodePositions'] = {};
  if (isRecord(metadata.nodePositions)) {
    for (const [nodeId, position] of Object.entries(metadata.nodePositions)) {
      const parsed = parsePosition(position);
      if (parsed) nodePositions[nodeId] = parsed;
    }
  }

  const nodeStatuses: FlowMapOverlay['nodeStatuses'] = {};
  if (isRecord(metadata.nodeStatuses)) {
    for (const [nodeId, status] of Object.entries(metadata.nodeStatuses)) {
      if (isFlowMapNodeStatus(status)) nodeStatuses[nodeId] = status;
    }
  }

  const nodeNotes: FlowMapOverlay['nodeNotes'] = {};
  if (isRecord(metadata.nodeNotes)) {
    for (const [nodeId, note] of Object.entries(metadata.nodeNotes)) {
      if (typeof note === 'string') nodeNotes[nodeId] = note;
    }
  }

  const stickyNotes: FlowMapStickyNote[] = [];
  if (Array.isArray(metadata.stickyNotes)) {
    for (const item of metadata.stickyNotes) {
      const parsed = parseStickyNote(item);
      if (parsed) stickyNotes.push(parsed);
    }
  }

  return {
    version: 1,
    nodePositions,
    nodeStatuses,
    nodeNotes,
    stickyNotes,
  };
}

export function pruneFlowMapOverlay(overlay: FlowMapOverlay, graph: WorkflowGraph): FlowMapOverlay {
  const nodeIds = new Set(graph.nodes.map((node) => node.id));

  const nodePositions: FlowMapOverlay['nodePositions'] = {};
  for (const [nodeId, position] of Object.entries(overlay.nodePositions)) {
    if (nodeIds.has(nodeId)) nodePositions[nodeId] = position;
  }

  const nodeStatuses: FlowMapOverlay['nodeStatuses'] = {};
  for (const [nodeId, status] of Object.entries(overlay.nodeStatuses)) {
    if (nodeIds.has(nodeId)) nodeStatuses[nodeId] = status;
  }

  const nodeNotes: FlowMapOverlay['nodeNotes'] = {};
  for (const [nodeId, note] of Object.entries(overlay.nodeNotes)) {
    if (nodeIds.has(nodeId)) nodeNotes[nodeId] = note;
  }

  return {
    version: 1,
    nodePositions,
    nodeStatuses,
    nodeNotes,
    stickyNotes: overlay.stickyNotes,
  };
}

export function applyFlowMapOverlayPositions(
  autoPositions: Map<string, { x: number; y: number }>,
  overlay: FlowMapOverlay | null | undefined,
): Map<string, { x: number; y: number }> {
  if (!overlay) return autoPositions;

  const merged = new Map(autoPositions);
  for (const [nodeId, position] of Object.entries(overlay.nodePositions)) {
    if (merged.has(nodeId)) merged.set(nodeId, position);
  }
  return merged;
}
