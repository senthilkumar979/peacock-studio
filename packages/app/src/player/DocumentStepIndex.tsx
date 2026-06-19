import { useEffect, useMemo, useRef } from 'react';
import { DocumentOutlineLinkedPathGroup } from './DocumentOutlineLinkedPathGroup';
import { DocumentOutlineNavItem } from './DocumentOutlineNavItem';
import {
  groupDocumentStepIndexItems,
  isLinkedPathGroupActive,
} from './documentStepIndexGroups';
import {
  getDocumentStepIndexItemId,
  type DocumentStepIndexItem,
} from './documentStepIndexTypes';

export type { DocumentStepIndexItem } from './documentStepIndexTypes';

interface DocumentStepIndexProps {
  items: DocumentStepIndexItem[];
  activeItemId: string | null;
  onSelectOverview: (anchorId: string, itemId: string) => void;
  onSelectStep: (anchorId: string, stepId: string) => void;
  onSelectSection: (anchorId: string, sectionId: string) => void;
  onSelectBranch: (anchorId: string, branchId: string) => void;
  onSelectLinkedPath: (anchorId: string, itemId: string) => void;
}

export const DocumentStepIndex = ({
  items,
  activeItemId,
  onSelectOverview,
  onSelectStep,
  onSelectSection,
  onSelectBranch,
  onSelectLinkedPath,
}: DocumentStepIndexProps) => {
  const activeItemRef = useRef<HTMLLIElement>(null);
  const entries = useMemo(() => groupDocumentStepIndexItems(items), [items]);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeItemId]);

  return (
    <aside className="hidden h-full min-h-0 lg:block min-w-[350px]">
      <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Outline
        </p>
        <nav className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <ol className="space-y-2 px-1 py-2">
            {entries.map((entry) => {
              if (entry.type === 'linkedPathGroup') {
                const isGroupActive = isLinkedPathGroupActive(entry, activeItemId);
                return (
                  <li
                    key={`path-group:${entry.pathId}`}
                    ref={isGroupActive ? activeItemRef : undefined}
                  >
                    <DocumentOutlineLinkedPathGroup
                      group={entry}
                      activeItemId={activeItemId}
                      isGroupActive={isGroupActive}
                      onSelectLinkedPath={onSelectLinkedPath}
                      onSelectStep={onSelectStep}
                    />
                  </li>
                );
              }

              const itemId = getDocumentStepIndexItemId(entry.item);
              const isActive = itemId === activeItemId;
              return (
                <li key={itemId} ref={isActive ? activeItemRef : undefined}>
                  <DocumentOutlineNavItem
                    item={entry.item}
                    isActive={isActive}
                    onSelectOverview={onSelectOverview}
                    onSelectStep={onSelectStep}
                    onSelectSection={onSelectSection}
                    onSelectBranch={onSelectBranch}
                    onSelectLinkedPath={onSelectLinkedPath}
                  />
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </aside>
  );
};
