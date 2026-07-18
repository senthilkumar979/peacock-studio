import { Position } from '@xyflow/react';

interface Point {
  x: number;
  y: number;
}

const SAME_ROW_Y_THRESHOLD = 28;
const STACKED_COLUMN_X_THRESHOLD = 96;

export function positionToId(position: Position): string {
  switch (position) {
    case Position.Top:
      return 'top';
    case Position.Right:
      return 'right';
    case Position.Bottom:
      return 'bottom';
    case Position.Left:
      return 'left';
    default:
      return 'bottom';
  }
}

export function getFlowHandlePositions(from: Point, to: Point): {
  source: Position;
  target: Position;
} {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const horizontal = Math.abs(dx) > Math.abs(dy) * 0.65;

  if (horizontal) {
    return dx >= 0
      ? { source: Position.Right, target: Position.Left }
      : { source: Position.Left, target: Position.Right };
  }

  return dy >= 0
    ? { source: Position.Bottom, target: Position.Top }
    : { source: Position.Top, target: Position.Bottom };
}

export function getEdgeHandleIds(
  from: Point,
  to: Point,
  options?: { sourceOverride?: string; targetOverride?: string },
): { sourceHandle: string; targetHandle: string } {
  if (options?.sourceOverride || options?.targetOverride) {
    return {
      sourceHandle: options.sourceOverride ?? 'source-bottom',
      targetHandle: options.targetOverride ?? 'target-top',
    };
  }

  const positions = getFlowHandlePositions(from, to);
  return {
    sourceHandle: `source-${positionToId(positions.source)}`,
    targetHandle: `target-${positionToId(positions.target)}`,
  };
}

/** Branch → spine/step: avoid bottom handles reserved for path exits. */
export function getBranchSpineEdgeHandles(from: Point, to: Point): {
  sourceHandle: string;
  targetHandle: string;
} {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const isStackedBelow = dy > SAME_ROW_Y_THRESHOLD && Math.abs(dx) < STACKED_COLUMN_X_THRESHOLD;

  if (isStackedBelow) {
    const exitSide = dx >= 0 ? 'right' : 'left';
    return {
      sourceHandle: `source-${exitSide}`,
      targetHandle: 'target-top',
    };
  }

  const positions = getFlowHandlePositions(from, to);
  if (positions.source === Position.Bottom) {
    const exitSide = dx >= 0 ? 'right' : 'left';
    return {
      sourceHandle: `source-${exitSide}`,
      targetHandle: `target-${positionToId(positions.target)}`,
    };
  }

  return getEdgeHandleIds(from, to);
}

export function getBranchPathSourceHandleIndex(pathIndex: number, pathCount: number): string {
  return `source-path-${pathIndex}-${pathCount}`;
}

export function getEdgePathOffset(options: {
  from: Point;
  to: Point;
  pathIndex?: number;
  rowLane?: number;
}): number {
  const base = 32;

  if (typeof options.pathIndex === 'number') {
    return base + 28 + options.pathIndex * 22;
  }

  const dy = Math.abs(options.to.y - options.from.y);
  const dx = Math.abs(options.to.x - options.from.x);
  const isSameRow = dy < SAME_ROW_Y_THRESHOLD && dx > 40;
  const isRowWrap = dx < STACKED_COLUMN_X_THRESHOLD && dy > SAME_ROW_Y_THRESHOLD;

  if (isSameRow && typeof options.rowLane === 'number') {
    return base + 12 + options.rowLane * 20;
  }

  if (isRowWrap) {
    return base + 36;
  }

  return base;
}

export function getRowLaneKey(point: Point): number {
  return Math.round(point.y / 10) * 10;
}
