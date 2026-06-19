import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { sortBranchPaths, type FlowBranch } from '@peacock/shared';
import type { DocumentStepIndexItem } from '@/player/documentStepIndexTypes';
import { getDocumentStepIndexItemId } from '@/player/documentStepIndexTypes';
import {
  parseLinkedDocumentStepAnchor,
  resolveLinkedPathIdFromAnchor,
} from '@/utils/shareLink';

interface UseDocumentHashNavigationOptions {
  branches: FlowBranch[];
  selectedPathByBranchId: Record<string, string>;
  linkedContentByPathId: Record<string, unknown>;
  selectPath: (branchId: string, path: FlowBranch['paths'][number]) => void;
  indexItemsRef: RefObject<DocumentStepIndexItem[]>;
  setActiveItemId: (itemId: string) => void;
  scrollToHash: (anchorId: string) => void;
}

function getOutlineItemIdForHash(
  hash: string,
  indexItems: DocumentStepIndexItem[],
): string | null {
  const target = indexItems.find((item) => item.anchorId === hash);
  if (target) return getDocumentStepIndexItemId(target);

  const linkedStep = parseLinkedDocumentStepAnchor(hash);
  if (linkedStep) return `${linkedStep.pathId}:${linkedStep.stepId}`;

  return null;
}

export function useDocumentHashNavigation({
  branches,
  selectedPathByBranchId,
  linkedContentByPathId,
  selectPath,
  indexItemsRef,
  setActiveItemId,
  scrollToHash,
}: UseDocumentHashNavigationOptions): void {
  const pendingHashRef = useRef<string | null>(null);
  const branchesRef = useRef(branches);
  const selectedPathByBranchIdRef = useRef(selectedPathByBranchId);
  const selectPathRef = useRef(selectPath);

  branchesRef.current = branches;
  selectedPathByBranchIdRef.current = selectedPathByBranchId;
  selectPathRef.current = selectPath;

  const tryScrollToHash = useCallback(
    (hash: string) => {
      if (!document.getElementById(hash)) return false;

      const itemId = getOutlineItemIdForHash(hash, indexItemsRef.current ?? []);
      if (itemId) setActiveItemId(itemId);

      window.requestAnimationFrame(() => {
        scrollToHash(hash);
      });
      pendingHashRef.current = null;
      return true;
    },
    [indexItemsRef, scrollToHash, setActiveItemId],
  );

  const applyHash = useCallback(
    (hash: string) => {
      if (!hash) return;

      pendingHashRef.current = hash;
      const linkedPathId = resolveLinkedPathIdFromAnchor(hash);

      if (linkedPathId) {
        for (const branch of branchesRef.current) {
          const path = sortBranchPaths(branch.paths).find((item) => item.id === linkedPathId);
          if (!path) continue;

          if (selectedPathByBranchIdRef.current[branch.id] !== linkedPathId) {
            selectPathRef.current(branch.id, path);
            return;
          }
          break;
        }
      }

      tryScrollToHash(hash);
    },
    [tryScrollToHash],
  );

  const applyHashRef = useRef(applyHash);
  applyHashRef.current = applyHash;

  useEffect(() => {
    const syncFromHash = () => {
      applyHashRef.current(window.location.hash.replace(/^#/, ''));
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    const hash = pendingHashRef.current;
    if (!hash) return;
    tryScrollToHash(hash);
  }, [linkedContentByPathId, selectedPathByBranchId, tryScrollToHash]);
}
