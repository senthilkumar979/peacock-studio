import { useCallback, useEffect, useState } from 'react';
import {
  getPlayableStepRange,
  sortBranchPaths,
  type FlowBranch,
  type FlowStep,
  type LinkedPeacockPath,
} from '@peacock/shared';
import { getFlowDocument } from '@/services/flowLibraryService';

export interface LinkedPathContent {
  pathId: string;
  targetDocumentId: string;
  steps: FlowStep[];
  screenshotUrls: Record<string, string>;
}

async function fetchLinkedPathContent(path: LinkedPeacockPath): Promise<LinkedPathContent | null> {
  const doc = await getFlowDocument(path.targetDocumentId);
  if (!doc) return null;

  const steps = getPlayableStepRange(doc.steps, path.fromStepId, path.toStepId);
  if (!steps?.length) return null;

  return {
    pathId: path.id,
    targetDocumentId: path.targetDocumentId,
    steps,
    screenshotUrls: doc.screenshotUrls,
  };
}

export function useDocumentBranchPaths(branches: FlowBranch[]) {
  const [selectedPathByBranchId, setSelectedPathByBranchId] = useState<Record<string, string>>(
    {},
  );
  const [linkedContentByPathId, setLinkedContentByPathId] = useState<
    Record<string, LinkedPathContent>
  >({});
  const [loadingPathIds, setLoadingPathIds] = useState<Set<string>>(() => new Set());
  const [errorsByPathId, setErrorsByPathId] = useState<Record<string, string>>({});

  const loadPath = useCallback(async (path: LinkedPeacockPath) => {
    setLoadingPathIds((current) => new Set(current).add(path.id));
    setErrorsByPathId((current) => {
      const next = { ...current };
      delete next[path.id];
      return next;
    });

    try {
      const content = await fetchLinkedPathContent(path);
      if (!content) {
        setErrorsByPathId((current) => ({
          ...current,
          [path.id]: 'This linked demo is unavailable or has no steps in the selected range.',
        }));
        return;
      }

      setLinkedContentByPathId((current) => ({ ...current, [path.id]: content }));
    } finally {
      setLoadingPathIds((current) => {
        const next = new Set(current);
        next.delete(path.id);
        return next;
      });
    }
  }, []);

  const selectPath = useCallback(
    (branchId: string, path: LinkedPeacockPath) => {
      setSelectedPathByBranchId((current) => ({ ...current, [branchId]: path.id }));
      setLinkedContentByPathId((current) => {
        if (current[path.id]) return current;
        void loadPath(path);
        return current;
      });
    },
    [loadPath],
  );

  useEffect(() => {
    for (const branch of branches) {
      const firstPath = sortBranchPaths(branch.paths)[0];
      if (!firstPath) continue;

      setSelectedPathByBranchId((current) => {
        if (current[branch.id]) return current;
        void loadPath(firstPath);
        return { ...current, [branch.id]: firstPath.id };
      });
    }
  }, [branches, loadPath]);

  return {
    selectedPathByBranchId,
    linkedContentByPathId,
    loadingPathIds,
    errorsByPathId,
    selectPath,
  };
}
