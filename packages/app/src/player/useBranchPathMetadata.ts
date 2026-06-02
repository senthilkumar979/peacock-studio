import { useEffect, useState } from 'react';
import { formatPathStepRange, getPlayableStepRange, sortBranchPaths } from '@peacock/shared';
import type { FlowBranch } from '@peacock/shared';
import { getFlowDocument } from '@/services/flowLibraryService';

export interface BranchPathMeta {
  pathId: string;
  rangeLabel: string;
  stepCount: number;
}

export function useBranchPathMetadata(branch: FlowBranch): Record<string, BranchPathMeta> {
  const [metaByPathId, setMetaByPathId] = useState<Record<string, BranchPathMeta>>({});

  useEffect(() => {
    let cancelled = false;
    const paths = sortBranchPaths(branch.paths);

    void (async () => {
      const next: Record<string, BranchPathMeta> = {};
      for (const path of paths) {
        const doc = await getFlowDocument(path.targetDocumentId);
        if (!doc) {
          next[path.id] = { pathId: path.id, rangeLabel: 'Demo unavailable', stepCount: 0 };
          continue;
        }
        const slice = getPlayableStepRange(doc.steps, path.fromStepId, path.toStepId);
        next[path.id] = {
          pathId: path.id,
          rangeLabel: formatPathStepRange(doc.steps, path.fromStepId, path.toStepId),
          stepCount: slice?.length ?? 0,
        };
      }
      if (!cancelled) setMetaByPathId(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [branch]);

  return metaByPathId;
}
