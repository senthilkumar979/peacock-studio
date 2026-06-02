import { sortBranchPaths, type FlowBranch } from '@peacock/shared';

export type PdfPathSelections = Record<string, string>;

export function buildDefaultPdfPathSelections(branches: FlowBranch[]): PdfPathSelections {
  const selections: PdfPathSelections = {};
  for (const branch of branches) {
    const firstPath = sortBranchPaths(branch.paths)[0];
    if (firstPath) selections[branch.id] = firstPath.id;
  }
  return selections;
}

export function hasCompletePdfPathSelections(
  branches: FlowBranch[],
  selections: PdfPathSelections,
): boolean {
  return branches.every((branch) => {
    if (!branch.paths.length) return true;
    const selectedId = selections[branch.id];
    return Boolean(selectedId && branch.paths.some((path) => path.id === selectedId));
  });
}
