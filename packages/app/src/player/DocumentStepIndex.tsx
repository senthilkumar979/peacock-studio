import { DocumentOutlineNavItem } from './DocumentOutlineNavItem';
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
}: DocumentStepIndexProps) => (
  <aside className="hidden h-full min-h-0 lg:block min-w-[350px]">
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Outline
      </p>
      <nav className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        <ol className="space-y-2 py-2 px-1">
          {items.map((item) => {
            const itemId = getDocumentStepIndexItemId(item);
            return (
              <li key={itemId}>
                <DocumentOutlineNavItem
                  item={item}
                  isActive={itemId === activeItemId}
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
