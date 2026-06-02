import type {
  FlowBranch,
  FlowBranchPresentation,
  FlowOutlineItem,
  FlowStep,
  LinkedPeacockPath,
} from '../types/events';
import { getPlayableSteps, isFlowBranch } from '../types/events';

export function sortBranchPaths(paths: LinkedPeacockPath[]): LinkedPeacockPath[] {
  return [...paths].sort((a, b) => a.order - b.order);
}

export function getBranchPresentation(
  branch: FlowBranch,
): FlowBranchPresentation {
  if (branch.presentation) return branch.presentation;
  return branch.paths.length >= 4 ? 'grid' : 'list';
}

export function getPlayableStepRange(
  steps: FlowOutlineItem[],
  fromStepId: string,
  toStepId: string,
): FlowStep[] | null {
  const playable = getPlayableSteps(steps);
  const fromIndex = playable.findIndex((step) => step.id === fromStepId);
  const toIndex = playable.findIndex((step) => step.id === toStepId);
  if (fromIndex < 0 || toIndex < 0) return null;

  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  return playable.slice(start, end + 1);
}

export function formatPathStepRange(
  steps: FlowOutlineItem[],
  fromStepId: string,
  toStepId: string,
): string {
  const playable = getPlayableSteps(steps);
  const fromIndex = playable.findIndex((step) => step.id === fromStepId);
  const toIndex = playable.findIndex((step) => step.id === toStepId);
  if (fromIndex < 0 || toIndex < 0) return 'Invalid range';

  const start = Math.min(fromIndex, toIndex) + 1;
  const end = Math.max(fromIndex, toIndex) + 1;
  return start === end ? `Step ${start}` : `Steps ${start}–${end}`;
}

export function collectLinkedDocumentIds(items: FlowOutlineItem[]): string[] {
  const ids = new Set<string>();
  for (const item of items) {
    if (!isFlowBranch(item)) continue;
    for (const path of item.paths) {
      ids.add(path.targetDocumentId);
    }
  }
  return [...ids];
}

export function collectAllBranches(items: FlowOutlineItem[]): FlowBranch[] {
  return items.filter(isFlowBranch);
}

export function hasDuplicatePathLabels(paths: LinkedPeacockPath[]): boolean {
  const seen = new Set<string>();
  for (const path of paths) {
    const key = path.label.trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

export function wouldCreateCircularLink(
  hostDocumentId: string,
  targetDocumentId: string,
): boolean {
  return hostDocumentId === targetDocumentId;
}
