import { Link } from 'react-router-dom';
import { ExternalLink, Map, Trash2 } from 'lucide-react';
import type { FlowMapNodeStatus, WorkflowGraphNode, WorkflowGraphNodeContext } from '@peacock/shared';
import { getStepScreenshotUrl } from '@peacock/shared';
import { getFlowMapsDetailPath } from '@/constants/routes';
import { FlowMapStatusPicker } from '@/workflow-artifacts/FlowMapStatusPicker';
import { FLOW_MAP_KIND_THEMES } from '@/workflow-artifacts/flowMapCanvasTheme';
import type { FlowMapStickyNoteData } from '@/workflow-artifacts/workflowGraphLayout';
import { getDocumentStepShareUrl } from '@/utils/shareLink';

export type FlowMapInspectorSelection =
  | { type: 'node'; node: WorkflowGraphNode; context?: WorkflowGraphNodeContext }
  | { type: 'sticky'; noteId: string; data: FlowMapStickyNoteData };

interface FlowMapNodeInspectorProps {
  selection: FlowMapInspectorSelection;
  documentId: string;
  screenshotUrls: Record<string, string>;
  isEditMode: boolean;
  reviewerNote?: string;
  nodeStatus?: FlowMapNodeStatus;
  onStatusChange?: (status: FlowMapNodeStatus | undefined) => void;
  onReviewerNoteChange?: (note: string) => void;
  onStickyTextChange?: (text: string) => void;
  onDeleteSticky?: () => void;
}

export const FlowMapNodeInspector = ({
  selection,
  documentId,
  screenshotUrls,
  isEditMode,
  reviewerNote,
  nodeStatus,
  onStatusChange,
  onReviewerNoteChange,
  onStickyTextChange,
  onDeleteSticky,
}: FlowMapNodeInspectorProps) => {
  if (selection.type === 'sticky') {
    return (
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-10 sm:left-auto sm:right-4 sm:max-w-sm">
        <div className="pointer-events-auto overflow-hidden rounded-2xl border border-amber-200/90 bg-amber-50/95 shadow-2xl shadow-slate-900/10 ring-1 ring-white backdrop-blur-md">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
              Sticky note
            </p>
          </div>
          <div className="space-y-3 px-4 py-3">
            {isEditMode ? (
              <textarea
                value={selection.data.text}
                onChange={(event) => onStickyTextChange?.(event.target.value)}
                rows={4}
                placeholder="Add a review note…"
                className="w-full resize-none rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-peacock-400 focus:outline-none focus:ring-2 focus:ring-peacock-100"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {selection.data.text || 'Empty note'}
              </p>
            )}
            {isEditMode ? (
              <button
                type="button"
                onClick={onDeleteSticky}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Delete note
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const { node, context } = selection;
  const theme = FLOW_MAP_KIND_THEMES[node.kind];
  const Icon = theme.icon;
  const step = context?.kind === 'step' ? context.step : null;
  const screenshotUrl = step ? getStepScreenshotUrl(step, screenshotUrls) : null;
  const stepId = step?.id;
  const path = context?.kind === 'path' ? context.path : null;

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-10 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-slate-900/10 ring-1 ring-white backdrop-blur-md">
        <div className={`bg-gradient-to-r ${theme.gradient} px-4 py-2.5`}>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-white" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
              {theme.label}
              {typeof node.stepNumber === 'number' ? ` · Step ${node.stepNumber}` : ''}
            </p>
          </div>
        </div>
        <div className="space-y-3 px-4 py-3">
          {screenshotUrl ? (
            <img
              src={screenshotUrl}
              alt=""
              className="h-28 w-full rounded-lg border border-slate-200 object-cover object-top"
            />
          ) : null}
          <div>
            <p className="text-sm font-bold text-slate-900">{node.label}</p>
            {node.description ? (
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{node.description}</p>
            ) : (
              <p className="mt-1 text-xs italic text-slate-400">No additional description.</p>
            )}
          </div>
          {step?.notes ? (
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Step notes
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-700">{step.notes}</p>
            </div>
          ) : null}
          {step?.event?.type ? (
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              {step.event.type}
            </span>
          ) : null}
          {isEditMode && onStatusChange ? (
            <FlowMapStatusPicker value={nodeStatus} onChange={onStatusChange} />
          ) : nodeStatus && !isEditMode ? (
            <p className="text-xs text-slate-500">
              Status: <span className="font-medium text-slate-700">{nodeStatus.replace('_', ' ')}</span>
            </p>
          ) : null}
          {isEditMode && onReviewerNoteChange ? (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Reviewer note
              </label>
              <textarea
                value={reviewerNote ?? ''}
                onChange={(event) => onReviewerNoteChange(event.target.value)}
                rows={3}
                placeholder="Add review feedback…"
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-peacock-400 focus:outline-none focus:ring-2 focus:ring-peacock-100"
              />
            </div>
          ) : reviewerNote ? (
            <div className="rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                Reviewer note
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-900">{reviewerNote}</p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {stepId ? (
              <a
                href={getDocumentStepShareUrl(documentId, stepId)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-peacock-50 px-3 py-1.5 text-xs font-semibold text-peacock-700 ring-1 ring-peacock-100 hover:bg-peacock-100"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Open in flow doc
              </a>
            ) : null}
            {path?.targetDocumentId ? (
              <Link
                to={getFlowMapsDetailPath(path.targetDocumentId)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-100 hover:bg-cyan-100"
              >
                <Map className="h-3.5 w-3.5" aria-hidden />
                Target flow map
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
