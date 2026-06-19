import {
  getPlayableSteps,
  isFlowBranch,
  isFlowSection,
  isFlowStep,
  sortBranchPaths,
  type FlowOutlineItem,
} from '@peacock/shared';
import type { LinkedPathContent } from '@/hooks/useDocumentBranchPaths';
import type { DocumentStepIndexItem } from '@/player/DocumentStepIndex';
import {
  FLOW_DETAILS_OUTLINE_ID,
  getDocumentStepAnchor,
  getLinkedDocumentPathAnchor,
  getLinkedDocumentStepAnchor,
} from '@/utils/shareLink';

const OUTLINE_PATH_LABEL_MAX_LENGTH = 32;

export function truncateOutlinePathLabel(label: string, maxLength = OUTLINE_PATH_LABEL_MAX_LENGTH): string {
  const trimmed = label.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

interface BuildDocumentIndexItemsOptions {
  steps: FlowOutlineItem[];
  flowTitle?: string;
  flowDetailsAnchor: string;
  selectedPathByBranchId: Record<string, string>;
  linkedContentByPathId: Record<string, LinkedPathContent>;
}

export function buildDocumentIndexItems({
  steps,
  flowTitle,
  flowDetailsAnchor,
  selectedPathByBranchId,
  linkedContentByPathId,
}: BuildDocumentIndexItemsOptions): DocumentStepIndexItem[] {
  const overviewItem: DocumentStepIndexItem = {
    type: 'overview',
    anchorId: flowDetailsAnchor,
    itemId: FLOW_DETAILS_OUTLINE_ID,
    title: flowTitle?.trim() || 'Flow details',
  };

  let stepNumber = 0;
  const outlineItems: DocumentStepIndexItem[] = [];

  for (const item of steps) {
    const anchorId = getDocumentStepAnchor(item.id);

    if (isFlowSection(item)) {
      outlineItems.push({
        type: 'section',
        anchorId,
        sectionId: item.id,
        title: item.title,
      });
      continue;
    }

    if (isFlowBranch(item)) {
      outlineItems.push({
        type: 'branch',
        anchorId,
        branchId: item.id,
        title: item.title,
      });

      const selectedPathId = selectedPathByBranchId[item.id];
      const linked = selectedPathId ? linkedContentByPathId[selectedPathId] : null;
      if (linked) {
        const selectedPath = sortBranchPaths(item.paths).find((path) => path.id === selectedPathId);
        const pathLabel = truncateOutlinePathLabel(selectedPath?.label ?? 'Selected path');

        outlineItems.push({
          type: 'linkedPath',
          anchorId: getLinkedDocumentPathAnchor(linked.pathId),
          branchId: item.id,
          pathId: linked.pathId,
          itemId: `path:${linked.pathId}`,
          pathLabel,
          fullPathLabel: selectedPath?.label?.trim() || 'Selected path',
        });

        for (const step of linked.steps) {
          stepNumber += 1;
          outlineItems.push({
            type: 'step',
            anchorId: getLinkedDocumentStepAnchor(linked.pathId, step.id),
            stepId: `${linked.pathId}:${step.id}`,
            stepNumber,
            title: step.title,
            isLinkedPathStep: true,
            pathId: linked.pathId,
          });
        }
      }
      continue;
    }

    if (isFlowStep(item)) {
      stepNumber += 1;
      outlineItems.push({
        type: 'step',
        anchorId,
        stepId: item.id,
        stepNumber,
        title: item.title,
      });
    }
  }

  return [overviewItem, ...outlineItems];
}

export function countDocumentViewPlayableSteps(
  steps: FlowOutlineItem[],
  selectedPathByBranchId: Record<string, string>,
  linkedContentByPathId: Record<string, LinkedPathContent>,
): number {
  let count = getPlayableSteps(steps).length;

  for (const item of steps) {
    if (!isFlowBranch(item)) continue;
    const selectedPathId = selectedPathByBranchId[item.id];
    const linked = selectedPathId ? linkedContentByPathId[selectedPathId] : null;
    if (linked) count += linked.steps.length;
  }

  return count;
}

interface BranchRenderContext {
  selectedPathId: string | null;
  linkedContent: LinkedPathContent | null;
  loading: boolean;
  error: string | null;
  pathLabel: string | null;
}

export function getBranchRenderContext(
  branchId: string,
  branchPaths: { id: string; label: string }[],
  selectedPathByBranchId: Record<string, string>,
  linkedContentByPathId: Record<string, LinkedPathContent>,
  loadingPathIds: Set<string>,
  errorsByPathId: Record<string, string>,
): BranchRenderContext {
  const selectedPathId = selectedPathByBranchId[branchId] ?? null;
  const linkedContent = selectedPathId ? linkedContentByPathId[selectedPathId] ?? null : null;
  const selectedPath = branchPaths.find((path) => path.id === selectedPathId);

  return {
    selectedPathId,
    linkedContent,
    loading: selectedPathId ? loadingPathIds.has(selectedPathId) : false,
    error: selectedPathId ? errorsByPathId[selectedPathId] ?? null : null,
    pathLabel: selectedPath?.label ?? null,
  };
}
