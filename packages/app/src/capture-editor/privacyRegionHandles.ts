import type { NormalizedRect } from '@peacock/shared';

export type PrivacyRegionHandle =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w';

export interface CanvasRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_NORMALIZED_SIZE = 0.02;
const HANDLE_HIT_RADIUS = 10;

function clampRect(rect: NormalizedRect): NormalizedRect {
  let { x, y, width, height } = rect;
  width = Math.max(MIN_NORMALIZED_SIZE, width);
  height = Math.max(MIN_NORMALIZED_SIZE, height);
  x = Math.max(0, Math.min(1 - width, x));
  y = Math.max(0, Math.min(1 - height, y));
  return { x, y, width, height };
}

export function getPrivacyRegionHandlePositions(rect: CanvasRect): Record<PrivacyRegionHandle, { x: number; y: number }> {
  const { x, y, width, height } = rect;
  const right = x + width;
  const bottom = y + height;
  const midX = x + width / 2;
  const midY = y + height / 2;

  return {
    nw: { x, y },
    n: { x: midX, y },
    ne: { x: right, y },
    e: { x: right, y: midY },
    se: { x: right, y: bottom },
    s: { x: midX, y: bottom },
    sw: { x, y: bottom },
    w: { x, y: midY },
  };
}

export function hitTestPrivacyRegionHandle(
  canvasX: number,
  canvasY: number,
  rect: CanvasRect,
): PrivacyRegionHandle | null {
  const handles = getPrivacyRegionHandlePositions(rect);

  for (const [handle, point] of Object.entries(handles) as [PrivacyRegionHandle, { x: number; y: number }][]) {
    const dx = canvasX - point.x;
    const dy = canvasY - point.y;
    if (dx * dx + dy * dy <= HANDLE_HIT_RADIUS * HANDLE_HIT_RADIUS) {
      return handle;
    }
  }

  return null;
}

export function getPrivacyRegionHandleCursor(handle: PrivacyRegionHandle): string {
  const cursors: Record<PrivacyRegionHandle, string> = {
    nw: 'nwse-resize',
    n: 'ns-resize',
    ne: 'nesw-resize',
    e: 'ew-resize',
    se: 'nwse-resize',
    s: 'ns-resize',
    sw: 'nesw-resize',
    w: 'ew-resize',
  };
  return cursors[handle];
}

export function resizeNormalizedRect(
  origin: NormalizedRect,
  handle: PrivacyRegionHandle,
  pointerX: number,
  pointerY: number,
): NormalizedRect {
  const right = origin.x + origin.width;
  const bottom = origin.y + origin.height;
  let x = origin.x;
  let y = origin.y;
  let rightEdge = right;
  let bottomEdge = bottom;

  switch (handle) {
    case 'nw':
      x = pointerX;
      y = pointerY;
      break;
    case 'n':
      y = pointerY;
      break;
    case 'ne':
      rightEdge = pointerX;
      y = pointerY;
      break;
    case 'e':
      rightEdge = pointerX;
      break;
    case 'se':
      rightEdge = pointerX;
      bottomEdge = pointerY;
      break;
    case 's':
      bottomEdge = pointerY;
      break;
    case 'sw':
      x = pointerX;
      bottomEdge = pointerY;
      break;
    case 'w':
      x = pointerX;
      break;
    default:
      break;
  }

  if (rightEdge < x) {
    const swap = rightEdge;
    rightEdge = x;
    x = swap;
  }

  if (bottomEdge < y) {
    const swap = bottomEdge;
    bottomEdge = y;
    y = swap;
  }

  return clampRect({
    x,
    y,
    width: rightEdge - x,
    height: bottomEdge - y,
  });
}
