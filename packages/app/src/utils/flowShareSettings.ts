import {
  collectAllBranches,
  isFlowBranch,
  sortBranchPaths,
  type FlowOutlineItem,
} from '@peacock/shared';
import type { FlowShareSettings } from '@/types/savedFlow';

export interface FlowViewerFilter {
  includeMainFlow: boolean;
  enabledPathIds: Set<string>;
  enabledBranchIds: Set<string>;
}

export function buildDefaultShareSettings(steps: FlowOutlineItem[]): FlowShareSettings {
  const branches = collectAllBranches(steps);
  return {
    includeMainFlow: true,
    enabledPathIds: branches.flatMap((branch) => branch.paths.map((path) => path.id)),
    enabledBranchIds: branches.map((branch) => branch.id),
  };
}

export function resolveShareSettings(
  steps: FlowOutlineItem[],
  stored?: FlowShareSettings,
): FlowShareSettings {
  const defaults = buildDefaultShareSettings(steps);
  if (!stored) return defaults;

  const pathIds = new Set(defaults.enabledPathIds);
  const branchIds = new Set(defaults.enabledBranchIds);

  return {
    includeMainFlow: true,
    enabledPathIds: stored.enabledPathIds.filter((id) => pathIds.has(id)),
    enabledBranchIds: stored.enabledBranchIds.filter((id) => branchIds.has(id)),
  };
}

export function parseShareSearchParams(
  params: URLSearchParams,
  steps: FlowOutlineItem[],
  stored?: FlowShareSettings,
): FlowViewerFilter | null {
  const hasPaths = params.has('paths');
  const hasBranches = params.has('branches');
  if (!hasPaths && !hasBranches) return null;

  const defaults = resolveShareSettings(steps, stored);
  const enabledPathIds = hasPaths
    ? new Set(params.get('paths')?.split(',').filter(Boolean) ?? [])
    : new Set(defaults.enabledPathIds);
  const enabledBranchIds = hasBranches
    ? new Set(params.get('branches')?.split(',').filter(Boolean) ?? [])
    : new Set(defaults.enabledBranchIds);

  return { includeMainFlow: true, enabledPathIds, enabledBranchIds };
}

export function buildShareQueryString(settings: FlowShareSettings): string {
  const params = new URLSearchParams();
  if (settings.enabledPathIds.length) params.set('paths', settings.enabledPathIds.join(','));
  if (settings.enabledBranchIds.length) {
    params.set('branches', settings.enabledBranchIds.join(','));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function filterOutlineForViewer(
  steps: FlowOutlineItem[],
  filter: FlowViewerFilter | null,
): FlowOutlineItem[] {
  if (!filter) return steps;

  return steps
    .map((item) => {
      if (!isFlowBranch(item)) return item;
      if (!filter.enabledBranchIds.has(item.id)) return null;

      const paths = sortBranchPaths(item.paths).filter((path) =>
        filter.enabledPathIds.has(path.id),
      );
      if (!paths.length) return null;
      return { ...item, paths };
    })
    .filter((item): item is FlowOutlineItem => {
      if (!item) return false;
      if (filter.includeMainFlow) return true;
      return isFlowBranch(item);
    });
}
