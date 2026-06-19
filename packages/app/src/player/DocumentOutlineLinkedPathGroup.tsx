import { Route } from 'lucide-react';
import { getPathAccentColors } from './documentAccentColors';
import type { DocumentStepIndexLinkedPathGroup } from './documentStepIndexGroups';
import { getDocumentStepIndexItemId } from './documentStepIndexTypes';

interface DocumentOutlineLinkedPathGroupProps {
  group: DocumentStepIndexLinkedPathGroup;
  activeItemId: string | null;
  isGroupActive: boolean;
  onSelectLinkedPath: (anchorId: string, itemId: string) => void;
  onSelectStep: (anchorId: string, stepId: string) => void;
}

export const DocumentOutlineLinkedPathGroup = ({
  group,
  activeItemId,
  isGroupActive,
  onSelectLinkedPath,
  onSelectStep,
}: DocumentOutlineLinkedPathGroupProps) => {
  const pathItemId = getDocumentStepIndexItemId(group.pathItem);
  const isPathActive = pathItemId === activeItemId;
  const accent = getPathAccentColors(group.pathId);

  return (
    <div
      className={`ml-4 border-l-2 pl-3 ${
        isGroupActive ? accent.borderLeft : accent.borderLeftMuted
      }`}
    >
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onSelectLinkedPath(group.pathItem.anchorId, pathItemId)}
          title={group.pathItem.fullPathLabel}
          className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${
            isPathActive
              ? `${accent.bgSubtle} font-semibold ${accent.textActive}`
              : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Route className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${accent.icon}`} aria-hidden />
          <span className="min-w-0 truncate leading-5">{group.pathItem.pathLabel}</span>
        </button>

        {group.steps.map((step) => {
          const isStepActive = step.stepId === activeItemId;
          return (
            <button
              key={step.stepId}
              type="button"
              onClick={() => onSelectStep(step.anchorId, step.stepId)}
              className={`flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left text-sm transition ${
                isStepActive
                  ? `${accent.bgActive} ${accent.textActive} ring-1 ${accent.ringActive}`
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span
                className={`mt-0.5 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isStepActive ? `${accent.stepBadgeActive} text-white` : 'bg-slate-100 text-slate-600'
                }`}
              >
                {step.stepNumber}
              </span>
              <span className="line-clamp-2 leading-5">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
