import { ExternalLink } from 'lucide-react';
import {
  countStepResources,
  getPlayableSteps,
  getStepResourcesForStep,
  resolveResourceLabel,
  type FlowOutlineItem,
  type StepResource,
} from '@peacock/shared';
import { getDocumentStepAnchor } from '@/utils/shareLink';

interface FlowDocResourceEntry {
  stepId: string;
  stepNumber: number;
  stepTitle: string;
  anchorId: string;
  resources: StepResource[];
}

export function buildFlowDocResourceEntries(
  steps: FlowOutlineItem[],
  stepResources: StepResource[],
): FlowDocResourceEntry[] {
  const playable = getPlayableSteps(steps);
  const entries: FlowDocResourceEntry[] = [];

  playable.forEach((step, index) => {
    const resources = getStepResourcesForStep(stepResources, step.id);
    if (resources.length === 0) return;
    entries.push({
      stepId: step.id,
      stepNumber: index + 1,
      stepTitle: step.title,
      anchorId: getDocumentStepAnchor(step.id),
      resources,
    });
  });

  return entries;
}

interface FlowDocResourcesOverviewProps {
  documentId: string;
  steps: FlowOutlineItem[];
  stepResources: StepResource[];
}

export const FlowDocResourcesOverview = ({
  documentId,
  steps,
  stepResources,
}: FlowDocResourcesOverviewProps) => {
  const entries = buildFlowDocResourceEntries(steps, stepResources);
  if (entries.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Resources</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {countStepResources(stepResources)} links
        </span>
      </div>
      <ul className="mt-4 space-y-4">
        {entries.map((entry) => (
          <li key={entry.stepId} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <a
              href={`/docs/${documentId}?view=doc#${entry.anchorId}`}
              className="text-sm font-semibold text-peacock-700 hover:underline"
            >
              Step {entry.stepNumber}: {entry.stepTitle}
            </a>
            <ul className="mt-2 space-y-2">
              {entry.resources.map((resource) => (
                <li key={resource.id}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-peacock-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{resolveResourceLabel(resource)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
};

export function countResourcesForOutline(
  steps: FlowOutlineItem[],
  stepResources: StepResource[],
): number {
  const stepIds = new Set(getPlayableSteps(steps).map((step) => step.id));
  return stepResources.filter((resource) => stepIds.has(resource.stepId)).length;
}
