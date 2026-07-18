import type { FitViewOptions, Node } from '@xyflow/react';

/** Minimum zoom so node cards stay readable on large flows. */
export function getReadableMinZoom(stepCount: number): number {
  if (stepCount <= 6) return 0.42;
  if (stepCount <= 10) return 0.64;
  if (stepCount <= 16) return 0.76;
  return 0.84;
}

export function getFlowMapFitViewOptions(stepCount: number): FitViewOptions {
  return {
    padding: 0.22,
    minZoom: getReadableMinZoom(stepCount),
    maxZoom: 1.15,
    duration: 280,
  };
}

/** Top-of-flow nodes to frame on first paint at a comfortable zoom. */
export function getFlowMapFocusNodes<T extends Node>(nodes: T[], limit = 7): T[] {
  return [...nodes]
    .sort((left, right) => left.position.y - right.position.y || left.position.x - right.position.x)
    .slice(0, limit);
}

export function getFlowMapInitialViewOptions(_stepCount: number): FitViewOptions {
  return {
    padding: 0.28,
    minZoom: 0.82,
    maxZoom: 1,
    duration: 280,
  };
}

export function shouldUseCompactLayout(nodeCount: number): boolean {
  return nodeCount > 10;
}
